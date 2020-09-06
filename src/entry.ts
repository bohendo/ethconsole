import * as eth from "ethers";

import { ledger } from "./ledger";
import { log, provider, wallet, toHumanReadable } from "./utils";

import * as yearn from "./yearn";
import * as maker from "./maker";

// Attach exported utils to global for easy access in the console
const setGlobal = (key: string, value: any): void => {
  (global as any)[key] = value;
};

setGlobal("yearn", yearn);
setGlobal("maker", maker);
setGlobal("toHumanReadable", toHumanReadable);
setGlobal("eth", eth);
setGlobal("ledger", ledger);
setGlobal("log", log);
setGlobal("provider", provider);
setGlobal("wallet", wallet);
