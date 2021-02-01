import { ContractFactory, utils } from "ethers";

import { provider } from "../../constants";
import { artifacts } from "../../artifacts";

export const liqManagerFactory = ContractFactory.fromSolidity(artifacts["LiquidityManager"]);
