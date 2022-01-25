import { getAddress } from "@ethersproject/address";
import { hexlify, hexConcat, hexDataLength, hexDataSlice } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/keccak256";
import { Contract } from "@ethersproject/contracts";
import { computePublicKey, recoverPublicKey } from "@ethersproject/signing-key";
import { computeAddress, recoverAddress, serialize } from "@ethersproject/transactions";

import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const publicKey = async (player = wallets[0]): Promise<void> => {
  const challenge = new Contract(
    deployments.ropsten.PublicKeyChallenge.address,
    deployments.ropsten.PublicKeyChallenge.abi,
    player,
  );

  log(`Preparing to solve challenge at ${challenge.address}`);

  const owner = getAddress("0x92b28647ae1f3264661f72fb2eb9625a89d88a31");
  log(`Owner address = ${owner}`);

  const signedTxHash = "0xabc467bedd1d17462fcc7942d0af7874d6f8bdefee2b299c9168a216d3ff0edb";
  const tx = await provider.getTransaction(signedTxHash);
  const serializedTx = serialize({
    to: tx.to, nonce: tx.nonce, gasLimit: tx.gasLimit, gasPrice: tx.gasPrice,
    data: tx.data, value: tx.value, chainId: tx.chainId,
  });
  const hashToSign = keccak256(serializedTx);
  if (!tx.r || !tx.s || !tx.v) throw new Error(`Missing sig components`);
  const sig = hexConcat([tx.r, tx.s, hexlify(tx.v)]);
  log(`Signature (strlen=${sig.length}, byteslen=${hexDataLength(sig)}): ${sig}`);

  const pubKey = hexlify(computePublicKey(recoverPublicKey(hashToSign, sig), false));
  log(`Computed public key: ${pubKey}`);

  const recovered = recoverAddress(hashToSign, sig);
  log(`Recovered address = ${recovered}`);

  const computed = computeAddress(pubKey);
  log(`Computed address  = ${computed}`);

  // Need to remove the first byte bc it's just indicating whether it's compressed or not I think
  const rawPubKey = hexlify(hexDataSlice(pubKey, 1));
  log(`Raw public key    = ${rawPubKey}`);
  const pubKeyHash = keccak256(rawPubKey);
  log(`Public key hash   = ${pubKeyHash}`);
  const manual = getAddress(`0x${pubKeyHash.substring(pubKeyHash.length - 40)}`);
  log(`Manual address    = ${manual}`);

  if (recovered !== owner) {
    throw new Error(`Recovered address ${recovered} !== owner ${owner}`);
  }
  if (computed !== owner) {
    throw new Error(`Computed address ${computed} !== owner ${owner}`);
  }
  if (manual !== owner) {
    throw new Error(`Manually recovered address ${manual} !== owner ${owner}`);
  }

  const solveTx = await challenge.authenticate(rawPubKey);
  log(`Solve tx has been sent: ${solveTx.hash}`);
  await solveTx.wait();
  log(`Solve tx has been mined`);

  log(`Challenge complete = ${await challenge.isComplete()}`);

};

