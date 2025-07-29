const { ethers } = require("hardhat");

async function main() {
    console.log("Verifying BSC deployment...");
    
    // Contract address from deployment
    const CONTRACT_ADDRESS = "0x1399216420db6c02E6Cd9Cf32BD6bbC3F1aF05C0";
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    
    try {
        // Get contract instance
        const PhoenixLocker = await ethers.getContractFactory("PhoenixLocker");
        const contract = PhoenixLocker.attach(CONTRACT_ADDRESS);
        
        console.log("Contract Address:", CONTRACT_ADDRESS);
        console.log("Network: BSC Mainnet");
        
        // Verify contract functions
        console.log("\n📋 Contract Verification:");
        
        // Check USDT address
        const contractUsdt = await contract.usdt();
        console.log("✅ USDT Address:", contractUsdt);
        console.log("✅ USDT Match:", contractUsdt.toLowerCase() === USDT_ADDRESS.toLowerCase());
        
        // Check constants
        const lockPeriod = await contract.LOCK_PERIOD_MONTHS();
        const totalDays = await contract.TOTAL_DAYS();
        const totalWeeks = await contract.TOTAL_WEEKS();
        
        console.log("✅ Lock Period:", lockPeriod.toString(), "months");
        console.log("✅ Total Days:", totalDays.toString(), "days");
        console.log("✅ Total Weeks:", totalWeeks.toString(), "weeks");
        
        // Check contract balance
        const contractBalance = await contract.totalContractBalance();
        console.log("✅ Contract Balance:", ethers.formatUnits(contractBalance, 18), "USDT");
        
        // Get owner
        const owner = await contract.owner();
        console.log("✅ Contract Owner:", owner);
        
        console.log("\n🎉 Contract verification completed successfully!");
        console.log("\n📱 Contract Information:");
        console.log("Contract Address:", CONTRACT_ADDRESS);
        console.log("BSC Explorer:", `https://bscscan.com/address/${CONTRACT_ADDRESS}`);
        console.log("USDT Token:", `https://bscscan.com/token/${USDT_ADDRESS}`);
        
    } catch (error) {
        console.error("❌ Verification failed:");
        console.error(error.message);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });