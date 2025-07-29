const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(signer.address);
  
  console.log("Account address:", signer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");
  
  // Estimate gas for deployment
  const PhoenixLocker = await hre.ethers.getContractFactory("PhoenixLocker");
  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  
  try {
    const deploymentData = PhoenixLocker.getDeployTransaction(USDT_ADDRESS);
    const gasEstimate = await hre.ethers.provider.estimateGas(deploymentData);
    const gasPrice = await hre.ethers.provider.getFeeData();
    
    const estimatedCost = gasEstimate * gasPrice.gasPrice;
    console.log("Estimated deployment cost:", hre.ethers.formatEther(estimatedCost), "ETH");
    
    if (balance < estimatedCost) {
      console.log("❌ Insufficient balance for deployment!");
      console.log("Need at least:", hre.ethers.formatEther(estimatedCost), "ETH");
    } else {
      console.log("✅ Sufficient balance for deployment");
    }
  } catch (error) {
    console.log("Could not estimate gas:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });