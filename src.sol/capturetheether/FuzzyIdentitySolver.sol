pragma solidity ^0.4.21;

import "./FuzzyIdentityChallenge.sol";

contract FuzzyIdentitySolution {
    FuzzyIdentityChallenge challenge = FuzzyIdentityChallenge(
      0x549d26EdF9FDC9E1203C89E69c11E411ccBdc457
    );
    function FuzzyIdentitySolution() public payable {}
    function name() public pure returns(bytes32) {
      return bytes32("smarx");
    }
    function authenticate() public {
      challenge.authenticate();
    }
}

contract FuzzyIdentitySolver {
    FuzzyIdentityChallenge public challenge;
    FuzzyIdentitySolution public solution;

    function FuzzyIdentitySolver(address _challenge, bytes initCode, bytes32 salt) public payable {
        challenge = FuzzyIdentityChallenge(_challenge);
        assembly {
            let solution := create2(
              0x0, // value to send to the newly created contract
              add(0x20, initCode),
              mload(initCode),
              salt
            )
            let codeSize := extcodesize(solution)
            if eq(codeSize, 0) { revert(0, 0) }
        }
    }

}
