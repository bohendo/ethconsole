import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther, parseEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const donation = async (player = wallets[0]): Promise<void> => {
  const playerAddress = await player.getAddress();
  log(`Player address = ${playerAddress}`);
  log(`Player balance = ${formatEther(await provider.getBalance(playerAddress))}`);

  const challenge = new Contract(
    deployments.ropsten.DonationChallenge.address,
    deployments.ropsten.DonationChallenge.abi,
    provider,
  );

  log(`Preparing to solve challenge at ${challenge.address}`);

  const factory = new ContractFactory(
    artifacts.DonationSolver.abi,
    artifacts.DonationSolver.bytecode,
    player,
  );

  const solver = await factory.deploy(challenge.address, { value: parseEther("0.1") });
  await solver.deployTransaction.wait();

  log(`Solver was deployed to ${solver.address}`);
  log(`Player balance = ${formatEther(await provider.getBalance(playerAddress))}`);
  log(`Challenge complete = ${await challenge.isComplete()}`);

};
