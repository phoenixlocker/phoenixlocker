const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("🧪 Testing withdrawable amount display when balance is 0...");
    
    // Connect to deployed contract - use latest address
    const phoenixLockerAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
    const mockUSDTAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    const PhoenixLocker = await ethers.getContractFactory("PhoenixLocker");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    
    const phoenixLocker = PhoenixLocker.attach(phoenixLockerAddress);
    const mockUSDT = MockUSDT.attach(mockUSDTAddress);
    
    // Get test accounts
    const [owner, user1, user2, user3] = await ethers.getSigners();
    
    console.log("\n📥 User 3 performing deposit operation...");
    
    // Allocate USDT to user 3
    await mockUSDT.connect(owner).transfer(user3.address, ethers.parseUnits("100", 6));
    console.log("✅ User 3 received 100 USDT");
    
    // User 3 approves and deposits
    const depositAmount = ethers.parseUnits("100", 6);
    await mockUSDT.connect(user3).approve(phoenixLockerAddress, depositAmount);
    await phoenixLocker.connect(user3).deposit(depositAmount);
    console.log("✅ User 3 deposited 100 USDT");
    
    // Query withdrawable amount after deposit
    const [dailyBefore, monthlyBefore] = await phoenixLocker.getUserWithdrawableAmounts(user3.address);
    console.log(`\n📊 Withdrawable amount after deposit:`);
    console.log(`  Daily withdrawable: ${ethers.formatUnits(dailyBefore, 6)} USDT`);
    console.log(`  Monthly withdrawable: ${ethers.formatUnits(monthlyBefore, 6)} USDT`);
    
    // Query balance
    const [totalAmount, remainingBefore, withdrawnBefore] = await phoenixLocker.getUserBalance(user3.address);
    console.log(`\n💰 Balance information after deposit:`);
    console.log(`  Total deposit: ${ethers.formatUnits(totalAmount, 6)} USDT`);
    console.log(`  Remaining amount: ${ethers.formatUnits(remainingBefore, 6)} USDT`);
    console.log(`  Withdrawn: ${ethers.formatUnits(withdrawnBefore, 6)} USDT`);
    
    console.log("\n🚨 Executing emergency withdrawal, clearing all balance...");
    
    // Emergency withdraw all funds
    await phoenixLocker.connect(user3).emergencyWithdraw();
    console.log("✅ Emergency withdrawal completed");
    
    // Query balance after withdrawal
    const [, remainingAfter, withdrawnAfter] = await phoenixLocker.getUserBalance(user3.address);
    console.log(`\n💰 Balance information after withdrawal:`);
    console.log(`  Remaining amount: ${ethers.formatUnits(remainingAfter, 6)} USDT`);
    console.log(`  Withdrawn: ${ethers.formatUnits(withdrawnAfter, 6)} USDT`);
    
    // Query withdrawable amount after withdrawal
    const [dailyAfter, monthlyAfter] = await phoenixLocker.getUserWithdrawableAmounts(user3.address);
    console.log(`\n📊 Withdrawable amount after balance is 0:`);
    console.log(`  Daily withdrawable: ${ethers.formatUnits(dailyAfter, 6)} USDT`);
    console.log(`  Monthly withdrawable: ${ethers.formatUnits(monthlyAfter, 6)} USDT`);
    
    // Verify results
    if (dailyAfter.eq(0) && monthlyAfter.eq(0)) {
        console.log("\n✅ Test passed: When balance is 0, withdrawable amount correctly shows 0");
    } else {
        console.log("\n❌ Test failed: When balance is 0, withdrawable amount should be 0");
        console.log(`  Actual daily withdrawable: ${ethers.formatUnits(dailyAfter, 6)}`);
        console.log(`  Actual monthly withdrawable: ${ethers.formatUnits(monthlyAfter, 6)}`);
    }
    
    console.log("\n🎯 Test completed!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });