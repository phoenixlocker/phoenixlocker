const hre = require("hardhat");

async function main() {
  console.log("开始测试 PhoenixLocker Protocol 功能...");
  
  // 获取测试账户
  const [owner, user1, user2] = await hre.ethers.getSigners();
  console.log("\n测试账户:");
  console.log("Owner:", owner.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);
  
  // 部署MockUSDT合约用于测试
  console.log("\n=== 部署MockUSDT合约 ===");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const initialSupply = hre.ethers.parseUnits("1000000", 6); // 1M USDT
  const mockUSDT = await MockUSDT.deploy(initialSupply);
  await mockUSDT.waitForDeployment();
  const usdtAddress = await mockUSDT.getAddress();
  console.log("MockUSDT 部署地址:", usdtAddress);
  
  // 部署PhoenixLocker合约
  console.log("\n=== 部署PhoenixLocker合约 ===");
  const PhoenixLocker = await hre.ethers.getContractFactory("PhoenixLocker");
  const phoenixLocker = await PhoenixLocker.deploy(usdtAddress);
  await phoenixLocker.waitForDeployment();
  const lockerAddress = await phoenixLocker.getAddress();
  console.log("PhoenixLocker 部署地址:", lockerAddress);
  
  // 给测试用户分配USDT
  console.log("\n=== 分配测试USDT ===");
  const testAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDT
  await mockUSDT.transfer(user1.address, testAmount);
  await mockUSDT.transfer(user2.address, testAmount);
  
  console.log("User1 USDT余额:", hre.ethers.formatUnits(await mockUSDT.balanceOf(user1.address), 6));
  console.log("User2 USDT余额:", hre.ethers.formatUnits(await mockUSDT.balanceOf(user2.address), 6));
  
  // 测试存款功能
  console.log("\n=== 测试存款功能 ===");
  const depositAmount = hre.ethers.parseUnits("1000", 6); // 1,000 USDT
  
  // User1 存款
  await mockUSDT.connect(user1).approve(lockerAddress, depositAmount);
  await phoenixLocker.connect(user1).deposit(depositAmount);
  console.log("User1 存款成功:", hre.ethers.formatUnits(depositAmount, 6), "USDT");
  
  // User2 存款
  await mockUSDT.connect(user2).approve(lockerAddress, depositAmount);
  await phoenixLocker.connect(user2).deposit(depositAmount);
  console.log("User2 存款成功:", hre.ethers.formatUnits(depositAmount, 6), "USDT");
  
  // 查询合约总余额
  const totalBalance = await phoenixLocker.getTotalContractBalance();
  console.log("合约总余额:", hre.ethers.formatUnits(totalBalance, 6), "USDT");
  
  // 查询用户余额
  console.log("\n=== 查询用户余额 ===");
  const [user1Total, user1Remaining, user1Withdrawn] = await phoenixLocker.getUserBalance(user1.address);
  console.log("User1 - 总存款:", hre.ethers.formatUnits(user1Total, 6), "USDT");
  console.log("User1 - 剩余:", hre.ethers.formatUnits(user1Remaining, 6), "USDT");
  console.log("User1 - 已提取:", hre.ethers.formatUnits(user1Withdrawn, 6), "USDT");
  
  // 查询每日/每月可提取金额
  const [dailyWithdrawable, monthlyWithdrawable] = await phoenixLocker.getUserWithdrawableAmounts(user1.address);
  console.log("User1 - 每日可提取:", hre.ethers.formatUnits(dailyWithdrawable, 6), "USDT");
  console.log("User1 - 每月可提取:", hre.ethers.formatUnits(monthlyWithdrawable, 6), "USDT");
  
  // 查询所有用户
  console.log("\n=== 查询所有用户 ===");
  const allUsers = await phoenixLocker.getAllDepositUsers();
  console.log("有资金的用户数量:", allUsers.length);
  console.log("用户列表:", allUsers);
  
  // 模拟时间推进并测试提取功能
  console.log("\n=== 测试提取功能 ===");
  
  // 增加时间1天
  await hre.network.provider.send("evm_increaseTime", [86400]); // 1天
  await hre.network.provider.send("evm_mine");
  
  // 查询当前可提取金额
  const availableDaily = await phoenixLocker.getAvailableDailyWithdraw(user1.address);
  console.log("User1 当前可按天提取:", hre.ethers.formatUnits(availableDaily, 6), "USDT");
  
  // 按天提取
  if (availableDaily > 0) {
    const balanceBefore = await mockUSDT.balanceOf(user1.address);
    await phoenixLocker.connect(user1).withdrawDaily();
    const balanceAfter = await mockUSDT.balanceOf(user1.address);
    const withdrawn = balanceAfter - balanceBefore;
    console.log("User1 按天提取成功:", hre.ethers.formatUnits(withdrawn, 6), "USDT");
  }
  
  // 增加时间1个月
  await hre.network.provider.send("evm_increaseTime", [30 * 86400]); // 30天
  await hre.network.provider.send("evm_mine");
  
  // 查询当前可提取金额
  const availableMonthly = await phoenixLocker.getAvailableMonthlyWithdraw(user2.address);
  console.log("User2 当前可按月提取:", hre.ethers.formatUnits(availableMonthly, 6), "USDT");
  
  // 按月提取
  if (availableMonthly > 0) {
    const balanceBefore = await mockUSDT.balanceOf(user2.address);
    await phoenixLocker.connect(user2).withdrawMonthly();
    const balanceAfter = await mockUSDT.balanceOf(user2.address);
    const withdrawn = balanceAfter - balanceBefore;
    console.log("User2 按月提取成功:", hre.ethers.formatUnits(withdrawn, 6), "USDT");
  }
  
  // 查询交易记录
  console.log("\n=== 查询交易记录 ===");
  const user1Transactions = await phoenixLocker.getUserTransactions(user1.address);
  console.log("User1 交易记录数量:", user1Transactions.length);
  
  for (let i = 0; i < user1Transactions.length; i++) {
    const tx = user1Transactions[i];
    console.log(`交易 ${i + 1}:`, {
      类型: tx.isDeposit ? "存款" : "提款",
      金额: hre.ethers.formatUnits(tx.amount, 6) + " USDT",
      时间: new Date(Number(tx.timestamp) * 1000).toLocaleString()
    });
  }
  
  // 最终状态查询
  console.log("\n=== 最终状态 ===");
  const finalTotalBalance = await phoenixLocker.getTotalContractBalance();
  console.log("合约最终余额:", hre.ethers.formatUnits(finalTotalBalance, 6), "USDT");
  
  const [user1FinalTotal, user1FinalRemaining, user1FinalWithdrawn] = await phoenixLocker.getUserBalance(user1.address);
  console.log("User1 最终状态:");
  console.log("  - 总存款:", hre.ethers.formatUnits(user1FinalTotal, 6), "USDT");
  console.log("  - 剩余:", hre.ethers.formatUnits(user1FinalRemaining, 6), "USDT");
  console.log("  - 已提取:", hre.ethers.formatUnits(user1FinalWithdrawn, 6), "USDT");
  
  const [user2FinalTotal, user2FinalRemaining, user2FinalWithdrawn] = await phoenixLocker.getUserBalance(user2.address);
  console.log("User2 最终状态:");
  console.log("  - 总存款:", hre.ethers.formatUnits(user2FinalTotal, 6), "USDT");
  console.log("  - 剩余:", hre.ethers.formatUnits(user2FinalRemaining, 6), "USDT");
  console.log("  - 已提取:", hre.ethers.formatUnits(user2FinalWithdrawn, 6), "USDT");
  
  console.log("\n🎉 PhoenixLocker Protocol 功能测试完成!");
  console.log("\n合约地址信息:");
  console.log("MockUSDT:", usdtAddress);
  console.log("PhoenixLocker:", lockerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("测试失败:", error);
    process.exit(1);
  });