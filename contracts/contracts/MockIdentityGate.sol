// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract MockIdentityGate {
    mapping(address => bool) public verified;

    function setVerified(address account, bool value) external {
        verified[account] = value;
    }

    function isVerified(address account) external view returns (bool) {
        return verified[account];
    }
}
