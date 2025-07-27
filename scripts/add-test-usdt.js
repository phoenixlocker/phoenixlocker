const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("\n💰 为测试钱包添加USDT余额\n");
    
    // 获取部署者账户
    const [deployer] = await ethers.getSigners();
    console.log(`部署者地址: ${deployer.address}`);
    
    // 部署MockUSDT合约
    console.log("📦 部署MockUSDT合约...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const initialSupply = ethers.parseUnits("1000000", 6); // 100万 USDT
    const mockUSDT = await MockUSDT.deploy(initialSupply);
    await mockUSDT.waitForDeployment();
    
    const mockUSDTAddress = await mockUSDT.getAddress();
    console.log(`✅ MockUSDT合约已部署到: ${mockUSDTAddress}`);
    console.log(`💰 部署者初始余额: ${ethers.formatUnits(initialSupply, 6)} USDT`);
    
    // 要添加USDT的测试地址列表（可以添加更多地址）
    const testAddresses = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat默认账户0
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat默认账户1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat默认账户2
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Hardhat默认账户3
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Hardhat默认账户4
    ];
    
    console.log("\n📋 为以下地址分配测试USDT:");
    
    for (const address of testAddresses) {
        try {
            // 检查当前余额
            const currentBalance = await mockUSDT.balanceOf(address);
            console.log(`\n地址: ${address}`);
            console.log(`当前USDT余额: ${ethers.formatUnits(currentBalance, 6)}`);
            
            // 如果余额少于1000 USDT，则添加10000 USDT
            if (currentBalance < ethers.parseUnits("1000", 6)) {
                const transferAmount = ethers.parseUnits("10000", 6);
                await mockUSDT.transfer(address, transferAmount);
                
                const newBalance = await mockUSDT.balanceOf(address);
                console.log(`✅ 已转账: 10000 USDT`);
                console.log(`新余额: ${ethers.formatUnits(newBalance, 6)} USDT`);
            } else {
                console.log(`✅ 余额充足，无需添加`);
            }
        } catch (error) {
            console.log(`❌ 转账失败: ${error.message}`);
        }
    }
    
    // 显示部署者剩余余额
    const deployerBalance = await mockUSDT.balanceOf(deployer.address);
    console.log(`\n📊 部署者剩余USDT余额: ${ethers.formatUnits(deployerBalance, 6)}`);
    
    console.log("\n🎉 测试USDT分配完成!");
    console.log("\n💡 提示: 现在可以使用这些地址在前端界面进行测试");
    console.log("🔗 前端地址: http://localhost:8000/app.html");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });