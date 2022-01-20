pragma solidity ^0.4.21;

import "./MappingChallenge.sol";

contract MappingSolver {
    MappingChallenge public challenge;

    function MappingSolver(address _challenge) public payable {
        challenge = MappingChallenge(_challenge);
    }

}
