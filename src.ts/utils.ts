import { BigNumber } from "@ethersproject/bignumber";
import { parseEther } from "@ethersproject/units";
import { Contract, getDefaultProvider, providers, utils, Wallet } from "ethers";

import { artifacts } from "./artifacts";
import { alice, bob, defaultLogLevel } from "./constants";

const env = {
  ethProviderUrl: process?.env?.ETH_PROVIDER || undefined,
  mnemonic:
    process?.env?.ETH_MNEMONIC ||
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
};

if (env.ethProviderUrl) {
  console.log(`Connecting to provider ${env.ethProviderUrl.split("/").splice(0, 3).join("/")}`);
} else {
  console.warn("Connecting to default provider");
}

export const provider = env.ethProviderUrl
  ? new providers.JsonRpcProvider(env.ethProviderUrl)
  : getDefaultProvider("homestead");

export const wallet = Wallet.fromMnemonic(env.mnemonic).connect(provider);

export const toHumanReadable = (abi: any) => (new utils.Interface(abi)).format();

export const log = (msg: any) => {
  const prefix = `\n`;
  if (typeof msg === "string") {
    console.log(msg);
  } else if (typeof msg === "object") {
    if (msg._isBigNumber) {
      console.log(prefix + utils.formatEther(msg));
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

export const getContract = async (
  name: string,
  address?: string,
  ethers?: any, // hardhat-deploy-ethers
): Promise<Contract> => {
  if (ethers && address && typeof ethers.getContractAt === "function") {
    return ethers.getContractAt(name, address);

  } else if (ethers && typeof ethers.getContract === "function") {
    return ethers.getContract(name);

  } else if (address) { // TODO: how should we handle ENS names? Esp on localnet..
    if (artifacts[name] && artifacts[name].abi) {
      return new Contract(address, artifacts[name].abi, provider);
    } else {
      throw new Error(`No artifacts or ABI are available for ${name}`);
    }

  } else {
    throw new Error(
      `Either an address or hardhat-deploy-ethers must be provided to get contract ${name}`,
    );
  }
};

export const getTokenNames = async (
  wethAddress: string,
  pairs: string[],
  ethers?: any,
): Promise<string[]> => {
  const tokenNames = [] as string[];
  for (let i = 0; i < pairs.length; i++) {
    const pairAddress = pairs[i];
    const pair = await getContract("UniswapPair", pairAddress, ethers);
    const token0 = await pair.token0();
    let token;
    if (token0 === wethAddress) {
      token = await getContract("FakeToken", await pair.token1(), ethers);
    } else {
      token = await getContract("FakeToken", token0, ethers);
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
  ethers: any,
): Promise<string[]> => {
  const tokenMinimums = [] as string[];
  const router = await (ethers as any).getContract("UniswapRouter");
  for (let i = 0; i < pairs.length; i++) {
    const pairAddress = pairs[i];
    const pair = await (ethers as any).getContractAt("UniswapPair", pairAddress);
    const token0 = await pair.token0();
    let wethReserves;
    let tokenReserves;
    let token;
    if (token0 === wethAddress) {
      [wethReserves, tokenReserves] = await pair.getReserves();
      token = await (ethers as any).getContractAt(
        "FakeToken",
        await pair.token1(),
      );
    } else {
      [tokenReserves, wethReserves] = await pair.getReserves();
      token = await (ethers as any).getContractAt(
        "FakeToken",
        token0,
      );
    }
    const amountOut = await router.getAmountOut(
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
