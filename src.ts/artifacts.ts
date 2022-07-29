import { FunctionFragment, EventFragment, ParamType } from "@ethersproject/abi";

// Tokens
import * as FakeAAVE from "../artifacts/src.sol/tokens/FakeAAVE.sol/FakeAAVE.json";
import * as FakeCOMP from "../artifacts/src.sol/tokens/FakeCOMP.sol/FakeCOMP.json";
import * as FakeMKR from "../artifacts/src.sol/tokens/FakeMKR.sol/FakeMKR.json";
import * as FakeToken from "../artifacts/src.sol/tokens/FakeToken.sol/FakeToken.json";
import * as FakeUNI from "../artifacts/src.sol/tokens/FakeUNI.sol/FakeUNI.json";
import * as FakeWBTC from "../artifacts/src.sol/tokens/FakeWBTC.sol/FakeWBTC.json";
import * as FakeYFI from "../artifacts/src.sol/tokens/FakeYFI.sol/FakeYFI.json";
import * as WETH from "../artifacts/src.sol/weth.sol/WETH.json";
// ETH2
import * as DepositContract from "../artifacts/src.sol/eth2/Deposit.sol/DepositContract.json";
// Uniswap
import * as InitLiquidity from "../artifacts/src.sol/InitLiquidity.sol/InitLiquidity.json";
import * as LiquidityManager from "../artifacts/src.sol/LiquidityManager.sol/LiquidityManager.json";
import * as UniswapFactory from "../artifacts/src.sol/uniswap/factory.sol/UniswapFactory.json";
import * as UniswapPair from "../artifacts/src.sol/uniswap/pair.sol/UniswapPair.json";
import * as UniswapRouter from "../artifacts/src.sol/uniswap/router.sol/UniswapRouter.json";

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
