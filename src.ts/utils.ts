import { Interface } from "@ethersproject/abi";
import { Provider } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { EtherSymbol, Zero } from "@ethersproject/constants";
import { formatEther, parseEther } from "@ethersproject/units";

import { artifacts } from "./artifacts";
import { logger } from "./constants";

export const toHumanReadable = (abi: any) => (new Interface(abi)).format();

export const log = (msg: any) => {
  const prefix = `\n`;
  if (typeof msg === "string") {
    console.log(msg);
  } else if (typeof msg === "object") {
    if (msg._isBigNumber) {
      console.log(prefix + formatEther(msg));
    } else {
      console.log(prefix + JSON.stringify(msg, undefined, 2));
    }
  }
};

export const sqrt = (n: BigNumber): BigNumber => {
  let z;
  if (n.gt(BigNumber.from(3))) {
    z = n;
    let x = n.div(2).add(1);
    while (x.lt(z)) {
      z = x;
      x = (n.div(x).add(x)).div(2);
    }
  } else if (!n.eq(0)) {
    z = BigNumber.from(1);
  }
  return z;
};

export const getIntermediateSwapAmount = (
  wethInvestment: BigNumber,
  wethReserve: BigNumber,
): BigNumber => {
    const b = wethReserve.mul(1997);
    const c = wethReserve.mul(3988000).mul(wethInvestment);
    const a = wethReserve.mul(wethReserve).mul(3988009);
    return ((sqrt(a.add(c))).sub(b)).div(1994);
};

// Typescript translation of UniswapLibrary.sol#getAmountOut
export const getAmountOut = (
  amountIn: BigNumber,
  reserveIn: BigNumber,
  reserveOut: BigNumber,
): BigNumber => {
  if (amountIn.eq(Zero)) {
    throw new Error(`getAmountOut: Insufficient amountIn`);
  }
  if (reserveIn.eq(Zero) || reserveOut.eq(Zero)) {
    throw new Error(`getAmountOut: Insufficient reserves`);
  }
  const amountInWithFee = amountIn.mul(997);
  const numerator = amountInWithFee.mul(reserveOut);
  const denominator = reserveIn.mul(1000).add(amountInWithFee);
  const amountOut = (numerator.mul(100).div(denominator)).div(100);
  return amountOut;
};

export const getContract = async (
  name: string,
  address: string,
  provider?: Provider,
): Promise<Contract> => {
  if (artifacts[name] && artifacts[name].abi) {
    return new Contract(address, artifacts[name].abi, provider);
  } else {
    throw new Error(`No artifacts or ABI are available for ${name}`);
  }
};

export const getTokenNames = async (
  wethAddress: string,
  pairs: string[],
  provider: Provider,
): Promise<string[]> => {
  const tokenNames = [] as string[];
  for (let i = 0; i < pairs.length; i++) {
    const pairAddress = pairs[i];
    const pair = await getContract("UniswapPair", pairAddress, provider);
    const token0 = await pair.token0();
    let token;
    if (token0 === wethAddress) {
      token = await getContract("FakeToken", await pair.token1(), provider);
    } else {
      token = await getContract("FakeToken", token0, provider);
    }
    tokenNames.push(await token.name());
  }
  return tokenNames;
};

export const getTokenSafeMinimums = async (
  wethAddress: string,
  ethInvestment: string,
  pairs: string[],
  allocations: string[],
  provider: Provider,
): Promise<string[]> => {
  const tokenMinimums = [] as string[];
  for (let i = 0; i < pairs.length; i++) {
    const pairAddress = pairs[i];
    const pair = await getContract("UniswapPair", pairAddress, provider);
    const token0 = await pair.token0();
    let wethReserves;
    let tokenReserves;
    if (token0 === wethAddress) {
      [wethReserves, tokenReserves] = await pair.getReserves();
    } else {
      [tokenReserves, wethReserves] = await pair.getReserves();
    }
    const amountOut = await getAmountOut(
      getIntermediateSwapAmount(
        parseEther(ethInvestment).mul(allocations[i]).div(100),
        wethReserves,
      ),
      wethReserves,
      tokenReserves,
    );
    tokenMinimums.push(amountOut.mul(995).div(1000).toString());
  }
  return tokenMinimums;
};

export const initLiquidity = async (
  wethAddress: string,
  amount: string,
  pairs: string[],
  allocations: string[],
  signer: Signer,
  minTokens: string[] = [],
): Promise<any> => {
  const log = logger.child({ module: "InitLiquidity" });
  const provider = signer.provider!;
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

  const factory = ContractFactory.fromSolidity(artifacts["LiquidityManager"]).connect(signer);
  const deployment = await factory.deploy(
    wethAddress,
    pairs,
    allocations,
    tokenMinimums,
    { value: parseEther(amount) },
  );
  await provider.getTransactionReceipt(deployment.deployTransaction.hash);
  return deployment;
};
