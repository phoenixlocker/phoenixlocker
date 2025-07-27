const hre = require("hardhat");

async function main() {
  console.log("Starting PhoenixLocker Protocol functionality test...");
  
  // Get test accounts
  const [owner, user1, user2] = await hre.ethers.getSigners();
  console.log("\nTest accounts:");
  console.log("Owner:", owner.address);
  console.log("User1:", user1.address);
  console.log("User2:", user2.address);
  
  // Deploy MockUSDT contract for testing
  console.log("\n=== Deploy MockUSDT Contract ===");
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const initialSupply = hre.ethers.parseUnits("1000000", 6); // 1M USDT
  const mockUSDT = await MockUSDT.deploy(initialSupply);
  await mockUSDT.waitForDeployment();
  const usdtAddress = await mockUSDT.getAddress();
  console.log("MockUSDT deployment address:", usdtAddress);
  
  // Deploy PhoenixLocker contract
  console.log("\n=== Deploy PhoenixLocker Contract ===");
  const PhoenixLocker = await hre.ethers.getContractFactory("PhoenixLocker");
  const phoenixLocker = await PhoenixLocker.deploy(usdtAddress);
  await phoenixLocker.waitForDeployment();
  const lockerAddress = await phoenixLocker.getAddress();
  console.log("PhoenixLocker deployment address:", lockerAddress);
  
  // Allocate USDT to test users
  console.log("\n=== Allocate Test USDT ===");
  const testAmount = hre.ethers.parseUnits("10000", 6); // 10,000 USDT
  await mockUSDT.transfer(user1.address, testAmount);
  await mockUSDT.transfer(user2.address, testAmount);
  
  console.log("User1 USDT balance:", hre.ethers.formatUnits(await mockUSDT.balanceOf(user1.address), 6));
  console.log("User2 USDT balance:", hre.ethers.formatUnits(await mockUSDT.balanceOf(user2.address), 6));
  
  // Test deposit functionality
  console.log("\n=== Test Deposit Functionality ===");
  const depositAmount = hre.ethers.parseUnits("1000", 6); // 1,000 USDT
  
  // User1 deposit
  await mockUSDT.connect(user1).approve(lockerAddress, depositAmount);
  await phoenixLocker.connect(user1).deposit(depositAmount);
  console.log("User1 deposit successful:", hre.ethers.formatUnits(depositAmount, 6), "USDT");
  
  // User2 deposit
  await mockUSDT.connect(user2).approve(lockerAddress, depositAmount);
  await phoenixLocker.connect(user2).deposit(depositAmount);
  console.log("User2 deposit successful:", hre.ethers.formatUnits(depositAmount, 6), "USDT");
  
  // Query contract total balance
  const totalBalance = await phoenixLocker.getTotalContractBalance();
  console.log("Contract total balance:", hre.ethers.formatUnits(totalBalance, 6), "USDT");
  
  // Query user balance
  console.log("\n=== Query User Balance ===");
  const [user1Total, user1Remaining, user1Withdrawn] = await phoenixLocker.getUserBalance(user1.address);
  console.log("User1 - Total deposit:", hre.ethers.formatUnits(user1Total, 6), "USDT");
  console.log("User1 - Remaining:", hre.ethers.formatUnits(user1Remaining, 6), "USDT");
  console.log("User1 - Withdrawn:", hre.ethers.formatUnits(user1Withdrawn, 6), "USDT");
  
  // Query daily/monthly withdrawable amounts
  const [dailyWithdrawable, monthlyWithdrawable] = await phoenixLocker.getUserWithdrawableAmounts(user1.address);
  console.log("User1 - Daily withdrawable:", hre.ethers.formatUnits(dailyWithdrawable, 6), "USDT");
  console.log("User1 - Monthly withdrawable:", hre.ethers.formatUnits(monthlyWithdrawable, 6), "USDT");
  
  // Query all users
  console.log("\n=== Query All Users ===");
  const allUsers = await phoenixLocker.getAllDepositUsers();
  console.log("Number of users with funds:", allUsers.length);
  console.log("User list:", allUsers);
  
  // Simulate time progression and test withdrawal functionality
  console.log("\n=== Test Withdrawal Functionality ===");
  
  // Increase time by 1 day
  await hre.network.provider.send("evm_increaseTime", [86400]); // 1 day
  await hre.network.provider.send("evm_mine");
  
  // Query current withdrawable amount
  const availableDaily = await phoenixLocker.getAvailableDailyWithdraw(user1.address);
  console.log("User1 current daily withdrawable:", hre.ethers.formatUnits(availableDaily, 6), "USDT");
  
  // Daily withdrawal
  if (availableDaily > 0) {
    const balanceBefore = await mockUSDT.balanceOf(user1.address);
    await phoenixLocker.connect(user1).withdrawDaily();
    const balanceAfter = await mockUSDT.balanceOf(user1.address);
    const withdrawn = balanceAfter - balanceBefore;
    console.log("User1 daily withdrawal successful:", hre.ethers.formatUnits(withdrawn, 6), "USDT");
  }
  
  // Increase time by 1 month
  await hre.network.provider.send("evm_increaseTime", [30 * 86400]); // 30 days
  await hre.network.provider.send("evm_mine");
  
  // 查询当前可提取金额
  const availableMonthly = await phoenixLocker.getAvailableMonthlyWithdraw(user2.address);
  console.log("User2 current monthly withdrawable:", hre.ethers.formatUnits(availableMonthly, 6), "USDT");
  
  // Monthly withdrawal
  if (availableMonthly > 0) {
    const balanceBefore = await mockUSDT.balanceOf(user2.address);
    await phoenixLocker.connect(user2).withdrawMonthly();
    const balanceAfter = await mockUSDT.balanceOf(user2.address);
    const withdrawn = balanceAfter - balanceBefore;
    console.log("User2 monthly withdrawal successful:", hre.ethers.formatUnits(withdrawn, 6), "USDT");
  }
  
  // Query transaction records
  console.log("\n=== Query Transaction Records ===");
  const user1Transactions = await phoenixLocker.getUserTransactions(user1.address);
  console.log("User1 transaction record count:", user1Transactions.length);
  
  for (let i = 0; i < user1Transactions.length; i++) {
    const tx = user1Transactions[i];
    console.log(`Transaction ${i + 1}:`, {
      Type: tx.isDeposit ? "Deposit" : "Withdrawal",
      Amount: hre.ethers.formatUnits(tx.amount, 6) + " USDT",
      Time: new Date(Number(tx.timestamp) * 1000).toLocaleString()
    });
  }
  
  // Final status query
  console.log("\n=== Final Status ===");
  const finalTotalBalance = await phoenixLocker.getTotalContractBalance();
  console.log("Contract final balance:", hre.ethers.formatUnits(finalTotalBalance, 6), "USDT");
  
  const [user1FinalTotal, user1FinalRemaining, user1FinalWithdrawn] = await phoenixLocker.getUserBalance(user1.address);
  console.log("User1 final status:");
  console.log("  - Total deposit:", hre.ethers.formatUnits(user1FinalTotal, 6), "USDT");
  console.log("  - Remaining:", hre.ethers.formatUnits(user1FinalRemaining, 6), "USDT");
  console.log("  - Withdrawn:", hre.ethers.formatUnits(user1FinalWithdrawn, 6), "USDT");
  
  const [user2FinalTotal, user2FinalRemaining, user2FinalWithdrawn] = await phoenixLocker.getUserBalance(user2.address);
  console.log("User2 final status:");
  console.log("  - Total deposit:", hre.ethers.formatUnits(user2FinalTotal, 6), "USDT");
  console.log("  - Remaining:", hre.ethers.formatUnits(user2FinalRemaining, 6), "USDT");
  console.log("  - Withdrawn:", hre.ethers.formatUnits(user2FinalWithdrawn, 6), "USDT");
  
  console.log("\n🎉 PhoenixLocker Protocol functionality test completed!");
  console.log("\nContract address information:");
  console.log("MockUSDT:", usdtAddress);
  console.log("PhoenixLocker:", lockerAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Test failed:", error);
    process.exit(1);
  });