const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("\n🚀 PhoenixLocker Protocol Complete Demo Started\n");
    
    // Get signers
    const [deployer, user1, user2] = await ethers.getSigners();
    
    console.log("📋 Account Information:");
    console.log(`Deployer: ${deployer.address}`);
    console.log(`User1: ${user1.address}`);
    console.log(`User2: ${user2.address}\n`);
    
    // 1. Deploy MockUSDT contract
    console.log("📦 Deploying MockUSDT contract...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const mockUSDT = await MockUSDT.deploy(ethers.parseUnits("1000000", 6)); // 1 million USDT
    await mockUSDT.waitForDeployment();
    console.log(`✅ MockUSDT deployed successfully: ${await mockUSDT.getAddress()}\n`);
    
    // 2. Deploy PhoenixLocker contract
    console.log("🔒 Deploying PhoenixLocker contract...");
    const PhoenixLocker = await ethers.getContractFactory("PhoenixLocker");
    const phoenixLocker = await PhoenixLocker.deploy(await mockUSDT.getAddress());
    await phoenixLocker.waitForDeployment();
    console.log(`✅ PhoenixLocker deployed successfully: ${await phoenixLocker.getAddress()}\n`);
    
    // 3. Allocate test USDT to users
    console.log("💰 Allocating test USDT...");
    await mockUSDT.transfer(user1.address, ethers.parseUnits("10000", 6)); // 10k USDT
    await mockUSDT.transfer(user2.address, ethers.parseUnits("5000", 6));  // 5k USDT
    
    const user1Balance = await mockUSDT.balanceOf(user1.address);
    const user2Balance = await mockUSDT.balanceOf(user2.address);
    console.log(`User1 USDT balance: ${ethers.formatUnits(user1Balance, 6)}`);
    console.log(`User2 USDT balance: ${ethers.formatUnits(user2Balance, 6)}\n`);
    
    // 4. User1 deposit operation
    console.log("📥 User1 deposit operation...");
    const depositAmount1 = ethers.parseUnits("1000", 6); // 1000 USDT
    
    // Approve
    await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), depositAmount1);
    console.log("✅ User1 approval completed");
    
    // Deposit
    const depositTx1 = await phoenixLocker.connect(user1).deposit(depositAmount1);
    await depositTx1.wait();
    console.log("✅ User1 deposit completed: 1000 USDT\n");
    
    // 5. User2 deposit operation
    console.log("📥 User2 deposit operation...");
    const depositAmount2 = ethers.parseUnits("500", 6); // 500 USDT
    
    // Approve
    await mockUSDT.connect(user2).approve(await phoenixLocker.getAddress(), depositAmount2);
    console.log("✅ User2 approval completed");
    
    // Deposit
    const depositTx2 = await phoenixLocker.connect(user2).deposit(depositAmount2);
    await depositTx2.wait();
    console.log("✅ User2 deposit completed: 500 USDT\n");
    
    // 6. Query contract status
    console.log("📊 Querying contract status...");
    const totalBalance = await phoenixLocker.getTotalContractBalance();
    const depositUsers = await phoenixLocker.getAllDepositUsers();
    console.log(`Contract total balance: ${ethers.formatUnits(totalBalance, 6)} USDT`);
    console.log(`Number of deposit users: ${depositUsers.length}`);
    console.log(`Deposit users list: ${depositUsers.join(", ")}\n`);
    
    // 7. Query user balance information
    console.log("👤 Querying user balance information...");
    
    // User1 balance information
    const [totalDeposit1, remainingAmount1, withdrawnAmount1] = await phoenixLocker.getUserBalance(user1.address);
    console.log(`User1 - Total deposit: ${ethers.formatUnits(totalDeposit1, 6)} USDT`);
    console.log(`User1 - Remaining amount: ${ethers.formatUnits(remainingAmount1, 6)} USDT`);
    console.log(`User1 - Withdrawn: ${ethers.formatUnits(withdrawnAmount1, 6)} USDT`);
    
    // User2 balance information
    const [totalDeposit2, remainingAmount2, withdrawnAmount2] = await phoenixLocker.getUserBalance(user2.address);
    console.log(`User2 - Total deposit: ${ethers.formatUnits(totalDeposit2, 6)} USDT`);
    console.log(`User2 - Remaining amount: ${ethers.formatUnits(remainingAmount2, 6)} USDT`);
    console.log(`User2 - Withdrawn: ${ethers.formatUnits(withdrawnAmount2, 6)} USDT\n`);
    
    // 8. Query withdrawable amounts
    console.log("💸 Querying withdrawable amounts...");
    
    // User1 withdrawable amounts
    const [dailyWithdrawable1, weeklyWithdrawable1, monthlyWithdrawable1] = await phoenixLocker.getUserWithdrawableAmounts(user1.address);
    console.log(`User1 - Daily withdrawable: ${ethers.formatUnits(dailyWithdrawable1, 6)} USDT`);
    console.log(`User1 - Weekly withdrawable: ${ethers.formatUnits(weeklyWithdrawable1, 6)} USDT`);
    console.log(`User1 - Monthly withdrawable: ${ethers.formatUnits(monthlyWithdrawable1, 6)} USDT`);
    
    // User2 withdrawable amounts
    const [dailyWithdrawable2, weeklyWithdrawable2, monthlyWithdrawable2] = await phoenixLocker.getUserWithdrawableAmounts(user2.address);
    console.log(`User2 - Daily withdrawable: ${ethers.formatUnits(dailyWithdrawable2, 6)} USDT`);
    console.log(`User2 - Weekly withdrawable: ${ethers.formatUnits(weeklyWithdrawable2, 6)} USDT`);
    console.log(`User2 - Monthly withdrawable: ${ethers.formatUnits(monthlyWithdrawable2, 6)} USDT\n`);
    
    // 9. User1 execute weekly withdrawal
    console.log("📤 User1 executing weekly withdrawal...");
    try {
        const withdrawTx1 = await phoenixLocker.connect(user1).withdrawWeekly();
        await withdrawTx1.wait();
        
        const withdrawnAmount = ethers.formatUnits(weeklyWithdrawable1, 6);
        console.log(`✅ User1 weekly withdrawal successful: ${withdrawnAmount} USDT\n`);
        
        // Query balance after withdrawal
        const [, newRemainingAmount1] = await phoenixLocker.getUserBalance(user1.address);
        console.log(`User1 remaining after withdrawal: ${ethers.formatUnits(newRemainingAmount1, 6)} USDT\n`);
    } catch (error) {
        console.log(`❌ User1 weekly withdrawal failed: ${error.message}\n`);
    }
    
    // 10. User2 execute monthly withdrawal
    console.log("📤 User2 executing monthly withdrawal...");
    try {
        const withdrawTx2 = await phoenixLocker.connect(user2).withdrawMonthly();
        await withdrawTx2.wait();
        
        const withdrawnAmount = ethers.formatUnits(monthlyWithdrawable2, 6);
        console.log(`✅ User2 monthly withdrawal successful: ${withdrawnAmount} USDT\n`);
        
        // Query balance after withdrawal
        const [, newRemainingAmount2] = await phoenixLocker.getUserBalance(user2.address);
        console.log(`User2 remaining after withdrawal: ${ethers.formatUnits(newRemainingAmount2, 6)} USDT\n`);
    } catch (error) {
        console.log(`❌ User2 monthly withdrawal failed: ${error.message}\n`);
    }
    
    // 11. Query transaction records
    console.log("📝 Querying transaction records...");
    
    // User1 transaction records
    const transactions1 = await phoenixLocker.getUserTransactions(user1.address);
    console.log(`User1 transaction records (${transactions1.length} records):`);
    transactions1.forEach((tx, index) => {
        const type = tx.isDeposit ? "Deposit" : "Withdrawal";
        const amount = ethers.formatUnits(tx.amount, 6);
        const timestamp = new Date(Number(tx.timestamp) * 1000).toLocaleString();
        console.log(`  ${index + 1}. ${type}: ${amount} USDT (${timestamp})`);
    });
    
    // User2 transaction records
    const transactions2 = await phoenixLocker.getUserTransactions(user2.address);
    console.log(`\nUser2 transaction records (${transactions2.length} records):`);
    transactions2.forEach((tx, index) => {
        const type = tx.isDeposit ? "Deposit" : "Withdrawal";
        const amount = ethers.formatUnits(tx.amount, 6);
        const timestamp = new Date(Number(tx.timestamp) * 1000).toLocaleString();
        console.log(`  ${index + 1}. ${type}: ${amount} USDT (${timestamp})`);
    });
    
    // 12. Final status summary
    console.log("\n📋 Final Status Summary:");
    const finalTotalBalance = await phoenixLocker.getTotalContractBalance();
    console.log(`Contract final balance: ${ethers.formatUnits(finalTotalBalance, 6)} USDT`);
    
    const [finalTotal1, finalRemaining1, finalWithdrawn1] = await phoenixLocker.getUserBalance(user1.address);
    const [finalTotal2, finalRemaining2, finalWithdrawn2] = await phoenixLocker.getUserBalance(user2.address);
    
    console.log(`\nUser1 final status:`);
    console.log(`  Total deposit: ${ethers.formatUnits(finalTotal1, 6)} USDT`);
    console.log(`  Remaining amount: ${ethers.formatUnits(finalRemaining1, 6)} USDT`);
    console.log(`  Withdrawn: ${ethers.formatUnits(finalWithdrawn1, 6)} USDT`);
    
    console.log(`\nUser2 final status:`);
    console.log(`  Total deposit: ${ethers.formatUnits(finalTotal2, 6)} USDT`);
    console.log(`  Remaining amount: ${ethers.formatUnits(finalRemaining2, 6)} USDT`);
    console.log(`  Withdrawn: ${ethers.formatUnits(finalWithdrawn2, 6)} USDT`);
    
    console.log("\n🎉 PhoenixLocker Protocol Complete Demo Finished!");
    console.log("\n📱 Frontend interface address: http://localhost:8000");
    console.log("🔗 Contract address information:");
    console.log(`  PhoenixLocker: ${await phoenixLocker.getAddress()}`);
    console.log(`  MockUSDT: ${await mockUSDT.getAddress()}`);
    console.log("\n💡 Tip: You can use the frontend interface to interact with the contract for testing");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });