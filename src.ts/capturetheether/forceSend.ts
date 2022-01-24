import { ContractFactory } from "@ethersproject/contracts";
import { formatEther } from "@ethersproject/units";

import { artifacts } from "../artifacts";
import { provider, wallets } from "../constants";
import { log } from "../utils";

export const forceSend = async (
  target: string, // eth address to send to
  value: string, // int string (wei) amount to send
  signer = wallets[0],
): Promise<void> => {

  const userAddress = await signer.getAddress();
  log(`User address = ${userAddress}`);
  log(`User balance = ${formatEther(await provider.getBalance(userAddress))}`);
  log(`Target address = ${target}`);
  log(`Target balance = ${await provider.getBalance(target)}`);

  const factory = new ContractFactory(
    artifacts.ForceSend.abi,
    artifacts.ForceSend.bytecode,
    signer,
  );

  const sender = await factory.deploy(target, { value });
  await sender.deployTransaction.wait();

  log(`Sender has run successfully at address ${sender.address}`);

  log(`User balance = ${formatEther(await provider.getBalance(userAddress))}`);
  log(`Target balance = ${await provider.getBalance(target)}`);

};
