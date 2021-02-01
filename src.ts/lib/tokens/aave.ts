import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";

import { provider } from "../../constants";

// Implementation is currently at 0xC13eac3B4F9EED480045113B7af00F7B5655Ece8
export const AAVE = new Contract(
  "0x6B175474E89094C44Da98b954EedeAC495271d0F",
  new Interface([
    // Proxy ABI
    "event AdminChanged(address previousAdmin, address newAdmin)",
    "event Upgraded(address indexed implementation)",
    "function admin() returns (address)",
    "function changeAdmin(address newAdmin)",
    "function implementation() returns (address)",
    "function initialize(address _logic, address _admin, bytes _data) payable",
    "function initialize(address _logic, bytes _data) payable",
    "function upgradeTo(address newImplementation)",
    "function upgradeToAndCall(address newImplementation, bytes data) payable",
    // Implementation ABI
    "event Approval(address indexed owner, address indexed spender, uint256 value)",
    "event DelegateChanged(address indexed delegator, address indexed delegatee, uint8 delegationType)",
    "event DelegatedPowerChanged(address indexed user, uint256 amount, uint8 delegationType)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
    "function _aaveGovernance() view returns (address)",
    "function _nonces(address) view returns (uint256)",
    "function _votingSnapshots(address, uint256) view returns (uint128 blockNumber, uint128 value)",
    "function _votingSnapshotsCounts(address) view returns (uint256)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function approve(address spender, uint256 amount) returns (bool)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
    "function decreaseAllowance(address spender, uint256 subtractedValue) returns (bool)",
    "function delegate(address delegatee)",
    "function DELEGATE_BY_TYPE_TYPEHASH() view returns (bytes32)",
    "function DELEGATE_TYPEHASH() view returns (bytes32)",
    "function delegateBySig(address delegatee, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s)",
    "function delegateByType(address delegatee, uint8 delegationType)",
    "function delegateByTypeBySig(address delegatee, uint8 delegationType, uint256 nonce, uint256 expiry, uint8 v, bytes32 r, bytes32 s)",
    "function DOMAIN_SEPARATOR() view returns (bytes32)",
    "function EIP712_REVISION() view returns (bytes)",
    "function getDelegateeByType(address delegator, uint8 delegationType) view returns (address)",
    "function getPowerAtBlock(address user, uint256 blockNumber, uint8 delegationType) view returns (uint256)",
    "function getPowerCurrent(address user, uint8 delegationType) view returns (uint256)",
    "function increaseAllowance(address spender, uint256 addedValue) returns (bool)",
    "function initialize()",
    "function name() view returns (string)",
    "function permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)",
    "function PERMIT_TYPEHASH() view returns (bytes32)",
    "function REVISION() view returns (uint256)",
    "function symbol() view returns (string)",
    "function totalSupply() view returns (uint256)",
    "function totalSupplyAt(uint256 blockNumber) view returns (uint256)",
    "function transfer(address recipient, uint256 amount) returns (bool)",
    "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)",
  ]),
  provider,
);
