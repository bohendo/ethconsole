import { getAddress } from "@ethersproject/address";
import { BigNumber } from "@ethersproject/bignumber";
import { arrayify, hexlify, hexConcat, zeroPad } from "@ethersproject/bytes";
import { One, MaxUint256, Two, Zero } from "@ethersproject/constants";
import { Contract } from "@ethersproject/contracts";
import { keccak256 } from "@ethersproject/keccak256";
import { computePublicKey, recoverPublicKey } from "@ethersproject/signing-key";
import { parse, recoverAddress, serialize, Transaction } from "@ethersproject/transactions";
import { Wallet } from "@ethersproject/wallet";
import elliptic from "elliptic";

import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const secp256k1 = new elliptic.ec("secp256k1");

const toBN = BigNumber.from;

// Convert to hex string & strip from the left down to 64 bytes
const overflow = (n: BigNumber): BigNumber => {
  const hex = n.toHexString().replace(/^0x/, "");
  return toBN(`0x${hex.length > 64 ? hex.substring(hex.length - 64, hex.length) : hex}`);
};
const underflow = (n: BigNumber): BigNumber => {
  let uint256 = n;
  while (uint256.lt(Zero)) {
    uint256 = uint256.add(MaxUint256);
  }
  return uint256;
};
export const wrapUint256 = (n: BigNumber): BigNumber => overflow(underflow(n));

export const secp256k1Test = async (player = wallets[0]): Promise<void> => {
  await new Promise(res => setTimeout(res, 10)); log("");

  const n = `0x${secp256k1.curve.n.toString("hex")}`;
  log(`         n = ${n}`);
  const p = toBN(`0x${secp256k1.curve.p.toString("hex")}`);
  log(`         p = ${p.toHexString()}`);
  const gx = toBN(`0x${secp256k1.curve.g.getX().toString("hex")}`);
  log(`        gx = ${gx.toHexString()}`);
  const gy = toBN(`0x${secp256k1.curve.g.getY().toString("hex")}`);
  log(`        gy = ${gy.toHexString()}`);

  const address = await player.getAddress();
  log(`   address = ${address}`);

  const privateKey = player.privateKey;
  log(`privateKey = ${privateKey}`);

  const pubKeyFull = player.publicKey;
  log(`publicKeyF = ${pubKeyFull}`);
  const pubKeyComp = computePublicKey(pubKeyFull, true);
  log(`publicKeyC = ${pubKeyComp}`);

  if (toBN(privateKey).gt(toBN(n))) {
    throw new Error(`Private key is too big: ${privateKey}`);
  }

  const calcdPubKeyF = `0x${secp256k1.g.mul(arrayify(privateKey)).encode("hex", false)}`;
  if (pubKeyFull !== calcdPubKeyF) {
    log(`ERROR! Calculated full pub key doesn't match: ${calcdPubKeyF}`);
  }

  const calcdPubKeyC = `0x${secp256k1.g.mul(arrayify(privateKey)).encode("hex", true)}`;
  if (pubKeyComp !== calcdPubKeyC) {
    log(`ERROR! Calculated shrt pub key doesn't match: ${calcdPubKeyC}`);
  }

  const unsignedTx = {
    to: address, nonce: 0, gasLimit: "0x100000", gasPrice: "0x100000",
    data: "0x00", value: 0, chainId: 3,
  };

  const hashToSign = keccak256(serialize(unsignedTx));
  log(`hashToSign = ${hashToSign}`);

  const signedTx = parse(await player.signTransaction(unsignedTx));

  const r = toBN(signedTx.r);
  log(`         r = ${r.toHexString()}`);

  const s = toBN(signedTx.s);
  log(`         s = ${s.toHexString()}`);

  const v = toBN(signedTx.v);
  log(`         v = ${v.toHexString()}`);

  // ECDSA math overview: https://en.bitcoin.it/wiki/Elliptic_Curve_Digital_Signature_Algorithm
  // m = (e + (k * r)) / s
  const m = (toBN(hashToSign).add(toBN(privateKey).mul(r))).div(s).mod(toBN(n));
  log(`         m = ${m.toHexString()}`);

  const r0 = `0x${secp256k1.g.mul(arrayify(m.toHexString())).getX().toString("hex")}`;
  log(`        r0 = ${r0}`);

  if (!r.eq(r0)) log(`WARN: r from sig !== r0 calculated w secp256k1`);

};

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

  const txHash2 = "0xd79fc80e7b787802602f3317b7fe67765c14a7d40c3e0dcb266e63657f881396";
  const txHash1 = "0x061bf0b4b5fdb64ac475795e9bc5a3978f985919ce6747ce2cfbbcaccaf51009";

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
  const n = toBN(`0x${secp256k1.curve.n.toString("hex")}`);
  const p = toBN(`0x${secp256k1.curve.p.toString("hex")}`);
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

  const r = toBN(tx2.r);
  const s1 = toBN(tx1.s);
  const s2 = toBN(tx2.s);
  const e1 = toBN(getSignedHash(tx1));
  const e2 = toBN(getSignedHash(tx2));

  log(` r = ${r.toHexString()}`);
  log(`s1 = ${s1.toHexString()}`);
  log(`s2 = ${s2.toHexString()}`);
  log(`e1 = ${e1.toHexString()}`);
  log(`e2 = ${e2.toHexString()}`);

  const sDiff = s1.sub(s2);
  const eDiff = e1.sub(e2);
  log(`sd = ${sDiff.toHexString()}`);
  log(`ed = ${eDiff.toHexString()}`);

  const e1s2 = e1.mul(s2);
  log(`e1s2 = ${e1s2.toHexString()}`);
  const e2s1 = e2.mul(s1);
  log(`e2s1 = ${e2s1.toHexString()}`);
  const num = e1s2.sub(e2s1);
  log(`num  = ${num.toHexString()}`);
  const den = r.mul(sDiff);
  log(`den  = ${den.toHexString()}`);
  log(`pk   = ${num.div(den)}`);

  // Mathy reference: https://bohendo.com/ipfs/QmWXP1bC8zTR5dEFMXwaE97PGxWHcpZmkVyUt9iG7DJ6BQ
  const m = (eDiff).div(sDiff);
  log(` m = ${m}`);
  const pk1 = hexlify(zeroPad(hexlify((m.mul(s1).sub(e1)).div(r)), 32));
  log(`pk1= ${pk1}`);
  const pk2 = hexlify(zeroPad(hexlify((m.mul(s2).sub(e2)).div(r)), 32));
  log(`pk2= ${pk2}`);
  const pk = hexlify(zeroPad(hexlify((e1.mul(s2).sub(e2.mul(s1))).div(r.mul(s1.sub(s2)))), 32));
  log(`pk = ${pk}\n`);

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
