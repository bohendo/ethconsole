/* eslint-disable import/order */

// To easily add deployments for a new network, copy paste one of the following blocks
//   then, search/replace network name (eg rinkeby) + chain id (eg 4)

export const deployments = {} as any;

////////////////////////////////////////
// 1 - mainnet
import * as mainnetAAVE from "../deployments/mainnet/AAVE.json";
import * as mainnetCOMP from "../deployments/mainnet/COMP.json";
import * as mainnetDAI from "../deployments/mainnet/DAI.json";
import * as mainnetMKR from "../deployments/mainnet/MKR.json";
import * as mainnetUNI from "../deployments/mainnet/UNI.json";
import * as mainnetUniswapFactory from "../deployments/mainnet/UniswapFactory.json";
import * as mainnetUniswapRouter from "../deployments/mainnet/UniswapRouter.json";
import * as mainnetWBTC from "../deployments/mainnet/WBTC.json";
import * as mainnetWETH from "../deployments/mainnet/WETH.json";
import * as mainnetYFI from "../deployments/mainnet/YFI.json";
const mainnetDeployment = {
  AAVE: mainnetAAVE,
  COMP: mainnetCOMP,
  DAI: mainnetDAI,
  MKR: mainnetMKR,
  UNI: mainnetUNI,
  UniswapFactory: mainnetUniswapFactory,
  UniswapRouter: mainnetUniswapRouter,
  WBTC: mainnetWBTC,
  WETH: mainnetWETH,
  YFI: mainnetYFI,
};
deployments.mainnet = mainnetDeployment;
deployments["1"] = mainnetDeployment;

////////////////////////////////////////
// 1337 - localhost
import * as localhostFakeAAVE from "../deployments/localhost/FakeAAVE.json";
import * as localhostFakeCOMP from "../deployments/localhost/FakeCOMP.json";
import * as localhostFakeMKR from "../deployments/localhost/FakeMKR.json";
import * as localhostFakeUNI from "../deployments/localhost/FakeUNI.json";
import * as localhostFakeWBTC from "../deployments/localhost/FakeWBTC.json";
import * as localhostFakeYFI from "../deployments/localhost/FakeYFI.json";
import * as localhostUniswapFactory from "../deployments/localhost/UniswapFactory.json";
import * as localhostUniswapRouter from "../deployments/localhost/UniswapRouter.json";
import * as localhostWETH from "../deployments/localhost/WETH.json";
const localhostDeployment = {
  AAVE: localhostFakeAAVE,
  COMP: localhostFakeCOMP,
  MKR: localhostFakeMKR,
  UNI: localhostFakeUNI,
  UniswapFactory: localhostUniswapFactory,
  UniswapRouter: localhostUniswapRouter,
  WBTC: localhostFakeWBTC,
  WETH: localhostWETH,
  YFI: localhostFakeYFI,
};
deployments.localhost = localhostDeployment;
deployments["1337"] = localhostDeployment;

