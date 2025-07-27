const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("Starting to add 10000 USDT to account 1...");
    
    // Get accounts
    const [deployer, user1] = await ethers.getSigners();
    
    console.log("Deployer address:", deployer.address);
    console.log("User 1 address:", user1.address);
    
    // MockUSDT contract address (from latest deployment)
    const MOCK_USDT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    // Connect to MockUSDT contract
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = MockUSDT.attach(MOCK_USDT_ADDRESS);
    
    // Check user 1's current USDT balance
    const currentBalance = await mockUSDT.balanceOf(user1.address);
    console.log("User 1's current USDT balance:", ethers.formatUnits(currentBalance, 6), "USDT");
    
    // Allocate 10000 USDT to user 1
    const amountToAdd = ethers.parseUnits("10000", 6);
    console.log("Adding 10000 USDT to user 1...");
    
    const tx = await mockUSDT.transfer(user1.address, amountToAdd);
    await tx.wait();
    
    // 检查更新后的余额
    const newBalance = await mockUSDT.balanceOf(user1.address);
    console.log("用户1新的USDT余额:", ethers.formatUnits(newBalance, 6), "USDT");
    
    console.log("✅ 成功为用户1添加10000 USDT!");
    console.log("交易哈希:", tx.hash);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ 错误:", error);
        process.exit(1);
    });