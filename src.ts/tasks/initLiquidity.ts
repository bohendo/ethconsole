import { AddressZero, EtherSymbol } from "@ethersproject/constants";
import { parseEther } from "@ethersproject/units";
import { utils } from "ethers";
import { task, types } from "hardhat/config";
import pino from "pino";

export default task("init-liquidity", "Initialize an investment into liquidity for various Uniswap pairs")
  .addParam("amount", "The amount of ETH to invest", "1", types.string)
  .addParam("pairs", "A list of liquidity pair addresss to invest into", [], types.json)
  .addParam("allocations", "A list of allocation percentages for each liquidity pair", [], types.json)
  .addParam("signerAddress", "The address that will make the investmetn & pay for gas", AddressZero, types.string)
  .addOptionalParam("logLevel", "'debug', 'info' (default), 'warn', 'error', 'silent'", "info", types.string)
  .setAction(async (args, hre): Promise<void> => {
    const { amount, pairs, allocations, logLevel, signerAddress } = args;
    const log = pino({ level: logLevel || "info" });

    log.info(`Preparing to invest in pairs: ${pairs} w allocations: ${allocations}`);
    const factory = await (hre.ethers as any).getContract("UniswapFactory", signerAddress);
    const weth = await (hre.ethers as any).getContract("WETH", signerAddress);

    if (pairs.length !== 4) {
      throw new Error(`You must supply exactly 4 pairs but you supplied ${pairs.length}`);
    }

    if (allocations.length !== 4) {
      throw new Error(`You must supply exactly 4 allocations but you supplied ${allocations.length}`);
    }

    const safetyRatios = [] as string[];
    for (const pairAddress of pairs) {
      const pair = await (hre.ethers as any).getContractAt("UniswapPair", pairAddress, signerAddress);
      const token0 = await pair.token0();
      let wethReserves
      let tokenReserves
      if (token0 === weth.address) {
        [wethReserves, tokenReserves,] = await pair.getReserves();
      } else {
        [tokenReserves, wethReserves,] = await pair.getReserves();
      }
      safetyRatios.push(wethReserves.mul(100000).div(tokenReserves));
    }

    const deployment = await hre.deployments.deploy("LiquidityManager", {
      from: signerAddress,
      args: [
        weth.address,
        pairs,
        allocations,
        safetyRatios,
      ],
    });

    const tx = await hre.ethers.provider.getTransaction(deployment.transactionHash!);
    const receipt = await hre.ethers.provider.getTransactionReceipt(deployment.transactionHash!);

    console.log(`Spent ${receipt.gasUsed} worth ${receipt.gasUsed.mul(tx.gasPrice)} ${EtherSymbol}`);

  });

