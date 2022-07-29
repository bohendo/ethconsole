// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity 0.7.6;

contract Scratchpad {
    uint256 public a = 0;
    uint256 public b = 0;

    constructor() {}

    function fun(uint256 input) public {
        a = input;
        b = input;
        if (a % 42 == 0) b += 1;
    }

    function valid() public returns (bool) {
        return a == b;
    }
}
