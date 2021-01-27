import * as eth from "ethers";

import { ledger, getLedgerSigner } from "./ledger";
import { log, provider, wallet, toHumanReadable } from "./utils";

import * as eth2 from "./eth2";
import * as maker from "./maker";
import { usdc } from "./tokens";
import * as tornado from "./tornado";
import * as uniswap from "./uniswap";
import * as yearn from "./yearn";

// Attach exported utils to global for easy access in the console
const setGlobal = (key: string, value: any): void => {
  (global as any)[key] = value;
};

setGlobal("eth2", eth2);
setGlobal("maker", maker);
setGlobal("tornado", tornado);
setGlobal("usdc", usdc);
setGlobal("uniswap", uniswap);
setGlobal("yearn", yearn);

setGlobal("toHumanReadable", toHumanReadable);
setGlobal("eth", eth);
setGlobal("ledger", ledger);
setGlobal("getLedgerSigner", getLedgerSigner);
setGlobal("log", log);
setGlobal("provider", provider);
setGlobal("wallet", wallet);
