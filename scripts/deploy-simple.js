const hre = require("hardhat");

async function main() {
  console.log("Starting PhoenixLocker Protocol deployment...");

  // Get contract factory
  const PhoenixLocker = await hre.ethers.getContractFactory("PhoenixLocker");
  
  // USDT contract address
  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  
  console.log("Using USDT contract address:", USDT_ADDRESS);
  
  // Get current gas price and use a very low value
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice * 50n / 100n; // Use 50% of current gas price
  
  console.log("Current gas price:", hre.ethers.formatUnits(feeData.gasPrice, "gwei"), "gwei");
  console.log("Using gas price:", hre.ethers.formatUnits(gasPrice, "gwei"), "gwei");
  
  // Deploy contract with lower gas price and sufficient gas limit
  console.log("Deploying contract...");
  const phoenixLocker = await PhoenixLocker.deploy(USDT_ADDRESS, {
    gasPrice: gasPrice,
    gasLimit: 400000 // Set gas limit higher than required 344018
  });
  
  console.log("Waiting for deployment confirmation...");
  await phoenixLocker.waitForDeployment();
  
  const contractAddress = await phoenixLocker.getAddress();
  
  console.log("PhoenixLocker Protocol deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("USDT token address:", USDT_ADDRESS);
  
  // Verify deployment
  console.log("\nVerifying contract deployment...");
  try {
    const totalBalance = await phoenixLocker.getTotalContractBalance();
    console.log("Contract initial balance:", totalBalance.toString());
    console.log("✅ Contract verification successful!");
  } catch (error) {
    console.log("⚠️  Contract deployed but verification failed:", error.message);
  }
  
  console.log("\nDeployment complete! You can start using PhoenixLocker Protocol");
  console.log("\nMain functions:");
  console.log("1. deposit(amount) - Deposit USDT");
  console.log("2. withdrawDaily() - Withdraw funds daily");
  console.log("3. withdrawMonthly() - Withdraw funds monthly");
  console.log("4. getUserBalance(address) - Query user balance");
  console.log("5. getTotalContractBalance() - Query contract total balance");
  
  // Save deployment info
  const deploymentInfo = {
    contractAddress: contractAddress,
    usdtAddress: USDT_ADDRESS,
    deploymentTime: new Date().toISOString(),
    network: "mainnet"
  };
  
  const fs = require('fs');
  fs.writeFileSync('mainnet-deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to mainnet-deployment.json");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });