import { getDefaultProvider, providers, utils, Wallet } from "ethers";

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
      console.log(prefix + utils.formatEther(msg))
    } else {
      console.log(prefix + JSON.stringify(msg, undefined, 2))
    }
  }
}