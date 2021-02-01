import { ContractFactory } from "@ethersproject/contracts";

import { artifacts } from "../../artifacts";

export const liqManagerFactory = ContractFactory.fromSolidity(artifacts["LiquidityManager"]);
