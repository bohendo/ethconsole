import { HDNode } from "@ethersproject/hdnode";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, getDefaultProvider, providers, utils } from "ethers";
import pino from "pino";

export const env = {
  logLevel: process?.env?.LOG_LEVEL || "info",
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

export const logger = pino({ level: env.logLevel });

const hdNode = HDNode.fromMnemonic(env.mnemonic).derivePath("m/44'/60'/0'/0");

export const wallets: Wallet[] = Array(10)
  .fill(0)
  .map((_, idx) => {
    const wallet = new Wallet(hdNode.derivePath(idx.toString()).privateKey, provider);
    return wallet;
  });

export const chainIdReq = provider.getNetwork().then(net => net.chainId);
export const alice = wallets[0];
export const bob = wallets[1];
export const rando = wallets[2];
