const hre = require("hardhat");

async function main() {
  console.log("Checking account balance on BNB Smart Chain...");
  
  const [signer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(signer.address);
  
  console.log("Account address:", signer.address);
  console.log("BNB balance:", hre.ethers.formatEther(balance), "BNB");
  
  // Estimate gas for deployment
  const PhoenixLocker = await hre.ethers.getContractFactory("PhoenixLocker");
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT
  
  try {
    const deploymentData = PhoenixLocker.getDeployTransaction(USDT_ADDRESS);
    const gasEstimate = await hre.ethers.provider.estimateGas(deploymentData);
    const feeData = await hre.ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice || hre.ethers.parseUnits("5", "gwei");
    
    const estimatedCost = gasEstimate * gasPrice;
    console.log("\nDeployment Cost Estimation:");
    console.log("Estimated gas:", gasEstimate.toString());
    console.log("Gas price:", hre.ethers.formatUnits(gasPrice, "gwei"), "gwei");
    console.log("Estimated deployment cost:", hre.ethers.formatEther(estimatedCost), "BNB");
    
    if (balance < estimatedCost) {
      console.log("\n❌ Insufficient BNB balance for deployment!");
      console.log("Need at least:", hre.ethers.formatEther(estimatedCost), "BNB");
      console.log("Current balance:", hre.ethers.formatEther(balance), "BNB");
      console.log("Shortfall:", hre.ethers.formatEther(estimatedCost - balance), "BNB");
    } else {
      console.log("\n✅ Sufficient BNB balance for deployment");
      console.log("Remaining after deployment:", hre.ethers.formatEther(balance - estimatedCost), "BNB");
    }
  } catch (error) {
    console.log("\nCould not estimate deployment cost:", error.message);
  }
  
  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("\n📋 Network Information:");
  console.log("Network name:", network.name);
  console.log("Chain ID:", network.chainId.toString());
  
  // Get current block info
  try {
    const blockNumber = await hre.ethers.provider.getBlockNumber();
    console.log("Current block:", blockNumber);
  } catch (error) {
    console.log("Could not get block number:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });