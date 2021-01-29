import { parseEther } from "@ethersproject/units";
import { utils } from "ethers";
import { task, types } from "hardhat/config";
import pino from "pino";

export default task("init-liquidity", "Initialize an investment into liquidity for various Uniswap pairs")
  .addParam("amount", "The amount of ETH to invest", types.float)
  .addParam("pairs", "A list of liquidity pair addresss to invest into", types.json)
  .addParam("allocations", "A list of allocation percentages for each liquidity pair", types.json)
  .addParam("signerAddress", "The address that will make the investmetn & pay for gas", types.string)
  .addOptionalParam("logLevel", "'debug', 'info' (default), 'warn', 'error', 'silent'", types.string)
  .setAction(async (args, hre): Promise<void> => {
    const { amount, pairs, allocations, logLevel, signerAddress } = args;
    const log = pino({ level: logLevel || "info" });

    log.info(`Preparing to invest in pairs: ${pairs} w allocations: ${allocations}`);

  });

