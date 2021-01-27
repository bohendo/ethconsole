// SPDX-License-Identifier: MIT

pragma solidity ^0.7.1;

import "./FakeToken.sol";

contract FakeMKR is FakeToken {
    constructor() FakeToken("Uniswap V2 Token", "MKR") {}
}

