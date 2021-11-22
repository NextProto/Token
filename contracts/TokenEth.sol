// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TokenBase.sol";

contract TokenEth is TokenBase {
    constructor() TokenBase(500000000, "ETH Token", "ETK") {}
}
