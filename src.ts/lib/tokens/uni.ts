import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";
import { deployments } from "../../deployments";

export const getUNI = (network: "mainnet" | "localhost"): Contract => {
  const deployment = deployments[network].UNI;
  return new Contract(deployment.address, deployment.abi, provider);
};

export const UNI = new Contract(
  "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
  new Interface([
    "event Approval(address indexed owner, address indexed spender, uint256 amount)",
    "event DelegateChanged(address indexed delegator, address indexed fromDelegate, address indexed toDelegate)",
    "event DelegateVotesChanged(address indexed delegate, uint256 previousBalance, uint256 newBalance)",
    "event MinterChanged(address minter, address newMinter)",
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
    "function minimumTimeBetweenMints() view returns (uint32)",
    "function mint(address dst, uint256 rawAmount)",
    "function mintCap() view returns (uint8)",
    "function minter() view returns (address)",
    "function mintingAllowedAfter() view returns (uint256)",
    "function name() view returns (string)",
    "function nonces(address) view returns (uint256)",
    "function numCheckpoints(address) view returns (uint32)",
    "function permit(address owner, address spender, uint256 rawAmount, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
    "function PERMIT_TYPEHASH() view returns (bytes32)",
    "function setMinter(address minter_)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address dst, uint256 rawAmount) returns (bool)",
    "function transferFrom(address src, address dst, uint256 rawAmount) returns (bool)",
  ]),
  provider,
);
