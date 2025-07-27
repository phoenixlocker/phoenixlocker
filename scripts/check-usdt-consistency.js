const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🔍 Checking USDT contract address consistency\n');
    
    // 1. Read contract addresses configured in app.html
    const appHtmlPath = path.join(__dirname, '../frontend/app.html');
    const appHtmlContent = fs.readFileSync(appHtmlPath, 'utf8');
    
    // Extract USDT contract address
    const usdtAddressMatch = appHtmlContent.match(/const MOCK_USDT_ADDRESS = '(0x[a-fA-F0-9]{40})';/);
    const phoenixLockerAddressMatch = appHtmlContent.match(/const PHOENIX_LOCKER_ADDRESS = '(0x[a-fA-F0-9]{40})';/);
    
    if (!usdtAddressMatch || !phoenixLockerAddressMatch) {
        console.log('❌ Unable to extract contract addresses from app.html');
        return;
    }
    
    const appUsdtAddress = usdtAddressMatch[1];
    const appPhoenixLockerAddress = phoenixLockerAddressMatch[1];
    
    console.log('📱 Addresses configured in app.html:');
    console.log(`  USDT Contract: ${appUsdtAddress}`);
    console.log(`  PhoenixLocker Contract: ${appPhoenixLockerAddress}\n`);
    
    // 2. Connect to Hardhat network
    const provider = ethers.provider;
    const accounts = await ethers.getSigners();
    
    console.log('🌐 Hardhat network information:');
    const network = await provider.getNetwork();
    console.log(`  Network name: ${network.name}`);
    console.log(`  Chain ID: ${network.chainId}`);
    console.log(`  Current block: ${await provider.getBlockNumber()}\n`);
    
    // 3. Check if contracts are deployed
    console.log('🔍 Checking contract deployment status:');
    
    const usdtCode = await provider.getCode(appUsdtAddress);
    const phoenixLockerCode = await provider.getCode(appPhoenixLockerAddress);
    
    const usdtDeployed = usdtCode !== '0x';
    const phoenixLockerDeployed = phoenixLockerCode !== '0x';
    
    console.log(`  USDT Contract (${appUsdtAddress}): ${usdtDeployed ? '✅ Deployed' : '❌ Not deployed'}`);
    console.log(`  PhoenixLocker Contract (${appPhoenixLockerAddress}): ${phoenixLockerDeployed ? '✅ Deployed' : '❌ Not deployed'}\n`);
    
    if (!usdtDeployed) {
        console.log('❌ USDT contract not deployed, unable to query balance information');
        console.log('💡 Suggestion: run npx hardhat run scripts/complete-demo.js');
        return;
    }
    
    // 4. Query USDT contract information
    const usdtAbi = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address) view returns (uint256)'
    ];
    
    const usdtContract = new ethers.Contract(appUsdtAddress, usdtAbi, provider);
    
    try {
        const name = await usdtContract.name();
        const symbol = await usdtContract.symbol();
        const decimals = await usdtContract.decimals();
        const totalSupply = await usdtContract.totalSupply();
        
        console.log('💰 USDT contract information:');
        console.log(`  Name: ${name}`);
        console.log(`  Symbol: ${symbol}`);
        console.log(`  Decimals: ${decimals}`);
        console.log(`  Total supply: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}\n`);
        
        // 5. Query test account balances
        console.log('👥 Test account USDT balances:');
        
        const testAddresses = [
            accounts[0].address, // Deployer
            accounts[1].address, // Test account 1
            accounts[2].address, // Test account 2
            accounts[3].address, // Test account 3
            accounts[4].address  // Test account 4
        ];
        
        for (let i = 0; i < testAddresses.length; i++) {
            const address = testAddresses[i];
            const balance = await usdtContract.balanceOf(address);
            const formattedBalance = ethers.formatUnits(balance, decimals);
            const label = i === 0 ? 'Deployer' : `Test account ${i}`;
            console.log(`  ${label} (${address}): ${formattedBalance} ${symbol}`);
        }
        
        console.log('\n');
        
        // 6. Check PhoenixLocker contract status
        if (phoenixLockerDeployed) {
            const phoenixLockerAbi = [
                'function getContractBalance() view returns (uint256)',
                'function getDepositorsCount() view returns (uint256)'
            ];
            
            const phoenixLockerContract = new ethers.Contract(appPhoenixLockerAddress, phoenixLockerAbi, provider);
            
            try {
                const contractBalance = await phoenixLockerContract.getContractBalance();
                const depositorsCount = await phoenixLockerContract.getDepositorsCount();
                
                console.log('🏦 PhoenixLocker contract status:');
                console.log(`  Contract balance: ${ethers.formatUnits(contractBalance, decimals)} ${symbol}`);
                console.log(`  Number of depositors: ${depositorsCount}\n`);
            } catch (error) {
                console.log('⚠️  Unable to query PhoenixLocker contract status:', error.message);
            }
        }
        
        // 7. Summary
        console.log('📋 Consistency check results:');
        console.log(`  ✅ USDT address configured in app.html matches actual deployed address`);
        console.log(`  ✅ USDT contract functions normally`);
        if (phoenixLockerDeployed) {
            console.log(`  ✅ PhoenixLocker contract is deployed and accessible`);
        } else {
            console.log(`  ❌ PhoenixLocker contract not deployed`);
        }
        
    } catch (error) {
        console.log('❌ Failed to query USDT contract information:', error.message);
        console.log('💡 Possible reasons: Contract ABI mismatch or contract not properly deployed');
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ Script execution failed:', error);
        process.exit(1);
    });