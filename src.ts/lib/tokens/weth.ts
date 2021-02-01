import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";

export const WETH = new Contract(
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
  new Interface([
    "event Approval(address indexed src, address indexed guy, uint256 wad)",
    "event Deposit(address indexed dst, uint256 wad)",
    "event Transfer(address indexed src, address indexed dst, uint256 wad)",
    "event Withdrawal(address indexed src, uint256 wad)",
    "function allowance(address, address) view returns (uint256)",
    "function approve(address guy, uint256 wad) returns (bool)",
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function deposit() payable",
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address dst, uint256 wad) returns (bool)",
    "function transferFrom(address src, address dst, uint256 wad) returns (bool)",
    "function withdraw(uint256 wad)",
  ]),
  provider,
);

