import { BigNumber } from "@ethersproject/bignumber";
import { EtherSymbol, One, Zero } from "@ethersproject/constants";
import { formatEther } from "@ethersproject/units";
import { deployments, ethers, getNamedAccounts, getChainId, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";

import { logger } from "../constants";

const func: DeployFunction = async () => {
  const log = logger.child({ module: "Deploy" });
  const chainId = await getChainId();
  const provider = ethers.provider;
  const { deployer } = await getNamedAccounts();

  // Log initial state
  const balance = await provider.getBalance(deployer);
  const nonce = await provider.getTransactionCount(deployer);
  log.info(`Preparing to deploy scratchpad to chain ${chainId}`);
  log.info(`Deployer address=${deployer} nonce=${nonce} balance=${formatEther(balance)}`);

  if (balance.eq(Zero)) {
    throw new Error(`Account ${deployer} has zero balance on chain ${chainId}, aborting migration`);
  }

  // Only deploy scratchpad on a local network
  if (network.name === "hardhat" || network.name === "localhost") {
    log.info(`Running localnet migration`);
    for (const row of [
      ["Scratchpad", []],
    ]) {
      const name = row[0] as string;
      const args = row[1] as Array<string | BigNumber>;
      // Replace deployment names with addresses
      for (let i = 0; i < args.length; i++) {
        if (typeof args[i] !== "string") continue;
        const a = await deployments.get(args[i] as string);
        if (a?.address) args[i] = a.address;
      }
      log.info(`Deploying ${name} with args [${args.join(", ")}]`);
      await deployments.deploy(name, { from: deployer, args });
      const deployment = await deployments.get(name);
      if (!deployment.transactionHash) {
        throw new Error(`Failed to deploy ${name}`);
      }
      const tx = await provider.getTransaction(deployment.transactionHash!);
      log.info(`Sent transaction to deploy ${name}, txHash: ${deployment.transactionHash}`);
      const receipt = await provider.getTransactionReceipt(deployment.transactionHash!);
      log.info(
        `Success! Consumed ${receipt.gasUsed} gas worth ${EtherSymbol} ${formatEther(
          (receipt.gasUsed || Zero).mul(tx.gasPrice || One),
        )} deploying ${name} to address: ${deployment.address}`,
      );
    }

  // Don't run these migrations on mainnet or public testnets
  } else {
    throw new Error(`Scratchpad deployment to chain ${chainId} is not supported`);
  }

  ////////////////////////////////////////
  // Print summary
  log.info("All done!");
  const spent = formatEther(balance.sub(await provider.getBalance(deployer)));
  const nTx = (await provider.getTransactionCount(deployer)) - nonce;
  log.info(`Sent ${nTx} transaction${nTx === 1 ? "" : "s"} & spent ${EtherSymbol} ${spent} deploying scratchpad`);
  log.info(` `);
};
export default func;
module.exports.tags = ["Scratchpad"];
