// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDT
 * @dev 模拟USDT代币合约，用于测试PhoenixLocker Protocol
 */
contract MockUSDT is ERC20 {
    constructor(uint256 initialSupply) ERC20("Mock USDT", "USDT") {
        _mint(msg.sender, initialSupply);
    }
    
    /**
     * @dev 重写decimals函数，USDT使用6位小数
     */
    function decimals() public view virtual override returns (uint8) {
        return 6;
    }
    
    /**
     * @dev 铸造新代币（仅用于测试）
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}