// SPDX-License-Identifier: MIT

pragma solidity ^0.7.1;

import "./FakeToken.sol";

contract FakeUNI is FakeToken {
    constructor() FakeToken("Fake UNI", "UNI") {}
}

