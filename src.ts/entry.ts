import * as eth from "ethers";

import { ledger, getLedgerSigner } from "./ledger";
import { env, provider, wallets } from "./constants";
import { eth2, tokens, uniswap } from "./lib";
import { log, sqrt, toHumanReadable } from "./utils";
import { initLiq } from "./initLiq";

console.log(`Connected to provider ${env.ethProviderUrl.split("/").splice(0, 3).join("/")}`);

// Attach exported utils to global for easy access in the console
const setGlobal = (key: string, value: any): void => {
  (global as any)[key] = value;
};

setGlobal("eth2", eth2);
setGlobal("uniswap", uniswap);

setGlobal("AAVE", tokens.AAVE);
setGlobal("COMP", tokens.COMP);
setGlobal("DAI", tokens.DAI);
setGlobal("MKR", tokens.MKR);
setGlobal("UNI", tokens.UNI);
setGlobal("USDC", tokens.USDC);
setGlobal("WBTC", tokens.WBTC);
setGlobal("WETH", tokens.WETH);
setGlobal("YFI", tokens.YFI);

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
