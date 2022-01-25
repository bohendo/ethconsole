import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { hexlify } from "@ethersproject/bytes";
import { Contract } from "@ethersproject/contracts";
import { keccak256 } from "@ethersproject/keccak256";
import { serialize } from "@ethersproject/transactions";
import { Wallet } from "@ethersproject/wallet";

import { provider } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const accountTakeover = async (): Promise<void> => {
  const challenge = new Contract(
    deployments.ropsten.AccountTakeoverChallenge.address,
    deployments.ropsten.AccountTakeoverChallenge.abi,
    provider,
  );

  log(`Preparing to solve challenge at ${challenge.address}`);

  const owner = getAddress("0x6B477781b0e68031109f21887e6B5afEAaEB002b");
  log(`Owner address = ${owner}`);

  const txHash1 = "0xd79fc80e7b787802602f3317b7fe67765c14a7d40c3e0dcb266e63657f881396";
  const tx1 = await provider.getTransaction(txHash1);
  const signedHash1 = keccak256(serialize({
    to: tx1.to, nonce: tx1.nonce, gasLimit: tx1.gasLimit, gasPrice: tx1.gasPrice,
    data: tx1.data, value: tx1.value, chainId: tx1.chainId,
  }));

  log(tx1);

  const txHash2 = "0x061bf0b4b5fdb64ac475795e9bc5a3978f985919ce6747ce2cfbbcaccaf51009";
  const tx2 = await provider.getTransaction(txHash2);
  const signedHash2 = keccak256(serialize({
    to: tx2.to, nonce: tx2.nonce, gasLimit: tx2.gasLimit, gasPrice: tx2.gasPrice,
    data: tx2.data, value: tx2.value, chainId: tx2.chainId,
  }));
  log(tx2);

  // const p = BigNumber.from("0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141");
  const r = BigNumber.from(tx2.r);
  const s1 = BigNumber.from(tx1.s);
  const s2 = BigNumber.from(tx2.s);
  const e1 = BigNumber.from(signedHash1);
  const e2 = BigNumber.from(signedHash2);

  // Mathy reference: https://bohendo.com/ipfs/QmWXP1bC8zTR5dEFMXwaE97PGxWHcpZmkVyUt9iG7DJ6BQ
  const m = (e1.sub(e2)).div(s1.sub(s2));
  log(`m  = ${m}`);
  const pk = hexlify(((m.mul(s1).sub(e1)).div(r)));
  log(`pk = ${pk}`);

  const ownerSigner = new Wallet(pk);

  const solveTx = await challenge.connect(ownerSigner).authenticate();
  log(`Solve tx has been sent: ${solveTx.hash}`);
  await solveTx.wait();
  log(`Solve tx has been mined`);

  log(`Challenge complete = ${await challenge.isComplete()}`);

};
