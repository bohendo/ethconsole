import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { ContractFactory } from "@ethersproject/contracts";
import { EtherSymbol, Zero } from "@ethersproject/constants";
import { formatEther, parseEther } from "@ethersproject/units";

import { artifacts } from "./artifacts";
import { logger } from "./constants";
import { getTokenNames, getTokenSafeMinimums } from "./utils";

export const initLiq = async (
  wethAddress: string,
  amount: string,
  pairs: string[],
  allocations: string[],
  signer: Signer,
  minTokens: string[] = [],
): Promise<any> => {
  const log = logger.child({ module: "InitLiquidity" });
  const provider = signer.provider;
  if (!provider) {
    throw new Error(`Fatal: signer must be connect to a provider`);
  }

  log.info(`Verifying provided parameters..`);

  if (!(minTokens.length === 0 || minTokens.length === 4)) {
    throw new Error(`If you supply min tokens it must include 4 entries, not ${minTokens.length}`);
  }

  if (pairs.length !== 4) {
    throw new Error(`You must supply exactly 4 pairs but you supplied ${pairs.length}`);
  }

  if (allocations.length !== 4) {
    throw new Error(`You must supply exactly 4 allocations but you supplied ${allocations.length}`);
  }

  const ethAllocations = [] as BigNumber[];
  let totalAllocation = Zero;
  for (const allocation of allocations) {
    totalAllocation = totalAllocation.add(BigNumber.from(allocation));
    ethAllocations.push(parseEther(amount).mul(allocation).div(100));
  }
  if (!totalAllocation.eq(BigNumber.from("100"))) {
    throw new Error(`Fatal: all allocations must add up to exactly 100 (got ${totalAllocation})`);
  }

  const tokenNames = await getTokenNames(wethAddress, pairs, provider);

  let tokenMinimums: string[];
  log.info(`Provided min tokens: ${minTokens}`);
  if (minTokens.length === 4) {
    log.warn(`Using provided token minimums instead of determining them from chain state`);
    tokenMinimums = minTokens;
  } else {
    log.info(`Determining the minimum amount of tokens we should receive form chain state..`);
    tokenMinimums = await getTokenSafeMinimums(
      wethAddress,
      amount,
      pairs,
      allocations,
      provider,
    );
  }

  log.info(`Preparing to invest a total of ${amount} ${EtherSymbol}:`);
  for (let i = 0; i < pairs.length; i++) {
    log.info(`- ${formatEther(ethAllocations[i])} ${EtherSymbol} into pair ${
      pairs[i]
    } (via >=${formatEther(tokenMinimums[i])} ${tokenNames[i]})`);
  }

  const factory = ContractFactory.fromSolidity(artifacts["InitLiquidity"]).connect(signer);
  const deployment = await factory.deploy(
    wethAddress,
    pairs,
    allocations,
    tokenMinimums,
    { value: parseEther(amount) },
  );
  const receipt = await provider.getTransactionReceipt(deployment.deployTransaction.hash);
  log.info(`Success! consumed ${receipt.gasUsed} gas worth ${
    formatEther(receipt.gasUsed.mul(deployment.deployTransaction.gasPrice))
  } ${EtherSymbol} initializing liquidity`);
  return deployment;
};
