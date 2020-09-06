import { Contract, utils } from "ethers";

import { provider } from "../utils";

import daiAbi from "./dai.json";

export const dai = new Contract(
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  new utils.Interface(daiAbi),
  provider,
);
