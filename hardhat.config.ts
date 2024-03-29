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
      // "src.sol/Echidna.sol": { version: "0.8.15" },
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
