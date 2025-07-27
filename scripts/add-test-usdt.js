const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    console.log("\n💰 Adding USDT balance to test wallets\n");
    
    // Get deployer account
    const [deployer] = await ethers.getSigners();
    console.log(`Deployer address: ${deployer.address}`);
    
    // Deploy MockUSDT contract
    console.log("📦 Deploying MockUSDT contract...");
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    const initialSupply = ethers.parseUnits("1000000", 6); // 1 million USDT
    const mockUSDT = await MockUSDT.deploy(initialSupply);
    await mockUSDT.waitForDeployment();
    
    const mockUSDTAddress = await mockUSDT.getAddress();
    console.log(`✅ MockUSDT contract deployed to: ${mockUSDTAddress}`);
    console.log(`💰 Deployer initial balance: ${ethers.formatUnits(initialSupply, 6)} USDT`);
    
    // List of test addresses to add USDT to (can add more addresses)
    const testAddresses = [
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", // Hardhat default account 0
        "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", // Hardhat default account 1
        "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", // Hardhat default account 2
        "0x90F79bf6EB2c4f870365E785982E1f101E93b906", // Hardhat default account 3
        "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65", // Hardhat default account 4
    ];
    
    console.log("\n📋 Allocating test USDT to the following addresses:");
    
    for (const address of testAddresses) {
        try {
            // Check current balance
            const currentBalance = await mockUSDT.balanceOf(address);
            console.log(`\nAddress: ${address}`);
            console.log(`Current USDT balance: ${ethers.formatUnits(currentBalance, 6)}`);
            
            // If balance is less than 1000 USDT, add 10000 USDT
            if (currentBalance < ethers.parseUnits("1000", 6)) {
                const transferAmount = ethers.parseUnits("10000", 6);
                await mockUSDT.transfer(address, transferAmount);
                
                const newBalance = await mockUSDT.balanceOf(address);
                console.log(`✅ Transferred: 10000 USDT`);
                console.log(`New balance: ${ethers.formatUnits(newBalance, 6)} USDT`);
            } else {
                console.log(`✅ Balance sufficient, no need to add`);
            }
        } catch (error) {
            console.log(`❌ Transfer failed: ${error.message}`);
        }
    }
    
    // Show deployer remaining balance
    const deployerBalance = await mockUSDT.balanceOf(deployer.address);
    console.log(`\n📊 Deployer remaining USDT balance: ${ethers.formatUnits(deployerBalance, 6)}`);
    
    console.log("\n🎉 Test USDT allocation completed!");
    console.log("\n💡 Tip: You can now use these addresses to test in the frontend interface");
    console.log("🔗 Frontend URL: http://localhost:8000/app.html");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });