import { getCreate2Address, getContractAddress } from "@ethersproject/address";
import { hexlify, zeroPad } from "@ethersproject/bytes";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { keccak256 } from "@ethersproject/keccak256";
import { formatEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const fuzzyId = async (player = wallets[0]): Promise<void> => {

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
  const salt = hexlify(zeroPad("0x00", 32));
  const initCode = artifacts.FuzzyIdentitySolution.bytecode;
  const initCodeHash = keccak256(initCode);
  const create2Address = getCreate2Address(contractAddress, salt, initCodeHash);

  log(`Contract at ${contractAddress} is expected to deploy a solution to ${create2Address}`);

  if (!create2Address.endsWith("badc0de")) {
    log(`Salt of ${salt} does NOT return a valid solution, try mining a new salt value`);
  } else {
    log(`Salt of ${salt} DOES return a valid solution, yay!`);
  }

  const solver = await factory.deploy(challenge.address, initCode, salt);
  log(`Sent solver deploy tx ${solver.deployTransaction.hash}`);
  await solver.deployTransaction.wait();
  log(`Solver deploy tx has been mined`);
  const solutionAddress = await solver.solution();
  log(`Solution address: ${solutionAddress}`);

  // Assert that our predictions match the actual addresses
  if (solver.address !== contractAddress) throw new Error(`Contract address mismatch`);
  if (solutionAddress !== create2Address) throw new Error(`Create2 address mismatch`);

  // TODO: add authenticate fn to the solution & call it to ensure our solution works
  const solution = new Contract(
    solutionAddress,
    artifacts.FuzzyIdentitySolution.abi,
    player,
  );

  const authTx = await solution.authenticate();
  log(`Sent auth tx ${authTx.hash}`);
  await authTx.wait();
  log(`Auth tx was mined`);

  log(`Challenge complete = ${await challenge.isComplete()}`);

};
