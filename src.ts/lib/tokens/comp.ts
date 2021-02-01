import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";
import { deployments } from "../../deployments";

export const getCOMP = (network: "mainnet" | "localhost"): Contract => {
  const deployment = deployments[network].COMP;
  return new Contract(deployment.address, deployment.abi, provider);
};

export const COMP = new Contract(
  "0xc00e94Cb662C3520282E6f5717214004A7f26888",
  new Interface([
    "event Approval(address indexed owner, address indexed spender, uint256 amount)",
    "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
    "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
    "event Transfer(address indexed from, address indexed to, uint256 amount)",
    "function allowance(address account, address spender) view returns (uint256)",
    "function approve(address spender, uint256 rawAmount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function checkpoints(address, uint32) view returns (uint32 fromBlock, uint96 votes)",
    "function decimals() view returns (uint8)",
    "function delegate(address delegatee)",
    "function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s)",
    "function delegates(address) view returns (address)",
    "function DELEGATION_TYPEHASH() view returns (bytes32)",
    "function DOMAIN_TYPEHASH() view returns (bytes32)",
    "function getCurrentVotes(address account) view returns (uint96)",
    "function getPriorVotes(address account, uint256 blockNumber) view returns (uint96)",
    "function name() view returns (string)",
    "function nonces(address) view returns (uint256)",
    "function numCheckpoints(address) view returns (uint32)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address dst, uint256 rawAmount) returns (bool)",
    "function transferFrom(address src, address dst, uint256 rawAmount) returns (bool)",
  ]),
  provider,
);
