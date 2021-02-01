import * as eth from "ethers";

import { ledger, getLedgerSigner } from "./ledger";
import { provider, wallets } from "./constants";
import { eth2, liqManager, maker, tokens, uniswap } from "./lib";
import { log, sqrt, toHumanReadable } from "./utils";

// Attach exported utils to global for easy access in the console
const setGlobal = (key: string, value: any): void => {
  (global as any)[key] = value;
};

setGlobal("eth2", eth2);
setGlobal("liqManager", liqManager);
setGlobal("maker", maker);
setGlobal("uniswap", uniswap);
setGlobal("usdc", tokens.usdc);

setGlobal("BN", eth.BigNumber.from);
setGlobal("eth", eth);
setGlobal("getLedgerSigner", getLedgerSigner);
setGlobal("ledger", ledger);
setGlobal("log", log);
setGlobal("provider", provider);
setGlobal("sqrt", sqrt);
setGlobal("toHumanReadable", toHumanReadable);
setGlobal("wallets", wallets);
