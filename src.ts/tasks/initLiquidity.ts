import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, EtherSymbol, Zero } from "@ethersproject/constants";
import { formatEther, parseEther } from "@ethersproject/units";
import { task, types } from "hardhat/config";
import pino from "pino";

import { getIntermediateSwapAmount, getTokenSafeMinimums, getTokenNames } from "../utils";

export default task("init-liquidity", "Initialize an investment into liquidity for various Uniswap pairs")
  .addParam("amount", "The decimal amount of ETH to invest", "1", types.string)
  .addParam("pairs", "A list of liquidity pair addresss to invest into", [], types.json)
  .addParam("allocations", "A list of allocation percentages for each liquidity pair", [], types.json)
  .addParam("signerAddress", "The address that will make the investmetn & pay for gas", AddressZero, types.string)
  .addOptionalParam("minTokens", "A list of minimal tokens to receive during intermediate swaps", [], types.json)
  .addOptionalParam("logLevel", "'debug', 'info' (default), 'warn', 'error', 'silent'", "info", types.string)
  .setAction(async (args, hre): Promise<string> => {
    const { amount, pairs, allocations, logLevel, signerAddress, minTokens } = args;
    const log = pino({ level: logLevel || "info" });

    const factory = await (hre.ethers as any).getContract("UniswapFactory", signerAddress);
    const router = await (hre.ethers as any).getContract("UniswapRouter", signerAddress);
    const weth = await (hre.ethers as any).getContract("WETH", signerAddress);

    ////////////////////////////////////////
    // Check to ensure valid input was provided

    log.info(`Verifying provided parameters..`);

    if (!(minTokens.length === 0 || minTokens === 4)) {
      throw new Error(`If you supply min tokens it must include 4 entries, not ${pairs.length}`);
    }

    if (pairs.length !== 4) {
      throw new Error(`You must supply exactly 4 pairs but you supplied ${pairs.length}`);
    }

    if (allocations.length !== 4) {
      throw new Error(`You must supply exactly 4 allocations but you supplied ${allocations.length}`);
    }

    let ethAllocations = [] as BigNumber[];
    let totalAllocation = Zero;
    for (const allocation of allocations) {
      totalAllocation = totalAllocation.add(BigNumber.from(allocation));
      ethAllocations.push(parseEther(amount).mul(allocation).div(100))
    }
    if (!totalAllocation.eq(BigNumber.from("100"))) {
      throw new Error(`Fatal: all allocations must add up to exactly 100 (got ${totalAllocation})`);
    }

    ////////////////////////////////////////
    // Determine the minimum tokens to receive from intermediate swaps

    log.info(`Determining the minimum amount of tokens we should receive..`);

    const tokenNames = [] as string[];
    const tokenMinimums = [] as string[];
    for (let i = 0; i < pairs.length; i++) {
      const pairAddress = pairs[i]
      const pair = await (hre.ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);
      const token0 = await pair.token0();
      let wethReserves;
      let tokenReserves;
      let token;
      if (token0 === weth.address) {
        [wethReserves, tokenReserves,] = await pair.getReserves();
        token = await (hre.ethers as any).getContractAt(
          "FakeToken",
          await pair.token1(),
          signerAddress,
        );
      } else {
        [tokenReserves, wethReserves,] = await pair.getReserves();
        token = await (hre.ethers as any).getContractAt(
          "FakeToken",
          token0,
          signerAddress,
        );
      }
      tokenNames.push(await token.name());
      // Use provided safety limits if provided, else get current chain state & base mins off that
      if (minTokens.lenth === 4) {
        tokenMinimums.push(minTokens[i]);
      } else {
        const amountOut = await router.getAmountOut(
          getIntermediateSwapAmount(ethAllocations[i], wethReserves),
          wethReserves,
          tokenReserves,
        );
        tokenMinimums.push(amountOut.mul(995).div(1000).toString());
      }
    }

    ////////////////////////////////////////
    // Deploy the liquidity manager & initialize LP investments

    log.info(`Preparing to invest a total of ${amount} ${EtherSymbol}:`);
    for (let i = 0; i < pairs.length; i++) {
      const alloc = `${formatEther(ethAllocations[i])} ${EtherSymbol}`
      log.info(`- ${alloc} into pair ${pairs[i]} (via >=${formatEther(tokenMinimums[i])} ${tokenNames[i]})`);
    }

    const deployment = await hre.deployments.deploy("LiquidityManager", {
      from: signerAddress,
      args: [
        weth.address,
        pairs,
        allocations,
        tokenMinimums,
      ],
      value: parseEther(amount),
    });

    const tx = await hre.ethers.provider.getTransaction(deployment.transactionHash!);
    const receipt = await hre.ethers.provider.getTransactionReceipt(deployment.transactionHash!);

    log.info(`Success! Consumed ${receipt.gasUsed} gas worth ${
      formatEther(receipt.gasUsed.mul(tx.gasPrice))
    } ${EtherSymbol}`);

    return deployment.address;

  });

