import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";

import depositAbi from "./Deposit.json";

// TODO: what should we do about ens names on localnet?
// resolved address: "0x00000000219ab540356cBB839Cbe05303d7705Fa"
export const eth2Deposit = new Contract("depositcontract.eth", depositAbi, provider);
