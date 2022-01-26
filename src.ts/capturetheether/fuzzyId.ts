import { getCreate2Address, getContractAddress } from "@ethersproject/address";
import { hexlify } from "@ethersproject/bytes";
import { randomBytes } from "@ethersproject/random";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { AddressZero, HashZero } from "@ethersproject/constants";
import { keccak256 } from "@ethersproject/keccak256";
import { formatEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

const isValid = (address: string): boolean => address.toLowerCase().endsWith("badc0de");

export const mineSalt = async (player = wallets[0]): Promise<void> => {
  const playerAddress = await player.getAddress();
  const nonce = await provider.getTransactionCount(playerAddress);
  const contractAddress = getContractAddress({ from: playerAddress, nonce });
  const initCode = artifacts.FuzzyIdentitySolution.bytecode;
  const initCodeHash = keccak256(initCode);
  log(`Mining a salt for player ${playerAddress} w nonce ${nonce}`);
  let salt = HashZero;
  let create2Address = AddressZero;
  // expected to take ~ 2^32 = 4,294,967,296 guess/checks
  while (!isValid(create2Address)) {
    salt = hexlify(randomBytes(32));
    create2Address = getCreate2Address(contractAddress, salt, initCodeHash);
    if (isValid(create2Address)) {
      log(`Found a salt that generates ${create2Address} via factory at ${contractAddress}: ${salt}`);
      break;
    }
  }
};

export const fuzzyId = async (salt: string, player = wallets[0]): Promise<void> => {

  const userAddress = await player.getAddress();
  log(`User address = ${userAddress}`);
  log(`User balance = ${formatEther(await provider.getBalance(userAddress))}`);

  const challenge = new Contract(
    deployments.ropsten.FuzzyIdentityChallenge.address,
    deployments.ropsten.FuzzyIdentityChallenge.abi,
    provider,
  );
  log(`Preparing to solve challenge at ${challenge.address}`);

  const factory = new ContractFactory(
    artifacts.FuzzyIdentitySolver.abi,
    artifacts.FuzzyIdentitySolver.bytecode,
    player,
  );

  const nonce = await provider.getTransactionCount(player.address);
  const contractAddress = getContractAddress({ from: player.address, nonce });
  const initCode = artifacts.FuzzyIdentitySolution.bytecode;
  const initCodeHash = keccak256(initCode);
  const create2Address = getCreate2Address(contractAddress, salt, initCodeHash);

  log(`Contract at ${contractAddress} is expected to deploy a solution to ${create2Address}`);

  if (!isValid(create2Address)) {
    log(`Salt of ${salt} does NOT return a valid solution, try mining a new salt value`);
  } else {
    log(`Salt of ${salt} DOES return a valid solution, yay!`);
  }

  const solver = await factory.deploy(salt);
  log(`Sent solver deploy tx ${solver.deployTransaction.hash}`);
  await solver.deployTransaction.wait();
  log(`Solver deploy tx has been mined`);
  const solutionAddress = await solver.solution();
  log(`Solution address: ${solutionAddress}`);

  // Assert that our predictions match the actual addresses
  if (solver.address !== contractAddress) throw new Error(`Contract address mismatch`);
  if (solutionAddress !== create2Address) throw new Error(`Create2 address mismatch`);

  const solution = new Contract(
    solutionAddress,
    artifacts.FuzzyIdentitySolution.abi,
    player,
  );

  try {
    const authTx = await solution.authenticate(challenge.address);
    log(`Sent auth tx ${authTx.hash}`);
    await authTx.wait();
    log(`Auth tx was mined`);
  } catch (e) {
    log(`Failed to authenticate, this solution is not valid`);
  }

  log(`Challenge complete = ${await challenge.isComplete()}`);

};
