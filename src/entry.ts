import * as eth from "ethers";

import { ledger, getLedgerSigner } from "./ledger";
import { log, provider, wallet, toHumanReadable } from "./utils";

import { usdc } from "./tokens";
import * as maker from "./maker";
import * as yearn from "./yearn";
import * as tornado from "./tornado";

// Attach exported utils to global for easy access in the console
const setGlobal = (key: string, value: any): void => {
  (global as any)[key] = value;
};

setGlobal("tornado", tornado);
setGlobal("maker", maker);
setGlobal("yearn", yearn);
setGlobal("usdc", usdc);

setGlobal("toHumanReadable", toHumanReadable);
setGlobal("eth", eth);
setGlobal("ledger", ledger);
setGlobal("getLedgerSigner", getLedgerSigner);
setGlobal("log", log);
setGlobal("provider", provider);
setGlobal("wallet", wallet);
