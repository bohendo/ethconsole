import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";
import { deployments } from "../../deployments";

import pairAbi from "./pair.json";
import factoryAbi from "./factory.json";
import routerAbi from "./router.json";

export const getUniswapFactory = (network: "mainnet" | "localhost"): Contract => {
  const deployment = deployments[network].UniswapFactory;
  return new Contract(deployment.address, deployment.abi, provider);
};

export const getUniswapRouter = (network: "mainnet" | "localhost"): Contract => {
  const deployment = deployments[network].UniswapRouter;
  return new Contract(deployment.address, deployment.abi, provider);
};

export const factory = new Contract(
  "0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f",
  new Interface(factoryAbi),
  provider,
);

export const router = new Contract(
  "0x7a250d5630b4cf539739df2c5dacb4c659f2488d",
  new Interface(routerAbi),
  provider,
);

export const ETH_UNI = new Contract(
  "0xd3d2e2692501a5c9ca623199d38826e513033a17",
  new Interface(pairAbi),
  provider,
);
