// SPDX-License-Identifier: MIT

pragma solidity ^0.7.1;

import "./FakeToken.sol";

contract FakeAAVE is FakeToken {
    constructor() FakeToken("Fake AAVE", "AAVE") {}
}

