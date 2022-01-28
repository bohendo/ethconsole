import { Contract, ContractFactory } from "@ethersproject/contracts";
import { JsonRpcProvider } from "@ethersproject/providers";
import { parseEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { deployments } from "../deployments";
import { log } from "../utils";

export const mineBlocks = async (n: number): Promise<void> => {
  log(`Starting block number: ${await provider.getBlockNumber()}`);
  for (let i = 0; i < n; i++) {
    await (provider as JsonRpcProvider).send("evm_mine", []);
  }
  log(`Mined ${n} blocks, new block number: ${await provider.getBlockNumber()}`);
};

export const predictTheHash = async (signer = wallets[0]): Promise<void> => {

  const userAddress = await signer.getAddress();
  log(`User address = ${userAddress}`);

  const challenge = new Contract(
    deployments.ropsten.PredictTheBlockHashChallenge.address,
    deployments.ropsten.PredictTheBlockHashChallenge.abi,
    provider,
  );

  log(`Predicting the block hash for challenge at ${challenge.address}`);

  const factory = new ContractFactory(
    artifacts.PredictTheBlockHashSolver.abi,
    artifacts.PredictTheBlockHashSolver.bytecode,
    signer,
  );
  const solver = await factory.deploy(challenge.address, { value: parseEther("1") });
  log(`Sent a tx to deploy the solver & make our guess: ${solver.deployTransaction.hash}`);
  await solver.deployTransaction.wait();
  log(`Solver deployment tx has been mined, solver deployed to: ${solver.address}`);
  const settlementBlock = (await solver.settlementBlockNumber()).toNumber();
  log(`Predicted a hash of zero on block ${settlementBlock}`);
  let blocknumber = await provider.getBlockNumber();
  const blocksToWait = 257;
  const targetBlock = blocknumber + blocksToWait;

  if ((provider as JsonRpcProvider).connection.url.startsWith("http://localhost")) {
    log(`Mining ${blocksToWait} blocks until we get to target block ${targetBlock}...`);
    await mineBlocks(blocksToWait);
  } else {
    log(`Waiting for ${blocksToWait} blocks to be mined...`);
    while (blocknumber < targetBlock) {
      await new Promise(res => setTimeout(res, 15 * 1000));
      blocknumber = await provider.getBlockNumber();
      log(`Current block: ${blocknumber}, ${targetBlock - blocknumber} to go until ${targetBlock} `);
    }
  }
  blocknumber = await provider.getBlockNumber();

  if (blocknumber < targetBlock) {
    throw new Error(`We didn't wait long enough, ${blocknumber} < ${targetBlock}`);
  }

  const settleTx = await solver.settle({ gasLimit: "2000000" });
  log(`Sent a settlement tx to the challenge to check our guess: ${settleTx.hash}`);
  await settleTx.wait();
  log(`Settlement tx has been mined!`);

  log(`Challenge complete = ${await challenge.isComplete()}`);

};
