import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, EtherSymbol, Zero } from "@ethersproject/constants";
import { formatEther, parseEther } from "@ethersproject/units";
import { deployments, ethers, getNamedAccounts, getChainId, network, run } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";

import { env, logger } from "../constants";

const func: DeployFunction = async () => {
  const log = logger.child({ module: "Deploy" });
  const chainId = await getChainId();
  const provider = ethers.provider;
  const { deployer } = await getNamedAccounts();

  // Log initial state
  const balance = await provider.getBalance(deployer);
  const nonce = await provider.getTransactionCount(deployer);
  log.info(`Preparing to deploy Uniswap & seed liquidity on chain ${chainId}`);
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
    const tx = await provider.getTransaction(deployment.transactionHash!);
    const receipt = await provider.getTransactionReceipt(deployment.transactionHash!);
    log.info(`Sent transaction to deploy ${name}, txHash: ${deployment.transactionHash}`);
    log.info(
      `Success! Consumed ${receipt.gasUsed} gas worth ${EtherSymbol} ${formatEther(
        (receipt.gasUsed || Zero).mul(tx.gasPrice),
      )} deploying ${name} to address: ${deployment.address}`,
    );
  };

  // Only deploy uniswap on a local network
  if (network.name === "hardhat" || network.name === "localhost") {
    log.info(`Running localnet migration`);
    for (const row of [
      ["WETH", []],
      ["UniswapFactory", [AddressZero]],
      ["UniswapRouter", ["UniswapFactory", "WETH"]],
      ["FakeAAVE", []],
      ["FakeCOMP", []],
      ["FakeMKR", []],
      ["FakeUNI", []],
      ["FakeWBTC", []],
      ["FakeYFI", []],
    ]) {
      const name = row[0] as string;
      const args = row[1] as Array<string | BigNumber>;
      await migrate(name, args);
    }

    const weth = await (ethers as any).getContract("WETH");
    const wethBal = await weth.balanceOf(deployer);
    if (wethBal.eq(Zero)) {
      await (await weth.deposit({ value: parseEther("100000") })).wait();
      log.info(`Deposited a bunch of ETH to generate ${await weth.balanceOf(deployer)} WETH`);
    } else {
      log.info(`The deployer already has a balance of ${wethBal} WETH`);
    }

    for (const [name, price] of [
      ["FakeAAVE", "4.5"],
      ["FakeCOMP", "5.6"],
      ["FakeMKR", "0.95"],
      ["FakeUNI", "91.1"],
      ["FakeWBTC", "0.041"],
      ["FakeYFI", "0.045"],
    ]) {
      const token = await (ethers as any).getContract(name);
      log.info(`Creating uniswap pair for ${name}`);
      await run("create-uni-pair", {
        signerAddress: deployer,
        tokenA: weth.address,
        tokenB: token.address,
        amountA: "10000",
        amountB: formatEther(parseEther(price).mul(10000)),
        logLevel: env.logLevel,
      });
    }

  // Don't run these migrations on mainnet or public testnets
  } else {
    throw new Error(`Uniswap deployment to chain ${chainId} is not supported`);
  }

  ////////////////////////////////////////
  // Print summary
  log.info("All done!");
  const spent = formatEther(balance.sub(await provider.getBalance(deployer)));
  const nTx = (await provider.getTransactionCount(deployer)) - nonce;
  log.info(`Sent ${nTx} transaction${nTx === 1 ? "" : "s"} & spent ${EtherSymbol} ${spent}`);
};
export default func;
