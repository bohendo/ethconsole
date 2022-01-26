import { Contract } from "@ethersproject/contracts";

import { wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const assumeOwnership = async (player = wallets[0]): Promise<void> => {
  const playerAddress = await player.getAddress();
  log(`Player address = ${playerAddress}`);

  const challenge = new Contract(
    deployments.ropsten.AssumeOwnershipChallenge.address,
    deployments.ropsten.AssumeOwnershipChallenge.abi,
    player,
  );

  log(`Preparing to solve challenge at ${challenge.address}`);

  const assumeOwnershipTx = await challenge.AssumeOwmershipChallenge({ gasLimit: "2000000" });
  log(`Sent assume ownership tx: ${assumeOwnershipTx.hash}`);
  await assumeOwnershipTx.wait();
  log(`Assume ownership tx has been mined`);

  const authTx = await challenge.authenticate({ gasLimit: "2000000" });
  log(`Sent auth tx: ${authTx.hash}`);
  await authTx.wait();
  log(`Auth tx has been mined`);

  log(`Challenge complete = ${await challenge.isComplete()}`);

};
