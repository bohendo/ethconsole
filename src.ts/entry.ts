import { Contract } from "@ethersproject/contracts";
import * as eth from "ethers";

import { env, provider, wallets } from "./constants";
import { deployments } from "./deployments";
import { initLiq } from "./initLiq";
import { ledger, getLedgerSigner } from "./ledger";
import { log, sqrt, toHumanReadable } from "./utils";

////////////////////////////////////////
/// Add various utils & constants to the global scope

// Attach exported utils to global for easy access in the console
const setGlobal = (key: string, value: any): void => {
  (global as any)[key] = value;
};

setGlobal("BN", eth.BigNumber.from);
setGlobal("eth", eth);
setGlobal("getLedgerSigner", getLedgerSigner);
setGlobal("initLiq", initLiq);
setGlobal("ledger", ledger);
setGlobal("log", log);
setGlobal("provider", provider);
setGlobal("sqrt", sqrt);
setGlobal("toHumanReadable", toHumanReadable);
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
  for (const key of Object.keys(deployments[network.chainId])) {
    console.log(`Loading ${key} contract`);
    const deployment = deployments[network.chainId][key];
    setGlobal(key, new Contract(deployment.address, deployment.abi, provider));
  }
  process.stdout.write(`> `);
});
