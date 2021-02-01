import { BigNumber } from "@ethersproject/bignumber";
import { EtherSymbol, Zero } from "@ethersproject/constants";
import { formatEther, parseEther } from "@ethersproject/units";
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
  log.info(`Preparing to deploy tokens to chain ${chainId}`);
  log.info(`Deployer address=${deployer} nonce=${nonce} balance=${formatEther(balance)}`);

  if (balance.eq(Zero)) {
    throw new Error(`Account ${deployer} has zero balance on chain ${chainId}, aborting migration`);
  }

  ////////////////////////////////////////
  // Run the migration

  // Only deploy tokens on a local network
  if (network.name === "hardhat" || network.name === "localhost") {
    log.info(`Running localnet migration`);
    for (const row of [
      ["WETH", []],
      ["FakeAAVE", []],
      ["FakeCOMP", []],
      ["FakeMKR", []],
      ["FakeUNI", []],
      ["FakeWBTC", []],
      ["FakeYFI", []],
    ]) {
      const name = row[0] as string;
      const args = row[1] as Array<string | BigNumber>;
      log.info(`Deploying ${name} with args [${args.join(", ")}]`);
      await deployments.deploy(name, { from: deployer, args });
      const deployment = await deployments.get(name);
      if (!deployment.transactionHash) {
        throw new Error(`Failed to deploy ${name}`);
      }
      const tx = await provider.getTransaction(deployment.transactionHash!);
      const receipt = await provider.getTransactionReceipt(deployment.transactionHash!);
      log.info(`Sent transaction to deploy ${name}, txHash: ${deployment.transactionHash}`);
      log.info(
        `Success! Consumed ${receipt.gasUsed} gas worth ${EtherSymbol} ${formatEther(
          (receipt.gasUsed || Zero).mul(tx.gasPrice),
        )} deploying ${name} to address: ${deployment.address}`,
      );
    }

    const weth = await (ethers as any).getContract("WETH");
    const wethBal = await weth.balanceOf(deployer);
    if (wethBal.eq(Zero)) {
      await (await weth.deposit({ value: parseEther("100000") })).wait();
      log.info(`Deposited a bunch of ETH to generate ${await weth.balanceOf(deployer)} WETH`);
    } else {
      log.info(`The deployer already has a balance of ${wethBal} WETH`);
    }

  // Don't run these migrations on mainnet or public testnets
  } else {
    throw new Error(`Token deployment to chain ${chainId} is not supported`);
  }

  ////////////////////////////////////////
  // Print summary
  log.info("All done!");
  const spent = formatEther(balance.sub(await provider.getBalance(deployer)));
  const nTx = (await provider.getTransactionCount(deployer)) - nonce;
  log.info(`Sent ${nTx} transaction${nTx === 1 ? "" : "s"} & spent ${EtherSymbol} ${spent} deploying tokens`);
  log.info(` `);
};
export default func;
module.exports.tags = ["Token"];
