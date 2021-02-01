import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";

export const MKR = new Contract(
  "0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2",
  new Interface([
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event Burn(address indexed guy, uint256 wad)",
    "event LogNote(bytes4 indexed sig, address indexed guy, bytes32 indexed foo, bytes32 indexed bar, uint256 wad, bytes fax) anonymous",
    "event LogSetAuthority(address indexed authority)",
    "event LogSetOwner(address indexed owner)",
    "event Mint(address indexed guy, uint256 wad)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function allowance(address src, address guy) view returns (uint256)",
    "function approve(address guy) returns (bool)",
    "function approve(address guy, uint256 wad) returns (bool)",
    "function authority() view returns (address)",
    "function balanceOf(address src) view returns (uint256)",
    "function burn(address guy, uint256 wad)",
    "function burn(uint256 wad)",
    "function decimals() view returns (uint256)",
    "function mint(address guy, uint256 wad)",
    "function mint(uint256 wad)",
    "function move(address src, address dst, uint256 wad)",
    "function name() view returns (bytes32)",
    "function owner() view returns (address)",
    "function pull(address src, uint256 wad)",
    "function push(address dst, uint256 wad)",
    "function setAuthority(address authority_)",
    "function setName(bytes32 name_)",
    "function setOwner(address owner_)",
    "function start()",
    "function stop()",
    "function stopped() view returns (bool)",
    "function symbol() view returns (bytes32)",
    "function totalSupply() view returns (uint256)",
    "function transfer(address dst, uint256 wad) returns (bool)",
    "function transferFrom(address src, address dst, uint256 wad) returns (bool)",
  ]),
  provider,
);

