import { HDNode } from "@ethersproject/hdnode";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, getDefaultProvider, providers, utils } from "ethers";
import pino from "pino";

export const env = {
  hardhat: process?.env?.ETHCONSOLE_HARDHAT || "",
  logLevel: process?.env?.LOG_LEVEL || "info",
  ethProviderUrl: process?.env?.ETH_PROVIDER || "http://localhost:8545",
  mnemonic:
    process?.env?.ETH_MNEMONIC ||
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
};

// This provider should only be used from the console, in tests use hre.ethers.provider
export const provider = new providers.JsonRpcProvider(env.ethProviderUrl);

export const logger = pino({ level: env.logLevel });

const hdNode = HDNode.fromMnemonic(env.mnemonic).derivePath("m/44'/60'/0'/0");
export const wallets: Wallet[] = Array(10)
  .fill(0)
  .map((_, idx) => {
    const wallet = new Wallet(hdNode.derivePath(idx.toString()).privateKey, provider);
    return wallet;
  });

export const alice = wallets[0];
export const bob = wallets[1];
export const rando = wallets[2];

export const chainIdReq = provider.getNetwork().then(
  net => net.chainId,
).catch(
  e => {
    if (!env.hardhat) {
      console.log(`Failed to get chainId for provider ${env.ethProviderUrl}: ${e.message}`);
    }
  },
);
