import { FunctionFragment, EventFragment, ParamType } from "@ethersproject/abi";

// Tokens
import * as FakeAAVE from "../artifacts/src.sol/tokens/FakeAAVE.sol/FakeAAVE.json";
import * as FakeCOMP from "../artifacts/src.sol/tokens/FakeCOMP.sol/FakeCOMP.json";
import * as FakeMKR from "../artifacts/src.sol/tokens/FakeMKR.sol/FakeMKR.json";
import * as FakeToken from "../artifacts/src.sol/tokens/FakeToken.sol/FakeToken.json";
import * as FakeUNI from "../artifacts/src.sol/tokens/FakeUNI.sol/FakeUNI.json";
import * as FakeWBTC from "../artifacts/src.sol/tokens/FakeWBTC.sol/FakeWBTC.json";
import * as FakeYFI from "../artifacts/src.sol/tokens/FakeYFI.sol/FakeYFI.json";
import * as WETH from "../artifacts/src.sol/tokens/weth.sol/WETH.json";
// Uniswap
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
  FakeAAVE,
  FakeCOMP,
  FakeMKR,
  FakeToken,
  FakeUNI,
  FakeWBTC,
  FakeYFI,
  UniswapFactory,
  UniswapPair,
  UniswapRouter,
  WETH,
};

export {
  FakeAAVE,
  FakeCOMP,
  FakeMKR,
  FakeToken,
  FakeUNI,
  FakeWBTC,
  FakeYFI,
  UniswapFactory,
  UniswapPair,
  UniswapRouter,
  WETH,
};
