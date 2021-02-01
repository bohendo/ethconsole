import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero, EtherSymbol, Zero } from "@ethersproject/constants";
import { keccak256 } from "@ethersproject/keccak256";
import { formatEther, parseEther } from "@ethersproject/units";
import { deployments, ethers, getNamedAccounts, getChainId, network } from "hardhat";
import { DeployFunction } from "hardhat-deploy/types";

import { logger } from "../constants";

const func: DeployFunction = async () => {
  const log = logger.child({ module: "DeployTokens" });
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
      ["UniswapFactory", [AddressZero]],
      ["UniswapRouter", ["UniswapFactory", "WETH"]],
    ]) {
      const name = row[0] as string;
      const args = row[1] as Array<string | BigNumber>;
      await migrate(name, args);
    }

    const weth = await (ethers as any).getContract("WETH");
    const factory = await (ethers as any).getContract("UniswapFactory", deployer);
    const router = await (ethers as any).getContract("UniswapRouter", deployer);

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

      const amountA = "10000";
      const amountB = formatEther(parseEther(price).mul(10000));

      let pairAddress = await factory.getPair(weth.address, token.address);
      let tx;

      if (pairAddress === AddressZero) {
        log.info(`Using the factory at ${factory.address} to create a pair for WETH & ${token.address}`);
        tx = await factory.createPair(weth.address, token.address);
        await tx.wait();
        pairAddress = await factory.getPair(weth.address, token.address);
        log.info(`Successfully created pair at ${pairAddress} via tx ${tx.hash}`);
      } else {
        log.info(`A pair has already been created at ${pairAddress} for ${weth.address} & ${token.address}`);
      }

      log.info(`Pair init code hash: ${keccak256(await factory.pairCreationCode())}`);

      const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress);
      const reserves = await pair.getReserves();
      if (reserves[0].eq(Zero)) {
        const TokenA = await (ethers as any).getContractAt("FakeToken", weth.address, deployer);
        await (await TokenA.approve(router.address, parseEther(amountA))).wait();
        log.debug(`Successfully approved ${router.address} to spend ${parseEther(amountA)} ${weth.address}`);
        const TokenB = await (ethers as any).getContractAt("FakeToken", token.address, deployer);
        await (await TokenB.approve(router.address, parseEther(amountB))).wait();
        log.debug(`Successfully approved ${router.address} to spend ${parseEther(amountB)} ${token.address}`);
        tx = await router.addLiquidity(
          weth.address,
          token.address,
          parseEther(amountA),
          parseEther(amountB),
          parseEther(amountA),
          parseEther(amountB),
          deployer,
          Date.now() + 180 * 1000,
        );
        log.info(`Successfully added liquidity of ${amountA} ${weth.address} and ${amountB} ${token.address}`);
      } else {
        log.info(`Pair ${pairAddress} has reserves of ${
          formatEther(reserves[0])
        } and ${formatEther(reserves[1])}`);
      }

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
module.exports.dependencies = ["Tokens"];
module.exports.tags = ["Uniswap"];
