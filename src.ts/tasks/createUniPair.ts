import { Zero } from "@ethersproject/constants";
import { formatEther, parseEther } from "@ethersproject/units";
import { keccak256 } from "@ethersproject/keccak256";
import { task } from "hardhat/config";
import pino from "pino";

export default task("create-uni-pair", "Create a new UNI pair")
  .addParam("tokenA", "The 1st token of the Uniswap pair")
  .addParam("tokenB", "The 2nd token of the Uniswap pair")
  .addParam("amountA", "How many tokenAs to supply for initial liquidity")
  .addParam("amountB", "How many tokenBs to supply for initial liquidity")
  .addParam("signerAddress", "The address that will sign the creation tx & pay for gas")
  .addOptionalParam("logLevel", "One of 'debug', 'info', 'warn', 'error', 'silent' (default: info)")
  .setAction(async (args, hre): Promise<void> => {
    const { amountA, amountB, logLevel, signerAddress, tokenA, tokenB } = args;
    const log = pino({ level: logLevel || "info" });
    const factory = await (hre.ethers as any).getContract("UniswapFactory", signerAddress);
    const router = await (hre.ethers as any).getContract("UniswapRouter", signerAddress);

    const pairAddress = await factory.getPair(tokenA, tokenB);
    const pairCode = await hre.ethers.provider.getCode(pairAddress);
    let tx;

    if (pairCode.replace(/^0x/, "") === "") {
      log.info(`Using the factory at ${factory.address} to create a pair for ${tokenA} & ${tokenB}`);
      tx = await factory.createPair(tokenA, tokenB);
      await tx.wait();
      log.info(`Successfully created pair at ${pairAddress} via tx ${tx.hash}`);
    } else {
      log.info(`A pair has already been created at ${pairAddress} for ${tokenA} & ${tokenB}`);
    }

    log.info(`Pair init code hash: ${keccak256(await factory.pairCreationCode())}`);

    const pair = await (hre.ethers as any).getContractAt("UniswapPair", pairAddress);
    const reserves = await pair.getReserves();
    if (reserves[0].eq(Zero)) {
      const TokenA = await (hre.ethers as any).getContractAt("FakeToken", tokenA, signerAddress);
      await (await TokenA.approve(router.address, parseEther(amountA))).wait();
      log.debug(`Successfully approved ${router.address} to spend ${parseEther(amountA)} ${tokenA}`);
      const TokenB = await (hre.ethers as any).getContractAt("FakeToken", tokenB, signerAddress);
      await (await TokenB.approve(router.address, parseEther(amountB))).wait();
      log.debug(`Successfully approved ${router.address} to spend ${parseEther(amountB)} ${tokenB}`);
      tx = await router.addLiquidity(
        tokenA,
        tokenB,
        parseEther(amountA),
        parseEther(amountB),
        parseEther(amountA),
        parseEther(amountB),
        signerAddress,
        Date.now() + 180 * 1000,
      );
      log.info(`Successfully added liquidity of ${amountA} ${tokenA} and ${amountB} ${tokenB}`);
    } else {
      log.info(`Pair ${pairAddress} has reserves of ${
        formatEther(reserves[0])
      } and ${formatEther(reserves[1])}`);
    }

  });
