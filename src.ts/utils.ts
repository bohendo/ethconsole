import { Interface } from "@ethersproject/abi";
import { Provider } from "@ethersproject/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { Contract } from "@ethersproject/contracts";
import { Zero } from "@ethersproject/constants";
import { formatEther, parseEther } from "@ethersproject/units";

import { artifacts } from "./artifacts";

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
