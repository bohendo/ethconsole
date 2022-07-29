// SPDX-License-Identifier: MIT
pragma solidity 0.7.6;

import "./Scratchpad.sol";
import "./tokens/FakeToken.sol";

contract Echidna  {

    Scratchpad private scratchpad;
    FakeToken private token;

    constructor() {
        scratchpad = new Scratchpad();
        token = new FakeToken("Fake Token", "FAKE");
    }

    function testFun() public {
        scratchpad.fun();
        assert(scratchpad.a() == scratchpad.b());
    }

}
