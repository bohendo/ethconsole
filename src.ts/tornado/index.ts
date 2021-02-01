import { Contract, getDefaultProvider, utils } from "ethers";

import { provider } from "../utils";

import ethMixerAbi from "./EthMixer.json";

// TODO: how to handle mainnet vs testnets here?

export const ethMixer_01 = new Contract("eth-01.tornadocash.eth", ethMixerAbi, provider);
export const ethMixer_1 = new Contract("eth-1.tornadocash.eth", ethMixerAbi, provider);
export const ethMixer_10 = new Contract("eth-10.tornadocash.eth", ethMixerAbi, provider);
export const ethMixer_100 = new Contract("eth-100.tornadocash.eth", ethMixerAbi, provider);
