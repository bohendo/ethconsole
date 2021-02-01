import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";
import { deployments } from "../../deployments";

export const getYFI = (network: "mainnet" | "localhost"): Contract => {
  const deployment = deployments[network].YFI;
  return new Contract(deployment.address, deployment.abi, provider);
};

export const YFI = new Contract(
  "0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e",
  new Interface([
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function addMinter(address _minter)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)",
    "function governance() view returns (address)",
    "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
    "function mint(address account, uint256 amount)",
    "function minters(address) view returns (bool)",
    "function name() view returns (string)",
    "function removeMinter(address _minter)",
    "function setGovernance(address _governance)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address recipient, uint256 amount) returns (bool)",
    "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
  ]),
  provider,
);
