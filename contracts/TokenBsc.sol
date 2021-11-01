// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenBase.sol";

contract TokenBsc is TokenBase {
    constructor() TokenBase(5000, "BSC Token", "BTK") {}
}