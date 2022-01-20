import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther, parseEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const predictTheFuture = async (signer = wallets[0]): Promise<void> => {

  const userAddress = await signer.getAddress();
  log(`User address = ${userAddress}`);
  log(`User balance = ${formatEther(await provider.getBalance(userAddress))}`);

  const challenge = new Contract(
    deployments.ropsten.PredictTheFutureChallenge.address,
    deployments.ropsten.PredictTheFutureChallenge.abi,
    provider,
  );

  log(`Predicting the future for challenge at ${challenge.address}`);
  log(`Challenge balance = ${formatEther(await provider.getBalance(challenge.address))}`);
  log(`Challenge complete = ${await challenge.isComplete()}`);

  const factory = new ContractFactory(
    artifacts.PredictTheFutureSolver.abi,
    artifacts.PredictTheFutureSolver.bytecode,
    signer,
  );

  const oneEth = parseEther("1");
  const solver = await factory.deploy(challenge.address, 7, { value: oneEth });

  log(`Deployed a solver to address ${solver.address}`);
  log(`Solver balance = ${formatEther(await provider.getBalance(solver.address))}`);
  log(`Challenge balance = ${formatEther(await provider.getBalance(challenge.address))}`);

  let n = 1;
  while (!(await challenge.isComplete())) {
    const tx = await solver.connect(signer).smartSettle();
    log(`Attempt #${n}: ${tx.hash}`);
    await provider.waitForTransaction(tx.hash);
    const done = await challenge.isComplete();
    if (done) {
      log(`Attempt #${n} was successful!`);
      log(`Challenge balance = ${formatEther(await provider.getBalance(challenge.address))}`);
      log(`Challenge complete = ${await challenge.isComplete()}`);
      break;
    } else {
      log(`Attempt #${n} was NOT successful!`);
      log(`Challenge balance = ${formatEther(await provider.getBalance(challenge.address))}`);
      log(`Challenge complete = ${await challenge.isComplete()}`);
    }
    n += 1;
  }

};
