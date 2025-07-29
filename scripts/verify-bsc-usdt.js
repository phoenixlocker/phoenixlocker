const hre = require("hardhat");

async function main() {
  const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955"; // BSC USDT address
  
  console.log("Verifying USDT contract on BSC at:", USDT_ADDRESS);
  console.log("Network: BNB Smart Chain (BSC)");
  
  try {
    // Check if contract exists
    const code = await hre.ethers.provider.getCode(USDT_ADDRESS);
    if (code === "0x") {
      console.log("❌ No contract found at this address");
      return;
    }
    
    console.log("✅ Contract exists at address");
    
    // Try to create USDT contract instance
    const usdtAbi = [
      "function name() view returns (string)",
      "function symbol() view returns (string)",
      "function decimals() view returns (uint8)",
      "function totalSupply() view returns (uint256)"
    ];
    
    const usdt = new hre.ethers.Contract(USDT_ADDRESS, usdtAbi, hre.ethers.provider);
    
    try {
      const name = await usdt.name();
      console.log("Token name:", name);
    } catch (e) {
      console.log("Could not get name:", e.message);
    }
    
    try {
      const symbol = await usdt.symbol();
      console.log("Token symbol:", symbol);
    } catch (e) {
      console.log("Could not get symbol:", e.message);
    }
    
    try {
      const decimals = await usdt.decimals();
      console.log("Token decimals:", decimals.toString());
    } catch (e) {
      console.log("Could not get decimals:", e.message);
    }
    
    try {
      const totalSupply = await usdt.totalSupply();
      console.log("Total supply:", hre.ethers.formatUnits(totalSupply, 18));
    } catch (e) {
      console.log("Could not get total supply:", e.message);
    }
    
    console.log("\n📋 BSC Network Information:");
    console.log("Chain ID: 56");
    console.log("RPC URL: https://bsc-dataseed1.binance.org/");
    console.log("Block Explorer: https://bscscan.com/");
    console.log("Token URL: https://bscscan.com/token/" + USDT_ADDRESS);
    
  } catch (error) {
    console.error("Error verifying USDT on BSC:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });