const hre = require("hardhat");

async function main() {
    console.log("🔍 Verifying USDT address on Sepolia...");
    
    // Test multiple USDT addresses found on Sepolia
    const usdtAddresses = [
        "0xaa8e23fb1079ea71e0a56f48a2aa51851d8433d0", // From Sepolia Etherscan
        "0x7169d38820dfd117c3fa1f22a697dba58d90ba06", // TetherToken from search
        "0xf875fecff122927e53c3b07f4258c690b026004b"  // Original address
    ];
    
    for (const usdtAddress of usdtAddresses) {
    console.log(`USDT Address: ${usdtAddress}`);
    
    try {
        // Get provider
        const provider = hre.ethers.provider;
        
        // Check if there's code at this address
        const code = await provider.getCode(usdtAddress);
        console.log(`Code length: ${code.length}`);
        
        if (code === "0x") {
            console.log("❌ No contract code found at this address!");
            console.log("This address does not contain a deployed contract.");
            return;
        }
        
        console.log("✅ Contract code found at address");
        
        // Try to interact with it as an ERC20 token
        const ERC20_ABI = [
            "function name() view returns (string)",
            "function symbol() view returns (string)",
            "function decimals() view returns (uint8)",
            "function totalSupply() view returns (uint256)",
            "function balanceOf(address) view returns (uint256)"
        ];
        
        const contract = new hre.ethers.Contract(usdtAddress, ERC20_ABI, provider);
        
        try {
            const name = await contract.name();
            console.log(`Token Name: ${name}`);
        } catch (e) {
            console.log(`❌ Failed to get name: ${e.message}`);
        }
        
        try {
            const symbol = await contract.symbol();
            console.log(`Token Symbol: ${symbol}`);
        } catch (e) {
            console.log(`❌ Failed to get symbol: ${e.message}`);
        }
        
        try {
            const decimals = await contract.decimals();
            console.log(`Token Decimals: ${decimals}`);
        } catch (e) {
            console.log(`❌ Failed to get decimals: ${e.message}`);
        }
        
        try {
            const totalSupply = await contract.totalSupply();
            console.log(`Total Supply: ${hre.ethers.utils.formatUnits(totalSupply, 6)} USDT`);
        } catch (e) {
            console.log(`❌ Failed to get total supply: ${e.message}`);
        }
        
        // Test balanceOf with a known address
        try {
            const testAddress = "0xd177ec921859f3568ecc849b7204CbC8Af8E0F89";
            const balance = await contract.balanceOf(testAddress);
            console.log(`Balance of ${testAddress}: ${hre.ethers.utils.formatUnits(balance, 6)} USDT`);
        } catch (e) {
            console.log(`❌ Failed to get balance: ${e.message}`);
        }
        
    } catch (error) {
            console.error(`❌ Error verifying USDT address: ${error.message}`);
        }
        
        console.log("\n" + "=".repeat(50) + "\n");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });