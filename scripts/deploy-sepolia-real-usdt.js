const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("\n🚀 Deploying PhoenixLocker to Sepolia Testnet with Real USDT\n");
    
    // Get deployer
    const [deployer] = await ethers.getSigners();
    
    console.log("📋 Account Information:");
    console.log(`Deployer: ${deployer.address}`);
    
    // Check deployer balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`Deployer ETH balance: ${ethers.formatEther(balance)} ETH\n`);
    
    // Use the specified Sepolia USDT address
    const sepoliaUSDTAddress = "0xf875fecff122927e53c3b07f4258c690b026004b";
    console.log(`Using Sepolia USDT: ${sepoliaUSDTAddress}\n`);
    
    // Deploy PhoenixLocker contract
    console.log("🔒 Deploying PhoenixLocker contract...");
    const PhoenixLocker = await ethers.getContractFactory("PhoenixLocker");
    const phoenixLocker = await PhoenixLocker.deploy(sepoliaUSDTAddress);
    await phoenixLocker.waitForDeployment();
    const phoenixLockerAddress = await phoenixLocker.getAddress();
    console.log(`✅ PhoenixLocker deployed successfully: ${phoenixLockerAddress}\n`);
    
    // Verify deployment
    console.log("🔍 Verifying deployment...");
    const contractBalance = await phoenixLocker.getTotalContractBalance();
    const usdtToken = await phoenixLocker.usdt();
    console.log(`Contract initial balance: ${ethers.formatUnits(contractBalance, 6)} USDT`);
    console.log(`USDT token address: ${usdtToken}\n`);
    
    // Contract information summary
    console.log("📋 Deployment Summary:");
    console.log(`Network: Sepolia Testnet`);
    console.log(`PhoenixLocker Contract: ${phoenixLockerAddress}`);
    console.log(`Sepolia USDT Contract: ${sepoliaUSDTAddress}`);
    console.log(`Deployer: ${deployer.address}`);
    
    console.log("\n🎉 Deployment completed successfully!");
    console.log("\n💡 Next steps:");
    console.log("1. Update app.html with the new contract addresses");
    console.log("2. Get some Sepolia USDT tokens for testing");
    console.log("3. Test the contract functions through the frontend");
    
    // Save addresses to a file for easy reference
    const fs = require('fs');
    const addresses = {
        network: "sepolia",
        phoenixLocker: phoenixLockerAddress,
        sepoliaUSDT: sepoliaUSDTAddress,
        deployer: deployer.address,
        deploymentTime: new Date().toISOString(),
        note: "Using real Sepolia USDT, not MockUSDT"
    };
    
    fs.writeFileSync('sepolia-real-usdt-deployment.json', JSON.stringify(addresses, null, 2));
    console.log("\n📄 Contract addresses saved to sepolia-real-usdt-deployment.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });