import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";

import daiAbi from "./dai.json";

export const dai = new Contract(
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  new Interface(daiAbi),
  provider,
);
