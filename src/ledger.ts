import { LedgerSigner } from "@ethersproject/hardware-wallets";

import { provider } from "./utils";

const hdWalletPath = index => `44'/60'/${index}'/0/0`

export const getLedgerSigner = (index: number): LedgerSigner =>
  new LedgerSigner(provider, "hid", hdWalletPath(index));

export const ledger = getLedgerSigner(0);
