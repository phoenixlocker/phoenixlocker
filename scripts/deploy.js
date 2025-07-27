const hre = require("hardhat");

async function main() {
  console.log("Starting PhoenixLocker Protocol deployment...");

  // Get contract factory
  const PhoenixLocker = await hre.ethers.getContractFactory("PhoenixLocker");
  
  // USDT contract address (modify according to actual network)
  // Mainnet USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7
  // Testnet can deploy a mock USDT contract
  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // Mainnet USDT address
  
  console.log("Using USDT contract address:", USDT_ADDRESS);
  
  // Deploy contract
  const phoenixLocker = await PhoenixLocker.deploy(USDT_ADDRESS);
  
  await phoenixLocker.waitForDeployment();
  
  const contractAddress = await phoenixLocker.getAddress();
  
  console.log("PhoenixLocker Protocol deployed successfully!");
  console.log("Contract address:", contractAddress);
  console.log("USDT token address:", USDT_ADDRESS);
  
  // Verify deployment
  console.log("\nVerifying contract deployment...");
  const totalBalance = await phoenixLocker.getTotalContractBalance();
  console.log("Contract initial balance:", totalBalance.toString());
  
  console.log("\nDeployment complete! You can start using PhoenixLocker Protocol");
  console.log("\nMain functions:");
  console.log("1. deposit(amount) - Deposit USDT");
  console.log("2. withdrawDaily() - Withdraw funds daily");
  console.log("3. withdrawMonthly() - Withdraw funds monthly");
  console.log("4. getUserBalance(address) - Query user balance");
  console.log("5. getTotalContractBalance() - Query contract total balance");
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });