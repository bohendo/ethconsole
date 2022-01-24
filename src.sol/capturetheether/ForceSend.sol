pragma solidity ^0.4.21;

contract ForceSend {
    function ForceSend(address recipient) public payable {
        selfdestruct(recipient);
    }
}
