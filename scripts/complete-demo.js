const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("\n🚀 PhoenixLocker Protocol 完整演示开始\n");
    
    // 获取签名者
    const [deployer, user1, user2] = await ethers.getSigners();
    
    console.log("📋 账户信息:");
    console.log(`部署者: ${deployer.address}`);
    console.log(`用户1: ${user1.address}`);
    console.log(`用户2: ${user2.address}\n`);
    
    // 1. 部署MockUSDT合约
    console.log("📦 部署MockUSDT合约...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy(ethers.parseUnits("1000000", 6)); // 100万USDT
    await mockUSDT.waitForDeployment();
    console.log(`✅ MockUSDT部署成功: ${await mockUSDT.getAddress()}\n`);
    
    // 2. 部署PhoenixLocker合约
    console.log("🔒 部署PhoenixLocker合约...");
    const PhoenixLocker = await ethers.getContractFactory("PhoenixLocker");
    const phoenixLocker = await PhoenixLocker.deploy(await mockUSDT.getAddress());
    await phoenixLocker.waitForDeployment();
    console.log(`✅ PhoenixLocker部署成功: ${await phoenixLocker.getAddress()}\n`);
    
    // 3. 给用户分配测试USDT
    console.log("💰 分配测试USDT...");
    await mockUSDT.transfer(user1.address, ethers.parseUnits("10000", 6)); // 1万USDT
    await mockUSDT.transfer(user2.address, ethers.parseUnits("5000", 6));  // 5千USDT
    
    const user1Balance = await mockUSDT.balanceOf(user1.address);
    const user2Balance = await mockUSDT.balanceOf(user2.address);
    console.log(`用户1 USDT余额: ${ethers.formatUnits(user1Balance, 6)}`);
    console.log(`用户2 USDT余额: ${ethers.formatUnits(user2Balance, 6)}\n`);
    
    // 4. 用户1存款操作
    console.log("📥 用户1存款操作...");
    const depositAmount1 = ethers.parseUnits("1000", 6); // 1000 USDT
    
    // 授权
    await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), depositAmount1);
    console.log("✅ 用户1授权完成");
    
    // 存款
    const depositTx1 = await phoenixLocker.connect(user1).deposit(depositAmount1);
    await depositTx1.wait();
    console.log("✅ 用户1存款完成: 1000 USDT\n");
    
    // 5. 用户2存款操作
    console.log("📥 用户2存款操作...");
    const depositAmount2 = ethers.parseUnits("500", 6); // 500 USDT
    
    // 授权
    await mockUSDT.connect(user2).approve(await phoenixLocker.getAddress(), depositAmount2);
    console.log("✅ 用户2授权完成");
    
    // 存款
    const depositTx2 = await phoenixLocker.connect(user2).deposit(depositAmount2);
    await depositTx2.wait();
    console.log("✅ 用户2存款完成: 500 USDT\n");
    
    // 6. 查询合约状态
    console.log("📊 查询合约状态...");
    const totalBalance = await phoenixLocker.getTotalContractBalance();
    const depositUsers = await phoenixLocker.getAllDepositUsers();
    console.log(`合约总余额: ${ethers.formatUnits(totalBalance, 6)} USDT`);
    console.log(`存款用户数量: ${depositUsers.length}`);
    console.log(`存款用户列表: ${depositUsers.join(", ")}\n`);
    
    // 7. 查询用户余额信息
    console.log("👤 查询用户余额信息...");
    
    // 用户1余额信息
    const [totalDeposit1, remainingAmount1, withdrawnAmount1] = await phoenixLocker.getUserBalance(user1.address);
    console.log(`用户1 - 总存款: ${ethers.formatUnits(totalDeposit1, 6)} USDT`);
    console.log(`用户1 - 剩余金额: ${ethers.formatUnits(remainingAmount1, 6)} USDT`);
    console.log(`用户1 - 已提取: ${ethers.formatUnits(withdrawnAmount1, 6)} USDT`);
    
    // 用户2余额信息
    const [totalDeposit2, remainingAmount2, withdrawnAmount2] = await phoenixLocker.getUserBalance(user2.address);
    console.log(`用户2 - 总存款: ${ethers.formatUnits(totalDeposit2, 6)} USDT`);
    console.log(`用户2 - 剩余金额: ${ethers.formatUnits(remainingAmount2, 6)} USDT`);
    console.log(`用户2 - 已提取: ${ethers.formatUnits(withdrawnAmount2, 6)} USDT\n`);
    
    // 8. 查询可提取金额
    console.log("💸 查询可提取金额...");
    
    // 用户1可提取金额
    const [dailyWithdrawable1, weeklyWithdrawable1, monthlyWithdrawable1] = await phoenixLocker.getUserWithdrawableAmounts(user1.address);
    console.log(`用户1 - 每日可提取: ${ethers.formatUnits(dailyWithdrawable1, 6)} USDT`);
    console.log(`用户1 - 每周可提取: ${ethers.formatUnits(weeklyWithdrawable1, 6)} USDT`);
    console.log(`用户1 - 每月可提取: ${ethers.formatUnits(monthlyWithdrawable1, 6)} USDT`);
    
    // 用户2可提取金额
    const [dailyWithdrawable2, weeklyWithdrawable2, monthlyWithdrawable2] = await phoenixLocker.getUserWithdrawableAmounts(user2.address);
    console.log(`用户2 - 每日可提取: ${ethers.formatUnits(dailyWithdrawable2, 6)} USDT`);
    console.log(`用户2 - 每周可提取: ${ethers.formatUnits(weeklyWithdrawable2, 6)} USDT`);
    console.log(`用户2 - 每月可提取: ${ethers.formatUnits(monthlyWithdrawable2, 6)} USDT\n`);
    
    // 9. 用户1执行每周提取
    console.log("📤 用户1执行每周提取...");
    try {
        const withdrawTx1 = await phoenixLocker.connect(user1).withdrawWeekly();
        await withdrawTx1.wait();
        
        const withdrawnAmount = ethers.formatUnits(weeklyWithdrawable1, 6);
        console.log(`✅ 用户1每周提取成功: ${withdrawnAmount} USDT\n`);
        
        // 查询提取后的余额
        const [, newRemainingAmount1] = await phoenixLocker.getUserBalance(user1.address);
        console.log(`用户1提取后剩余: ${ethers.formatUnits(newRemainingAmount1, 6)} USDT\n`);
    } catch (error) {
        console.log(`❌ 用户1每周提取失败: ${error.message}\n`);
    }
    
    // 10. 用户2执行每月提取
    console.log("📤 用户2执行每月提取...");
    try {
        const withdrawTx2 = await phoenixLocker.connect(user2).withdrawMonthly();
        await withdrawTx2.wait();
        
        const withdrawnAmount = ethers.formatUnits(monthlyWithdrawable2, 6);
        console.log(`✅ 用户2每月提取成功: ${withdrawnAmount} USDT\n`);
        
        // 查询提取后的余额
        const [, newRemainingAmount2] = await phoenixLocker.getUserBalance(user2.address);
        console.log(`用户2提取后剩余: ${ethers.formatUnits(newRemainingAmount2, 6)} USDT\n`);
    } catch (error) {
        console.log(`❌ 用户2每月提取失败: ${error.message}\n`);
    }
    
    // 11. 查询交易记录
    console.log("📝 查询交易记录...");
    
    // 用户1交易记录
    const transactions1 = await phoenixLocker.getUserTransactions(user1.address);
    console.log(`用户1交易记录 (${transactions1.length}条):`);
    transactions1.forEach((tx, index) => {
        const type = tx.isDeposit ? "存款" : "提款";
        const amount = ethers.formatUnits(tx.amount, 6);
        const timestamp = new Date(Number(tx.timestamp) * 1000).toLocaleString();
        console.log(`  ${index + 1}. ${type}: ${amount} USDT (${timestamp})`);
    });
    
    // 用户2交易记录
    const transactions2 = await phoenixLocker.getUserTransactions(user2.address);
    console.log(`\n用户2交易记录 (${transactions2.length}条):`);
    transactions2.forEach((tx, index) => {
        const type = tx.isDeposit ? "存款" : "提款";
        const amount = ethers.formatUnits(tx.amount, 6);
        const timestamp = new Date(Number(tx.timestamp) * 1000).toLocaleString();
        console.log(`  ${index + 1}. ${type}: ${amount} USDT (${timestamp})`);
    });
    
    // 12. 最终状态总结
    console.log("\n📋 最终状态总结:");
    const finalTotalBalance = await phoenixLocker.getTotalContractBalance();
    console.log(`合约最终余额: ${ethers.formatUnits(finalTotalBalance, 6)} USDT`);
    
    const [finalTotal1, finalRemaining1, finalWithdrawn1] = await phoenixLocker.getUserBalance(user1.address);
    const [finalTotal2, finalRemaining2, finalWithdrawn2] = await phoenixLocker.getUserBalance(user2.address);
    
    console.log(`\n用户1最终状态:`);
    console.log(`  总存款: ${ethers.formatUnits(finalTotal1, 6)} USDT`);
    console.log(`  剩余金额: ${ethers.formatUnits(finalRemaining1, 6)} USDT`);
    console.log(`  已提取: ${ethers.formatUnits(finalWithdrawn1, 6)} USDT`);
    
    console.log(`\n用户2最终状态:`);
    console.log(`  总存款: ${ethers.formatUnits(finalTotal2, 6)} USDT`);
    console.log(`  剩余金额: ${ethers.formatUnits(finalRemaining2, 6)} USDT`);
    console.log(`  已提取: ${ethers.formatUnits(finalWithdrawn2, 6)} USDT`);
    
    console.log("\n🎉 PhoenixLocker Protocol 完整演示结束!");
    console.log("\n📱 前端界面地址: http://localhost:8000");
    console.log("🔗 合约地址信息:");
    console.log(`  PhoenixLocker: ${await phoenixLocker.getAddress()}`);
    console.log(`  MockUSDT: ${await mockUSDT.getAddress()}`);
    console.log("\n💡 提示: 可以使用前端界面与合约进行交互测试");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });