/* eslint-disable import/order */

// To easily add deployments for a new network, copy paste one of the following blocks
//   then, search/replace network name (eg rinkeby) + chain id (eg 4)

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

////////////////////////////////////////
// 3 - Ropsten
import * as AccountTakeoverChallenge from "../deployments/ropsten/AccountTakeoverChallenge.json";
import * as AssumeOwnershipChallenge from "../deployments/ropsten/AssumeOwnershipChallenge.json";
import * as CaptureTheEther from "../deployments/ropsten/CaptureTheEther.json";
import * as DonationChallenge from "../deployments/ropsten/DonationChallenge.json";
import * as FiftyYearsChallenge from "../deployments/ropsten/FiftyYearsChallenge.json";
import * as FuzzyIdentityChallenge from "../deployments/ropsten/FuzzyIdentityChallenge.json";
import * as GuessTheNewNumberChallenge from "../deployments/ropsten/GuessTheNewNumberChallenge.json";
import * as GuessTheNumberChallenge from "../deployments/ropsten/GuessTheNumberChallenge.json";
import * as GuessTheRandomNumberChallenge from "../deployments/ropsten/GuessTheRandomNumberChallenge.json";
import * as GuessTheSecretNumberChallenge from "../deployments/ropsten/GuessTheSecretNumberChallenge.json";
import * as MappingChallenge from "../deployments/ropsten/MappingChallenge.json";
import * as NicknameChallenge from "../deployments/ropsten/NicknameChallenge.json";
import * as PredictTheFutureChallenge from "../deployments/ropsten/PredictTheFutureChallenge.json";
import * as PredictTheFutureSolver from "../deployments/ropsten/PredictTheFutureSolver.json";
import * as PublicKeyChallenge from "../deployments/ropsten/PublicKeyChallenge.json";
import * as RetirementFundChallenge from "../deployments/ropsten/RetirementFundChallenge.json";
import * as SimpleERC223Token from "../deployments/ropsten/SimpleERC223Token.json";
import * as TokenBankChallenge from "../deployments/ropsten/TokenBankChallenge.json";
import * as TokenSaleChallenge from "../deployments/ropsten/TokenSaleChallenge.json";
import * as TokenWhaleChallenge from "../deployments/ropsten/TokenWhaleChallenge.json";
const ropstenDeployment = {
  AccountTakeoverChallenge,
  AssumeOwnershipChallenge,
  CaptureTheEther,
  DonationChallenge,
  FiftyYearsChallenge,
  FuzzyIdentityChallenge,
  GuessTheNewNumberChallenge,
  GuessTheNumberChallenge,
  GuessTheRandomNumberChallenge,
  GuessTheSecretNumberChallenge,
  MappingChallenge,
  NicknameChallenge,
  PredictTheFutureChallenge,
  PredictTheFutureSolver,
  PublicKeyChallenge,
  RetirementFundChallenge,
  SimpleERC223Token,
  TokenBankChallenge,
  TokenSaleChallenge,
  TokenWhaleChallenge,
};
deployments.ropsten = ropstenDeployment;
deployments["3"] = ropstenDeployment;
deployments[3] = ropstenDeployment;

/*
////////////////////////////////////////
// 1337 - localhost
import * as localhostFakeAAVE from "../deployments/localhost/FakeAAVE.json";
import * as localhostFakeCOMP from "../deployments/localhost/FakeCOMP.json";
import * as localhostFakeMKR from "../deployments/localhost/FakeMKR.json";
import * as localhostFakeUNI from "../deployments/localhost/FakeUNI.json";
import * as localhostFakeWBTC from "../deployments/localhost/FakeWBTC.json";
import * as localhostFakeYFI from "../deployments/localhost/FakeYFI.json";
import * as localhostUniswapFactory from "../deployments/localhost/UniswapFactory.json";
import * as localhostUniswapPair_ETH_AAVE from "../deployments/localhost/UniswapPair_ETH_AAVE.json";
import * as localhostUniswapPair_ETH_COMP from "../deployments/localhost/UniswapPair_ETH_COMP.json";
import * as localhostUniswapPair_ETH_MKR from "../deployments/localhost/UniswapPair_ETH_MKR.json";
import * as localhostUniswapPair_ETH_UNI from "../deployments/localhost/UniswapPair_ETH_UNI.json";
import * as localhostUniswapPair_ETH_WBTC from "../deployments/localhost/UniswapPair_ETH_WBTC.json";
import * as localhostUniswapPair_ETH_YFI from "../deployments/localhost/UniswapPair_ETH_YFI.json";
import * as localhostUniswapRouter from "../deployments/localhost/UniswapRouter.json";
import * as localhostWETH from "../deployments/localhost/WETH.json";
const localhostDeployment = {
  AAVE: localhostFakeAAVE,
  COMP: localhostFakeCOMP,
  MKR: localhostFakeMKR,
  UNI: localhostFakeUNI,
  UniswapFactory: localhostUniswapFactory,
  Uni_ETH_AAVE: localhostUniswapPair_ETH_AAVE,
  Uni_ETH_COMP: localhostUniswapPair_ETH_COMP,
  Uni_ETH_MKR: localhostUniswapPair_ETH_MKR,
  Uni_ETH_UNI: localhostUniswapPair_ETH_UNI,
  Uni_ETH_WBTC: localhostUniswapPair_ETH_WBTC,
  Uni_ETH_YFI: localhostUniswapPair_ETH_YFI,
  UniswapRouter: localhostUniswapRouter,
  WBTC: localhostFakeWBTC,
  WETH: localhostWETH,
  YFI: localhostFakeYFI,
};
deployments.localhost = localhostDeployment;
deployments["1337"] = localhostDeployment;
deployments[1337] = localhostDeployment;
*/
