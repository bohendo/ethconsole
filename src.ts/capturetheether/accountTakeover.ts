import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { hexlify, hexConcat, zeroPad } from "@ethersproject/bytes";
import { One, MaxUint256, Two, Zero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { keccak256 } from "@ethersproject/keccak256";
import { computePublicKey, recoverPublicKey } from "@ethersproject/signing-key";
import { recoverAddress, serialize, Transaction } from "@ethersproject/transactions";
import { Wallet } from "@ethersproject/wallet";
import elliptic from "elliptic";

import { provider } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

const secp256k1 = new elliptic.ec("secp256k1");

// Convert to hex string & strip from the left down to 64 bytes
const overflow = (n: BigNumber): BigNumber => {
  const hex = n.toHexString().replace(/^0x/, "");
  return BigNumber.from(`0x${hex.length > 64 ? hex.substring(hex.length - 64, hex.length) : hex}`);
};

// Convert to hex string & strip from the left down to 64 bytes
const underflow = (n: BigNumber): BigNumber => {
  let uint256 = n;
  while (uint256.lt(Zero)) {
    uint256 = uint256.add(MaxUint256);
  }
  return uint256;
};

export const wrapUint256 = (n: BigNumber): BigNumber => overflow(underflow(n));

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

  const txHash1 = "0xd79fc80e7b787802602f3317b7fe67765c14a7d40c3e0dcb266e63657f881396";
  const txHash2 = "0x061bf0b4b5fdb64ac475795e9bc5a3978f985919ce6747ce2cfbbcaccaf51009";

  const tx1 = await provider.getTransaction(txHash1);
  const tx2 = await provider.getTransaction(txHash2);

  const getSig = (tx: Transaction): string => {
    if (!tx.r || !tx.s || !tx.v) throw new Error(`Missing sig components in tx ${tx.hash}`);
    return hexConcat([tx.r, tx.s, hexlify(tx.v)]);
  };

  const getSignedHash = (tx: Transaction): string => {
    const sig = getSig(tx);
    const signedHash = keccak256(serialize({
      to: tx.to, nonce: tx.nonce, gasLimit: tx.gasLimit, gasPrice: tx.gasPrice,
      data: tx.data, value: tx.value, chainId: tx.chainId,
    }));
    if (recoverAddress(signedHash, sig) !== owner) {
      throw new Error(`Address recovered from the sig of ${tx.hash} doesn't match the owner`);
    }
    return signedHash;
  };

  const getPubKey = (tx: Transaction): string => {
    const sig = getSig(tx);
    const signedHash = getSignedHash(tx);
    return hexlify(computePublicKey(recoverPublicKey(signedHash, sig), false));
  };

  // Verify & log owner's pub key
  const pubKey = getPubKey(tx1);
  if (pubKey !== getPubKey(tx2)) throw new Error(`Pub keys recovered from txns don't match`);
  log(`pubKey=${pubKey}`);

  // Verify & log secp256k1 params
  const n = BigNumber.from(`0x${secp256k1.curve.n.toString("hex")}`);
  const p = BigNumber.from(`0x${secp256k1.curve.p.toString("hex")}`);
  if (!p.eq(Two.pow("256")
    .sub(Two.pow("32"))
    .sub(Two.pow("9"))
    .sub(Two.pow("8"))
    .sub(Two.pow("7"))
    .sub(Two.pow("6"))
    .sub(Two.pow("4"))
    .sub(One),
  )) {
    log(`WARN: 2^256-2^32-2^8-2^8-2^4-1 !== p = ${p}`);
  }
  log(` n = ${n.toHexString()}`);
  log(` p = ${p.toHexString()}`);

  const r = BigNumber.from(tx2.r);
  const s1 = BigNumber.from(tx1.s);
  const s2 = BigNumber.from(tx2.s);
  const e1 = BigNumber.from(getSignedHash(tx1));
  const e2 = BigNumber.from(getSignedHash(tx2));

  log(` r = ${r.toHexString()}`);
  log(`s1 = ${s1.toHexString()}`);
  log(`s2 = ${s2.toHexString()}`);
  log(`e1 = ${e1.toHexString()}`);
  log(`e2 = ${e2.toHexString()}`);

  const sDiff = s1.sub(s2);
  const eDiff = e1.sub(e2);
  log(`sd = ${sDiff.toHexString()}`);
  log(`ed = ${eDiff.toHexString()}`);

  // Mathy reference: https://bohendo.com/ipfs/QmWXP1bC8zTR5dEFMXwaE97PGxWHcpZmkVyUt9iG7DJ6BQ
  const m = (e1.sub(e2)).div(s1.sub(s2));
  log(` m = ${m}`);
  const pk = hexlify(zeroPad(hexlify((e1.mul(s2).sub(e2.mul(s1))).div(r.mul(s1.sub(s2)))), 32));
  log(`pk = ${pk}\n`);

  if (pk.length === 66 && BigNumber.from(pk).gt(Zero)) {
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
