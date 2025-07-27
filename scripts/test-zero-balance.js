const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("🧪 测试余额为0时的可提取金额显示...");
    
    // 连接到已部署的合约 - 使用最新地址
    const phoenixLockerAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const mockUSDTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    const PhoenixLocker = await ethers.getContractFactory("PhoenixLocker");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    
    const phoenixLocker = PhoenixLocker.attach(phoenixLockerAddress);
    const mockUSDT = MockUSDT.attach(mockUSDTAddress);
    
    // 获取测试账户
    const [owner, user1, user2, user3] = await ethers.getSigners();
    
    console.log("\n📥 用户3进行存款操作...");
    
    // 给用户3分配USDT
    await mockUSDT.connect(owner).transfer(user3.address, ethers.parseUnits("100", 6));
    console.log("✅ 用户3获得100 USDT");
    
    // 用户3授权并存款
    const depositAmount = ethers.parseUnits("100", 6);
    await mockUSDT.connect(user3).approve(phoenixLockerAddress, depositAmount);
    await phoenixLocker.connect(user3).deposit(depositAmount);
    console.log("✅ 用户3存款100 USDT");
    
    // 查询存款后的可提取金额
    const [dailyBefore, monthlyBefore] = await phoenixLocker.getUserWithdrawableAmounts(user3.address);
    console.log(`\n📊 存款后可提取金额:`);
    console.log(`  每日可提取: ${ethers.formatUnits(dailyBefore, 6)} USDT`);
    console.log(`  每月可提取: ${ethers.formatUnits(monthlyBefore, 6)} USDT`);
    
    // 查询余额
    const [totalAmount, remainingBefore, withdrawnBefore] = await phoenixLocker.getUserBalance(user3.address);
    console.log(`\n💰 存款后余额信息:`);
    console.log(`  总存款: ${ethers.formatUnits(totalAmount, 6)} USDT`);
    console.log(`  剩余金额: ${ethers.formatUnits(remainingBefore, 6)} USDT`);
    console.log(`  已提取: ${ethers.formatUnits(withdrawnBefore, 6)} USDT`);
    
    console.log("\n🚨 执行紧急提取，清空所有余额...");
    
    // 紧急提取所有资金
    await phoenixLocker.connect(user3).emergencyWithdraw();
    console.log("✅ 紧急提取完成");
    
    // 查询提取后的余额
    const [, remainingAfter, withdrawnAfter] = await phoenixLocker.getUserBalance(user3.address);
    console.log(`\n💰 提取后余额信息:`);
    console.log(`  剩余金额: ${ethers.formatUnits(remainingAfter, 6)} USDT`);
    console.log(`  已提取: ${ethers.formatUnits(withdrawnAfter, 6)} USDT`);
    
    // 查询提取后的可提取金额
    const [dailyAfter, monthlyAfter] = await phoenixLocker.getUserWithdrawableAmounts(user3.address);
    console.log(`\n📊 余额为0后的可提取金额:`);
    console.log(`  每日可提取: ${ethers.formatUnits(dailyAfter, 6)} USDT`);
    console.log(`  每月可提取: ${ethers.formatUnits(monthlyAfter, 6)} USDT`);
    
    // 验证结果
    if (dailyAfter.eq(0) && monthlyAfter.eq(0)) {
        console.log("\n✅ 测试通过: 余额为0时，可提取金额正确显示为0");
    } else {
        console.log("\n❌ 测试失败: 余额为0时，可提取金额应该为0");
        console.log(`  实际每日可提取: ${ethers.formatUnits(dailyAfter, 6)}`);
        console.log(`  实际每月可提取: ${ethers.formatUnits(monthlyAfter, 6)}`);
    }
    
    console.log("\n🎯 测试完成!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });