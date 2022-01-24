pragma solidity ^0.4.21;

import "./FiftyYearsChallenge.sol";

contract FiftyYearsSolver {
    FiftyYearsChallenge public challenge;

    function FiftyYearsSolver(address _challenge) public payable {
        challenge = FiftyYearsChallenge(_challenge);
        // challenge.doSomething();
        require(challenge.isComplete());
        selfdestruct(msg.sender);
    }

}
