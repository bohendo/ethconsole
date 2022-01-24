import { FunctionFragment, EventFragment, ParamType } from "@ethersproject/abi";

import * as MappingChallenge from "../artifacts/src.sol/capturetheether/MappingChallenge.sol/MappingChallenge.json";
import * as DonationSolver from "../artifacts/src.sol/capturetheether/DonationSolver.sol/DonationSolver.json";
import * as FuzzyIdentitySolver from "../artifacts/src.sol/capturetheether/FuzzyIdentitySolver.sol/FuzzyIdentitySolver.json";
import * as FuzzyIdentitySolution from "../artifacts/src.sol/capturetheether/FuzzyIdentitySolver.sol/FuzzyIdentitySolution.json";
import * as FiftyYearsSolver from "../artifacts/src.sol/capturetheether/FiftyYearsSolver.sol/FiftyYearsSolver.json";
import * as MappingSolver from "../artifacts/src.sol/capturetheether/MappingSolver.sol/MappingSolver.json";
import * as GuessTheNewNumberSolver from "../artifacts/src.sol/capturetheether/GuessTheNewNumberSolver.sol/GuessTheNewNumberSolver.json";
import * as PredictTheFutureSolver from "../artifacts/src.sol/capturetheether/PredictTheFutureSolver.sol/PredictTheFutureSolver.json";
import * as TokenSaleSolver from "../artifacts/src.sol/capturetheether/TokenSaleSolver.sol/TokenSaleSolver.json";
import * as TokenWhaleSolver from "../artifacts/src.sol/capturetheether/TokenWhaleSolver.sol/TokenWhaleSolver.json";
import * as RetirementFundSolver from "../artifacts/src.sol/capturetheether/RetirementFundSolver.sol/RetirementFundSolver.json";
import * as ForceSend from "../artifacts/src.sol/capturetheether/ForceSend.sol/ForceSend.json";
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
  MappingChallenge,
  MappingSolver,
  DonationSolver,
  FuzzyIdentitySolver,
  FuzzyIdentitySolution,
  FiftyYearsSolver,
  GuessTheNewNumberSolver,
  PredictTheFutureSolver,
  TokenSaleSolver,
  TokenWhaleSolver,
  RetirementFundSolver,
  ForceSend,
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
  MappingChallenge,
  MappingSolver,
  DonationSolver,
  FuzzyIdentitySolver,
  FuzzyIdentitySolution,
  FiftyYearsSolver,
  GuessTheNewNumberSolver,
  PredictTheFutureSolver,
  TokenSaleSolver,
  TokenWhaleSolver,
  RetirementFundSolver,
  ForceSend,
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
