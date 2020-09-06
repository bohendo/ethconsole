import { Contract, utils } from "ethers";

import { provider } from "../utils";

import StrategyMKRVaultDAIDelegateAbi from "./StrategyMKRVaultDAIDelegate.json";
import YearnGovernanceAbi from "./YearnGovernance.json";
import yVaultAbi from "./yVault.json";

export const StrategyMKRVaultDAIDelegate = new Contract(
  "0x932fc4fd0eEe66F22f1E23fBA74D7058391c0b15",
  new utils.Interface(StrategyMKRVaultDAIDelegateAbi),
  provider,
);

export const YearnGovernance = new Contract(
  "0xBa37B002AbaFDd8E89a1995dA52740bbC013D992",
  new utils.Interface(YearnGovernanceAbi),
  provider,
);

export const yDai = new Contract(
  "0xACd43E627e64355f1861cEC6d3a6688B31a6F952",
  new utils.Interface(yVaultAbi),
  provider,
);

export const yWeth = new Contract(
  "0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7",
  new utils.Interface(yVaultAbi),
  provider,
);
