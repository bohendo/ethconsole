import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { Zero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { Wallet } from "@ethersproject/wallet";
import elliptic from "elliptic";

import { provider } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const secp256k1 = new elliptic.ec("secp256k1");

const toBN = BigNumber.from;

export const accountTakeover = async (): Promise<void> => {
  await new Promise(res => setTimeout(res, 10)); log("");

  const challenge = new Contract(
    deployments.ropsten.AccountTakeoverChallenge.address,
    deployments.ropsten.AccountTakeoverChallenge.abi,
    provider,
  );
  log(`Preparing to solve challenge at ${challenge.address}`);

  const owner = getAddress("0x6B477781b0e68031109f21887e6B5afEAaEB002b");
  log(`Owner address = ${owner}`);

  // calculated using: https://github.com/tintinweb/ecdsa-private-key-recovery
  const pk = "0x614f5e36cd55ddab0947d1723693fef5456e5bee24738ba90bd33c0c6e68e269";

  if (pk.length === 66 && toBN(pk).gt(Zero)) {
    log(`Calculated private key is valid`);
    const ownerSigner = new Wallet(pk);
    const calculatedAddress = await ownerSigner.getAddress();
    if (calculatedAddress === owner) {
      const solveTx = await challenge.connect(ownerSigner).authenticate();
      log(`Solve tx has been sent: ${solveTx.hash}`);
      await solveTx.wait();
      log(`Solve tx has been mined`);
      log(`Challenge complete = ${await challenge.isComplete()}`);
    } else {
      log(`Calculated key controls the wrong address ${calculatedAddress} !== owner ${owner}`);
    }
  } else {
    log(`Calculated private key is invalid`);
  }

};
