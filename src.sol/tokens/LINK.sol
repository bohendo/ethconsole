// SPDX-License-Identifier: MIT

pragma solidity 0.7.6;

import "./FakeToken.sol";

contract LINK is FakeToken {
    constructor() FakeToken("Chainlink Token", "LINK") {}
}

