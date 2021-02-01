import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";
import { deployments } from "../../deployments";

export const getWBTC = (network: "mainnet" | "localhost"): Contract => {
  const deployment = deployments[network].WBTC;
  return new Contract(deployment.address, deployment.abi, provider);
};

export const WBTC = new Contract(
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
  new Interface([
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event Burn(address indexed burner, uint256 value)",
    "event Mint(address indexed to, uint256 amount)",
    "event MintFinished()",
    "event OwnershipRenounced(address indexed previousOwner)",
    "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
    "event Pause()",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "event Unpause()",
    "function allowance(address _owner, address _spender) view returns (uint256)",
    "function approve(address _spender, uint256 _value) returns (bool)",
    "function balanceOf(address _owner) view returns (uint256)",
    "function burn(uint256 value)",
    "function claimOwnership()",
    "function decimals() view returns (uint8)",
    "function decreaseApproval(address _spender, uint256 _subtractedValue) returns (bool success)",
    "function finishMinting() returns (bool)",
    "function increaseApproval(address _spender, uint256 _addedValue) returns (bool success)",
    "function mint(address _to, uint256 _amount) returns (bool)",
    "function mintingFinished() view returns (bool)",
    "function name() view returns (string)",
    "function owner() view returns (address)",
    "function pause()",
    "function paused() view returns (bool)",
    "function pendingOwner() view returns (address)",
    "function reclaimToken(address _token)",
    "function renounceOwnership()",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address _to, uint256 _value) returns (bool)",
    "function transferFrom(address _from, address _to, uint256 _value) returns (bool)",
    "function transferOwnership(address newOwner)",
    "function unpause()",
  ]),
  provider,
);
