// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity ^0.7.0;

import "./IERC20.sol";

interface IWETH is IERC20 {
    function deposit() external payable;
    function withdraw(uint) external;
}
