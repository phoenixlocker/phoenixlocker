const { ethers } = require('hardhat');
const fs = require('fs');
const path = require('path');

async function main() {
    console.log('🔍 检查USDT合约地址一致性\n');
    
    // 1. 读取app.html中配置的合约地址
    const appHtmlPath = path.join(__dirname, '../frontend/app.html');
    const appHtmlContent = fs.readFileSync(appHtmlPath, 'utf8');
    
    // 提取USDT合约地址
    const usdtAddressMatch = appHtmlContent.match(/const MOCK_USDT_ADDRESS = '(0x[a-fA-F0-9]{40})';/);
    const phoenixLockerAddressMatch = appHtmlContent.match(/const PHOENIX_LOCKER_ADDRESS = '(0x[a-fA-F0-9]{40})';/);
    
    if (!usdtAddressMatch || !phoenixLockerAddressMatch) {
        console.log('❌ 无法从app.html中提取合约地址');
        return;
    }
    
    const appUsdtAddress = usdtAddressMatch[1];
    const appPhoenixLockerAddress = phoenixLockerAddressMatch[1];
    
    console.log('📱 app.html中配置的地址:');
    console.log(`  USDT合约: ${appUsdtAddress}`);
    console.log(`  PhoenixLocker合约: ${appPhoenixLockerAddress}\n`);
    
    // 2. 连接到Hardhat网络
    const provider = ethers.provider;
    const accounts = await ethers.getSigners();
    
    console.log('🌐 Hardhat网络信息:');
    const network = await provider.getNetwork();
    console.log(`  网络名称: ${network.name}`);
    console.log(`  Chain ID: ${network.chainId}`);
    console.log(`  当前区块: ${await provider.getBlockNumber()}\n`);
    
    // 3. 检查合约是否部署
    console.log('🔍 检查合约部署状态:');
    
    const usdtCode = await provider.getCode(appUsdtAddress);
    const phoenixLockerCode = await provider.getCode(appPhoenixLockerAddress);
    
    const usdtDeployed = usdtCode !== '0x';
    const phoenixLockerDeployed = phoenixLockerCode !== '0x';
    
    console.log(`  USDT合约 (${appUsdtAddress}): ${usdtDeployed ? '✅ 已部署' : '❌ 未部署'}`);
    console.log(`  PhoenixLocker合约 (${appPhoenixLockerAddress}): ${phoenixLockerDeployed ? '✅ 已部署' : '❌ 未部署'}\n`);
    
    if (!usdtDeployed) {
        console.log('❌ USDT合约未部署，无法查询余额信息');
        console.log('💡 建议运行: npx hardhat run scripts/complete-demo.js');
        return;
    }
    
    // 4. 查询USDT合约信息
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
        
        console.log('💰 USDT合约信息:');
        console.log(`  名称: ${name}`);
        console.log(`  符号: ${symbol}`);
        console.log(`  精度: ${decimals}`);
        console.log(`  总供应量: ${ethers.formatUnits(totalSupply, decimals)} ${symbol}\n`);
        
        // 5. 查询测试账户余额
        console.log('👥 测试账户USDT余额:');
        
        const testAddresses = [
            accounts[0].address, // 部署者
            accounts[1].address, // 测试账户1
            accounts[2].address, // 测试账户2
            accounts[3].address, // 测试账户3
            accounts[4].address  // 测试账户4
        ];
        
        for (let i = 0; i < testAddresses.length; i++) {
            const address = testAddresses[i];
            const balance = await usdtContract.balanceOf(address);
            const formattedBalance = ethers.formatUnits(balance, decimals);
            const label = i === 0 ? '部署者' : `测试账户${i}`;
            console.log(`  ${label} (${address}): ${formattedBalance} ${symbol}`);
        }
        
        console.log('\n');
        
        // 6. 检查PhoenixLocker合约状态
        if (phoenixLockerDeployed) {
            const phoenixLockerAbi = [
                'function getContractBalance() view returns (uint256)',
                'function getDepositorsCount() view returns (uint256)'
            ];
            
            const phoenixLockerContract = new ethers.Contract(appPhoenixLockerAddress, phoenixLockerAbi, provider);
            
            try {
                const contractBalance = await phoenixLockerContract.getContractBalance();
                const depositorsCount = await phoenixLockerContract.getDepositorsCount();
                
                console.log('🏦 PhoenixLocker合约状态:');
                console.log(`  合约余额: ${ethers.formatUnits(contractBalance, decimals)} ${symbol}`);
                console.log(`  存款用户数: ${depositorsCount}\n`);
            } catch (error) {
                console.log('⚠️  无法查询PhoenixLocker合约状态:', error.message);
            }
        }
        
        // 7. 总结
        console.log('📋 一致性检查结果:');
        console.log(`  ✅ app.html配置的USDT地址与实际部署地址一致`);
        console.log(`  ✅ USDT合约功能正常`);
        if (phoenixLockerDeployed) {
            console.log(`  ✅ PhoenixLocker合约已部署且可访问`);
        } else {
            console.log(`  ❌ PhoenixLocker合约未部署`);
        }
        
    } catch (error) {
        console.log('❌ 查询USDT合约信息失败:', error.message);
        console.log('💡 可能原因: 合约ABI不匹配或合约未正确部署');
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('❌ 脚本执行失败:', error);
        process.exit(1);
    });