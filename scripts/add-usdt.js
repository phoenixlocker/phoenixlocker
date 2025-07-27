const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("开始为账号1添加10000 USDT...");
    
    // 获取账户
    const [deployer, user1] = await ethers.getSigners();
    
    console.log("部署者地址:", deployer.address);
    console.log("用户1地址:", user1.address);
    
    // MockUSDT合约地址（从最新部署中获取）
    const MOCK_USDT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    // 连接到MockUSDT合约
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = MockUSDT.attach(MOCK_USDT_ADDRESS);
    
    // 检查用户1当前USDT余额
    const currentBalance = await mockUSDT.balanceOf(user1.address);
    console.log("用户1当前USDT余额:", ethers.formatUnits(currentBalance, 6), "USDT");
    
    // 给用户1分配10000 USDT
    const amountToAdd = ethers.parseUnits("10000", 6);
    console.log("正在给用户1添加10000 USDT...");
    
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