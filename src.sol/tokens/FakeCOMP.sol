// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./FakeToken.sol";

contract FakeCOMP is FakeToken {
    constructor() FakeToken("Fake COMP", "COMP") {}
}

