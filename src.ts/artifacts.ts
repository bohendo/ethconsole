import { FunctionFragment, EventFragment, ParamType } from "@ethersproject/abi";

import * as Scratchpad from "../artifacts/src.sol/Scratchpad.sol/Scratchpad.json";
// Tokens
import * as FakeToken from "../artifacts/src.sol/tokens/FakeToken.sol/FakeToken.json";
import * as LINK from "../artifacts/src.sol/tokens/LINK.sol/LINK.json";
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
  Scratchpad,
  FakeToken,
  LINK,
  WETH,
  UniswapFactory,
  UniswapPair,
  UniswapRouter,
};

export {
  Scratchpad,
  FakeToken,
  LINK,
  WETH,
  UniswapFactory,
  UniswapPair,
  UniswapRouter,
};

