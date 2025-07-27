// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token contract for testing PhoenixLocker Protocol
 */
contract MockUSDT is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @dev Override decimals function, USDT uses 6 decimal places
     */
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
    
    /**
     * @dev Mint new tokens (for testing only)
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}