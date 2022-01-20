import { FunctionFragment, EventFragment, ParamType } from "@ethersproject/abi";

import * as GuessTheNewNumberSolver from "../artifacts/src.sol/capturetheether/GuessTheNewNumberSolver.sol/GuessTheNewNumberSolver.json";
import * as PredictTheFutureSolver from "../artifacts/src.sol/capturetheether/PredictTheFutureSolver.sol/PredictTheFutureSolver.json";
import * as DepositContract from "../artifacts/src.sol/eth2/Deposit.sol/DepositContract.json";
import * as FakeAAVE from "../artifacts/src.sol/testing/FakeAAVE.sol/FakeAAVE.json";
import * as FakeCOMP from "../artifacts/src.sol/testing/FakeCOMP.sol/FakeCOMP.json";
import * as FakeMKR from "../artifacts/src.sol/testing/FakeMKR.sol/FakeMKR.json";
import * as FakeToken from "../artifacts/src.sol/testing/FakeToken.sol/FakeToken.json";
import * as FakeUNI from "../artifacts/src.sol/testing/FakeUNI.sol/FakeUNI.json";
import * as FakeWBTC from "../artifacts/src.sol/testing/FakeWBTC.sol/FakeWBTC.json";
import * as FakeYFI from "../artifacts/src.sol/testing/FakeYFI.sol/FakeYFI.json";
import * as InitLiquidity from "../artifacts/src.sol/InitLiquidity.sol/InitLiquidity.json";
import * as LiquidityManager from "../artifacts/src.sol/LiquidityManager.sol/LiquidityManager.json";
import * as UniswapFactory from "../artifacts/src.sol/uniswap/factory.sol/UniswapFactory.json";
import * as UniswapPair from "../artifacts/src.sol/uniswap/pair.sol/UniswapPair.json";
import * as UniswapRouter from "../artifacts/src.sol/uniswap/router.sol/UniswapRouter.json";
import * as WETH from "../artifacts/src.sol/weth.sol/WETH.json";

// TODO: replace any with a real type
type Abi = Array<string | FunctionFragment | EventFragment | ParamType | any>;

type Artifact = {
  contractName: string;
  abi: Abi;
  bytecode: string;
  deployedBytecode: string;
};

type Artifacts = { [contractName: string]: Artifact };

export const artifacts: Artifacts = {
  GuessTheNewNumberSolver,
  PredictTheFutureSolver,
  DepositContract,
  FakeAAVE,
  FakeCOMP,
  FakeMKR,
  FakeToken,
  FakeUNI,
  FakeWBTC,
  FakeYFI,
  InitLiquidity,
  LiquidityManager,
  UniswapFactory,
  UniswapPair,
  UniswapRouter,
  WETH,
};

export {
  GuessTheNewNumberSolver,
  PredictTheFutureSolver,
  DepositContract,
  FakeAAVE,
  FakeCOMP,
  FakeMKR,
  FakeToken,
  FakeUNI,
  FakeWBTC,
  FakeYFI,
  InitLiquidity,
  LiquidityManager,
  UniswapFactory,
  UniswapPair,
  UniswapRouter,
  WETH,
};
