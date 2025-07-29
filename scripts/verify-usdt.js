const hre = require("hardhat");

async function main() {
  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
  
  console.log("Verifying USDT contract at:", USDT_ADDRESS);
  
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
    
  } catch (error) {
    console.error("Error verifying USDT:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });