import { parseUnits } from "@ethersproject/units";
import "@nomiclabs/hardhat-waffle";
import "hardhat-deploy";
import "hardhat-deploy-ethers";
import { HardhatUserConfig } from "hardhat/types";

import * as packageJson from "./package.json";

const urlOverride = process.env.ETH_PROVIDER_URL;
const chainId = parseInt(process.env.CHAIN_ID ?? "1337", 10);

const mnemonic =
  process.env.ETH_MNEMONIC ||
  "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const config: HardhatUserConfig = {
  paths: {
    artifacts: "./artifacts",
    deploy: "./src.ts/deploy",
    deployments: "./deployments",
    sources: "./src.sol",
    tests: "./src.ts/tests",
  },
  solidity: {
    compilers: [
      {
        version: packageJson.devDependencies.solc,
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    overrides: {
      "src.sol/capturetheether/AccountTakeoverChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/AssumeOwnershipChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/DonationChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/DonationSolver.sol": { version: "0.4.21" },
      "src.sol/capturetheether/FiftyYearsChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/FiftyYearsSolver.sol": { version: "0.4.21" },
      "src.sol/capturetheether/ForceSend.sol": { version: "0.4.21" },
      "src.sol/capturetheether/FuzzyIdentityChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/FuzzyIdentitySolver.sol": { version: "0.8.9" },
      "src.sol/capturetheether/GuessTheNewNumberChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/GuessTheNewNumberSolver.sol": { version: "0.4.21" },
      "src.sol/capturetheether/GuessTheNumberChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/GuessTheRandomNumberChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/GuessTheSecretNumberChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/MappingChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/MappingSolver.sol": { version: "0.4.21" },
      "src.sol/capturetheether/NicknameChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/PredictTheBlockHashChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/PredictTheBlockHashSolver.sol": { version: "0.4.21" },
      "src.sol/capturetheether/PredictTheFutureChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/PredictTheFutureSolver.sol": { version: "0.4.21" },
      "src.sol/capturetheether/PublicKeyChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/RetirementFundChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/RetirementFundSolver.sol": { version: "0.4.21" },
      "src.sol/capturetheether/TokenBankChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/TokenBankSolver.sol": { version: "0.4.21" },
      "src.sol/capturetheether/TokenSaleChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/TokenSaleSolver.sol": { version: "0.4.21" },
      "src.sol/capturetheether/TokenWhaleChallenge.sol": { version: "0.4.21" },
      "src.sol/capturetheether/TokenWhaleSolver.sol": { version: "0.4.21" },
    },
  },
  defaultNetwork: "hardhat",
  namedAccounts: {
    deployer: { default: 0 },
    alice: { default: 1 },
    bob: { default: 2 },
    rando: { default: 3 },
  },
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: "1000000000000000000000000000",
        mnemonic,
      },
      chainId,
      gasPrice: parseUnits("100", "gwei").toNumber(),
      loggingEnabled: false,
      saveDeployments: false,
    },
    localhost: {
      accounts: { mnemonic },
      chainId,
      gasPrice: parseUnits("100", "gwei").toNumber(),
      url: urlOverride || "http://localhost:8545",
    },
    mainnet: {
      accounts: { mnemonic },
      chainId: 1,
      url: urlOverride || "http://localhost:8545",
    },
    ropsten: {
      accounts: { mnemonic },
      chainId: 3,
      url: urlOverride || "http://localhost:8545",
    },
    goerli: {
      accounts: { mnemonic },
      chainId: 5,
      url: urlOverride || "http://localhost:8545",
    },
  },
};

export default config;
