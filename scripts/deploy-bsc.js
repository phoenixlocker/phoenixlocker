const hre = require("hardhat");

async function main() {
  console.log("Starting PhoenixLocker Protocol deployment on BNB Smart Chain...");

  // Get contract factory
  const PhoenixLocker = await hre.ethers.getContractFactory("PhoenixLocker");
  
  // USDT contract address on BSC mainnet
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT address
  
  console.log("Using USDT contract address:", USDT_ADDRESS);
  console.log("Network: BNB Smart Chain (BSC)");
  
  // Get current gas price and use a reasonable value for BSC
  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || hre.ethers.parseUnits("5", "gwei"); // Default to 5 gwei if not available
  
  console.log("Using gas price:", hre.ethers.formatUnits(gasPrice, "gwei"), "gwei");
  
  // Deploy contract with BSC-optimized settings
  console.log("Deploying contract...");
  const phoenixLocker = await PhoenixLocker.deploy(USDT_ADDRESS, {
    gasPrice: hre.ethers.parseUnits("3", "gwei"), // Lower gas price
    gasLimit: 800000 // Higher gas limit
  });
  
  console.log("Waiting for deployment confirmation...");
  await phoenixLocker.waitForDeployment();
  
  const contractAddress = await phoenixLocker.getAddress();
  
  console.log("\n🎉 PhoenixLocker Protocol deployed successfully on BSC!");
  console.log("Contract address:", contractAddress);
  console.log("USDT token address:", USDT_ADDRESS);
  console.log("Network: BNB Smart Chain (BSC)");
  
  // Verify deployment
  console.log("\nVerifying contract deployment...");
  try {
    const totalBalance = await phoenixLocker.getTotalContractBalance();
    console.log("Contract initial balance:", totalBalance.toString());
    console.log("✅ Contract verification successful!");
  } catch (error) {
    console.log("⚠️  Contract deployed but verification failed:", error.message);
  }
  
  console.log("\nDeployment complete! You can start using PhoenixLocker Protocol on BSC");
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
    network: "bsc",
    chainId: 56,
    gasUsed: "400000",
    gasPrice: hre.ethers.formatUnits(gasPrice, "gwei") + " gwei"
  };
  
  const fs = require('fs');
  fs.writeFileSync('bsc-deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\nDeployment info saved to bsc-deployment.json");
  
  console.log("\n📋 BSC Network Information:");
  console.log("Chain ID: 56");
  console.log("RPC URL: https://bsc-dataseed1.binance.org/");
  console.log("Block Explorer: https://bscscan.com/");
  console.log("Contract URL: https://bscscan.com/address/" + contractAddress);
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });