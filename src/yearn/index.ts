import { Contract, utils } from "ethers";

import { provider } from "../utils";

import StrategyMKRVaultDAIDelegateAbi from "./StrategyMKRVaultDAIDelegate.json";
import yGovAbi from "./yGov.json";
import yVaultAbi from "./yVault.json";
import ControllerAbi from "./Controller.json";
import oneSplitAbi from "./oneSplit.json";

export const StrategyMKRVaultDAIDelegate = new Contract(
  "0x932fc4fd0eEe66F22f1E23fBA74D7058391c0b15",
  new utils.Interface(StrategyMKRVaultDAIDelegateAbi),
  provider,
);

export const oneSplit = new Contract(
  "0x50fda034c0ce7a8f7efdaebda7aa7ca21cc1267e",
  new utils.Interface(oneSplitAbi),
  provider,
);

export const yGov = new Contract(
  "0xBa37B002AbaFDd8E89a1995dA52740bbC013D992",
  new utils.Interface(yGovAbi),
  provider,
);

export const Controller = new Contract(
  "0x9E65Ad11b299CA0Abefc2799dDB6314Ef2d91080",
  new utils.Interface(ControllerAbi),
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
