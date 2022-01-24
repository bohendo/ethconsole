import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const fiftyYears = async (player = wallets[0]): Promise<void> => {
  const playerAddress = await player.getAddress();
  log(`Player address = ${playerAddress}`);
  log(`Player balance = ${formatEther(await provider.getBalance(playerAddress))}`);

  const challenge = new Contract(
    deployments.ropsten.FiftyYearsChallenge.address,
    deployments.ropsten.FiftyYearsChallenge.abi,
    provider,
  );

  log(`Preparing to solve challenge at ${challenge.address}`);

  const factory = new ContractFactory(
    artifacts.FiftyYearsSolver.abi,
    artifacts.FiftyYearsSolver.bytecode,
    player,
  );

  const solver = await factory.deploy(challenge.address);
  await solver.deployTransaction.wait();

  log(`Solver has been deployed to ${solver.address}`);
  log(`Challenge complete = ${await challenge.isComplete()}`);

};

