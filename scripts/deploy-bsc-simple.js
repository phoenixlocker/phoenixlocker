const { ethers } = require("hardhat");

async function main() {
    console.log("Starting BSC deployment...");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "BNB");
    
    // BSC USDT address
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    console.log("Using USDT address:", USDT_ADDRESS);
    
    try {
        // Get contract factory
        const PhoenixLocker = await ethers.getContractFactory("PhoenixLocker");
        
        // Deploy with minimal gas settings
        console.log("Deploying PhoenixLocker contract...");
        const phoenixLocker = await PhoenixLocker.deploy(USDT_ADDRESS, {
            gasLimit: 2000000,  // Increased gas limit
            gasPrice: ethers.parseUnits("5", "gwei")  // 5 gwei
        });
        
        console.log("Waiting for deployment transaction...");
        await phoenixLocker.waitForDeployment();
        
        const contractAddress = await phoenixLocker.getAddress();
        console.log("✅ PhoenixLocker deployed to:", contractAddress);
        
        // Verify deployment
        const deployedUsdt = await phoenixLocker.usdt();
        console.log("Contract USDT address:", deployedUsdt);
        
        console.log("\n🎉 Deployment successful!");
        console.log("Contract Address:", contractAddress);
        console.log("Network: BSC Mainnet");
        console.log("Explorer:", `https://bscscan.com/address/${contractAddress}`);
        
    } catch (error) {
        console.error("❌ Deployment failed:");
        console.error(error.message);
        if (error.receipt) {
            console.error("Transaction receipt:", error.receipt);
        }
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });