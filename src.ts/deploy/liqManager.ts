import { BigNumber } from "@ethersproject/bignumber";
import { EtherSymbol, Zero } from "@ethersproject/constants";
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
  log.info(`Preparing to deploy LiquidityManager to chain ${chainId}`);
  log.info(`Deployer address=${deployer} nonce=${nonce} balance=${formatEther(balance)}`);

  if (balance.eq(Zero)) {
    throw new Error(`Account ${deployer} has zero balance on chain ${chainId}, aborting migration`);
  }

  ////////////////////////////////////////
  // Run the migration

  type Args = Array<string | BigNumber>;
  const migrate = async (name: string, args: Args): Promise<void> => {
    const processedArgs = await Promise.all(
      args.map(
        async (arg: any): Promise<any> => {
          try {
            return (await deployments.get(arg)).address;
          } catch (e) {
            return arg;
          }
        },
      ),
    );
    log.info(`Deploying ${name} with args [${processedArgs.join(", ")}]`);
    await deployments.deploy(name, { from: deployer, args: processedArgs });
    const deployment = await deployments.get(name);
    if (!deployment.transactionHash) {
      throw new Error(`Failed to deploy ${name}`);
    }
    const tx = await ethers.provider.getTransaction(deployment.transactionHash!);
    const receipt = await ethers.provider.getTransactionReceipt(deployment.transactionHash!);
    log.info(`Sent transaction to deploy ${name}, txHash: ${deployment.transactionHash}`);
    log.info(
      `Success! Consumed ${receipt.gasUsed} gas worth ${EtherSymbol} ${formatEther(
        (receipt.gasUsed || Zero).mul(tx.gasPrice),
      )} deploying ${name} to address: ${deployment.address}`,
    );
  };

  const standardMigration = [
    ["LiquidityManager", []],
  ];

  // Only deploy test fixtures during hardhat tests
  if (network.name === "hardhat") {
    log.info(`Running localnet migration`);
    for (const row of [
      ...standardMigration,
      ["WETH", []],
      ["UniswapFactory", []],
      ["UniswapRouter", ["UniswapFactory", "WETH"]],
      ["TestToken", []],
    ]) {
      const name = row[0] as string;
      const args = row[1] as Array<string | BigNumber>;
      await migrate(name, args);
    }

    // Don't migrate to mainnet until audit is finished
  } else if (chainId === "1") {
    log.info(`Running mainnet migration`);
    throw new Error(`Contract migration for chain ${chainId} is not supported yet`);

    // Default: run standard migration
  } else {
    log.info(`Running testnet migration`);
    for (const row of standardMigration) {
      const name = row[0] as string;
      const args = row[1] as Array<string | BigNumber>;
      await migrate(name, args);
    }
  }

  ////////////////////////////////////////
  // Print summary
  log.info("All done!");
  const spent = formatEther(balance.sub(await provider.getBalance(deployer)));
  const nTx = (await provider.getTransactionCount(deployer)) - nonce;
  log.info(`Sent ${nTx} transaction${nTx === 1 ? "" : "s"} & spent ${EtherSymbol} ${spent}`);
};
export default func;
