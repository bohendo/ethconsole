// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./FakeToken.sol";

contract FakeYFI is FakeToken {
    constructor() FakeToken("Fake YFI", "YFI") {}
}

