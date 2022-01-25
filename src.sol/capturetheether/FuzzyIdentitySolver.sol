// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity 0.8.9;

interface FuzzyIdentityChallenge {
    function authenticate() external;
    function isComplete() external view returns (bool);
}

contract FuzzyIdentitySolution {
    constructor () {}

    function name() public pure returns(bytes32) {
      return bytes32("smarx");
    }

    function authenticate(address challenge) public {
      FuzzyIdentityChallenge(challenge).authenticate();
    }
}

// partially copied from create2 section of:
// https://docs.soliditylang.org/en/v0.8.11/control-structures.html
contract FuzzyIdentitySolver {
  FuzzyIdentitySolution public solution;

    constructor(bytes32 salt) {
        address predictedAddress = address(uint160(uint(keccak256(abi.encodePacked(
            bytes1(0xff),
            address(this),
            salt,
            keccak256(abi.encodePacked(
                type(FuzzyIdentitySolution).creationCode
            ))
        )))));
        solution = new FuzzyIdentitySolution{salt: salt}();
        require(address(solution) == predictedAddress);
    }

}
