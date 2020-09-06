import * as eth from "ethers";

import { ledger } from "./ledger";
import { log, provider, wallet } from "./utils";

import * as yearn from "./yearn";

// Attach exported utils to global for easy access in the console
const setGlobal = (key: string, value: any): void => {
  (global as any)[key] = value;
};

setGlobal("yearn", yearn);
setGlobal("eth", eth);
setGlobal("ledger", ledger);
setGlobal("log", log);
setGlobal("provider", provider);
setGlobal("wallet", wallet);
