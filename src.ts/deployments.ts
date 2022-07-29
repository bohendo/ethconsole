/* eslint-disable import/order */

// To easily add deployments for a new network, copy paste one of the following blocks
//   then, search/replace both: network name (eg mainnet) & chain id (eg 1)

export const deployments = {} as any;

////////////////////////////////////////
// 1 - mainnet
import * as mainnetAAVE from "../deployments/mainnet/AAVE.json";
import * as mainnetCOMP from "../deployments/mainnet/COMP.json";
import * as mainnetUniswapPair_ETH_AAVE from "../deployments/mainnet/UniswapPair_ETH_AAVE.json";
import * as mainnetUniswapPair_ETH_COMP from "../deployments/mainnet/UniswapPair_ETH_COMP.json";
import * as mainnetUniswapPair_ETH_MKR from "../deployments/mainnet/UniswapPair_ETH_MKR.json";
import * as mainnetUniswapPair_ETH_UNI from "../deployments/mainnet/UniswapPair_ETH_UNI.json";
import * as mainnetUniswapPair_ETH_WBTC from "../deployments/mainnet/UniswapPair_ETH_WBTC.json";
import * as mainnetUniswapPair_ETH_YFI from "../deployments/mainnet/UniswapPair_ETH_YFI.json";
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
  Uni_ETH_AAVE: mainnetUniswapPair_ETH_AAVE,
  Uni_ETH_COMP: mainnetUniswapPair_ETH_COMP,
  Uni_ETH_MKR: mainnetUniswapPair_ETH_MKR,
  Uni_ETH_UNI: mainnetUniswapPair_ETH_UNI,
  Uni_ETH_WBTC: mainnetUniswapPair_ETH_WBTC,
  Uni_ETH_YFI: mainnetUniswapPair_ETH_YFI,
  UniswapRouter: mainnetUniswapRouter,
  WBTC: mainnetWBTC,
  WETH: mainnetWETH,
  YFI: mainnetYFI,
};
deployments.mainnet = mainnetDeployment;
deployments["1"] = mainnetDeployment;
deployments[1] = mainnetDeployment;

/*
////////////////////////////////////////
// 1337 - localhost
import * as Scratchpad from "../deployments/localhost/Scratchpad.json";
const localhostDeployment = {
  Scratchpad,
};
deployments.localhost = localhostDeployment;
deployments["1337"] = localhostDeployment;
deployments[1337] = localhostDeployment;
*/

////////////////////////////////////////
// 80001 - mumbai
import * as LensHub from "../deployments/mumbai/LensHub.json";
import * as LensHubProxy from "../deployments/mumbai/LensHubProxy.json";
const mumbaiDeployment = {
  LensHub,
  LensHubProxy,
};
deployments.mumbai = mumbaiDeployment;
deployments["80001"] = mumbaiDeployment;
deployments[80001] = mumbaiDeployment;

