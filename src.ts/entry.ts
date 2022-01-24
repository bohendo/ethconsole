import { Contract } from "@ethersproject/contracts";
import * as eth from "ethers";

import * as cte from "./capturetheether";
import { env, provider, wallets } from "./constants";
import { artifacts } from "./artifacts";
import { deployments } from "./deployments";
import { initLiq } from "./initLiq";
import { ledger, getLedgerSigner } from "./ledger";
import { log, sqrt, toHumanReadable, traceStorage } from "./utils";

// Will console.log if any of the target addresses can be derived from the given mnemonic
const checkMnemonic = (mnemonic: string, targets: string[]): void => {
  for (const path of [
    ...Array(1000).fill(0).map((e, i) => `m/44'/60'/0'/0/${i}`),
    ...Array(1000).fill(0).map((e, i) => `m/44'/60'/0'/${i}/0`),
    ...Array(1000).fill(0).map((e, i) => `m/44'/60'/${i}'/0/0`),
    ...Array(1000).fill(0).map((e, i) => `m/44'/60'/0'/${i}`),
    "m/44'/60'/0'/25446", "m/44'/60'/0'/0/25446", // special counterfactual paths
  ]) {
    const address = eth.Wallet.fromMnemonic(mnemonic, path).address.toLowerCase();
    targets.filter(t => t.toLowerCase() === address).forEach(target => {
      console.log(`Found ${target} at ${path}`);
    });
  }
};

////////////////////////////////////////
/// Add various utils & constants to the global scope

// Attach exported utils to global for easy access in the console
const setGlobal = (key: string, value: any): void => {
  (global as any)[key] = value;
};

setGlobal("artifacts", artifacts);
setGlobal("BN", eth.BigNumber.from);
setGlobal("checkMnemonic", checkMnemonic);
setGlobal("cte", cte);
setGlobal("eth", eth);
setGlobal("getLedgerSigner", getLedgerSigner);
setGlobal("initLiq", initLiq);
setGlobal("ledger", ledger);
setGlobal("log", log);
setGlobal("provider", provider);
setGlobal("sqrt", sqrt);
setGlobal("toHumanReadable", toHumanReadable);
setGlobal("traceStorage", traceStorage);
setGlobal("wallets", wallets);

for (const constant of Object.keys(eth.constants)) {
  setGlobal(constant, eth.constants[constant]);
}

for (const util of Object.keys(eth.utils)) {
  setGlobal(util, eth.utils[util]);
}

////////////////////////////////////////
/// Add deployed contract instances to the global scope

provider.getNetwork().then(network => {
  console.log(`Successfully connected to chain ${network.chainId} via provider ${
    env.ethProviderUrl.split("/").splice(0, 3).join("/")
  }`);
  for (const key of Object.keys(deployments[network.chainId] || {})) {
    console.log(`Loading ${key} contract`);
    const deployment = deployments[network.chainId][key];
    setGlobal(key, new Contract(deployment.address, deployment.abi, provider));
  }
  process.stdout.write(`> `);
});
