const hre = require("hardhat");

async function main() {
  console.log("开始部署 PhoenixLocker Protocol...");

  // 获取合约工厂
  const PhoenixLocker = await hre.ethers.getContractFactory("PhoenixLocker");
  
  // USDT合约地址 (需要根据实际网络修改)
  // 主网 USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7
  // 测试网可以部署一个模拟的USDT合约
  const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // 主网USDT地址
  
  console.log("使用的USDT合约地址:", USDT_ADDRESS);
  
  // 部署合约
  const phoenixLocker = await PhoenixLocker.deploy(USDT_ADDRESS);
  
  await phoenixLocker.waitForDeployment();
  
  const contractAddress = await phoenixLocker.getAddress();
  
  console.log("PhoenixLocker Protocol 部署成功!");
  console.log("合约地址:", contractAddress);
  console.log("USDT代币地址:", USDT_ADDRESS);
  
  // 验证部署
  console.log("\n验证合约部署...");
  const totalBalance = await phoenixLocker.getTotalContractBalance();
  console.log("合约初始余额:", totalBalance.toString());
  
  console.log("\n部署完成! 可以开始使用 PhoenixLocker Protocol");
  console.log("\n主要功能:");
  console.log("1. deposit(amount) - 存入USDT");
  console.log("2. withdrawDaily() - 按天提取资金");
  console.log("3. withdrawMonthly() - 按月提取资金");
  console.log("4. getUserBalance(address) - 查询用户余额");
  console.log("5. getTotalContractBalance() - 查询合约总余额");
}

// 错误处理
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("部署失败:", error);
    process.exit(1);
  });