// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenBase is ERC20 {
    address public admin;
    uint256 public nonce;

    enum Step {
        Burn,
        Mint
    }
    event CrossTransfer(
        address from,
        address to,
        uint256 amount,
        uint256 date,
        uint256 nonce,
        Step indexed step
    );

    modifier onlyAdmin() {
        require(
            _msgSender() == admin,
            "Only admin is allowed to execute this operation."
        );
        _;
    }

    /**
     * @dev Constructor that gives _msgSender() all of existing tokens.
     */

    constructor(
        uint256 initialAmount,
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) {
        admin = _msgSender();
        _mint(_msgSender(), initialAmount * (10**uint256(decimals())));
    }

    function updateAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }

    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
    }

    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        _transfer(_msgSender(), recipient, amount);
        if (recipient == admin) {
            _burn(admin, amount);
            emit CrossTransfer(
                admin,
                _msgSender(),
                amount,
                block.timestamp,
                nonce,
                Step.Burn
            );
            nonce++;
        }
        return true;
    }
}
