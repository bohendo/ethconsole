import { getDefaultProvider, providers, Wallet } from "ethers";

const env = {
  ethProviderUrl: process?.env?.ETH_PROVIDER || undefined,
  mnemonic:
    process?.env?.ETH_MNEMONIC ||
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
};

export const provider = env.ethProviderUrl
  ? new providers.JsonRpcProvider(env.ethProviderUrl)
  : getDefaultProvider("homestead");

export const wallet = Wallet.fromMnemonic(env.mnemonic).connect(provider);

export const log = (msg) => console.log(JSON.stringify(msg, undefined, 2));
