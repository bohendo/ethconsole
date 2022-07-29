// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./FakeToken.sol";

contract FakeMKR is FakeToken {
    constructor() FakeToken("Fake MKR", "MKR") {}
}

