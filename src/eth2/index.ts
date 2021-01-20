import { Contract, utils } from "ethers";

import { provider } from "../utils";

import depositAbi from "./Deposit.json";

export const eth2Deposit = new Contract("0x00000000219ab540356cBB839Cbe05303d7705Fa", depositAbi, provider)
