// SPDX-License-Identifier: MIT

pragma solidity ^0.7.0;

import "./FakeToken.sol";

contract FakeWBTC is FakeToken {
    constructor() FakeToken("Fake WBTC", "WBTC") {}
}

