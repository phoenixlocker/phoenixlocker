const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PhoenixLocker Protocol", function () {
  let phoenixLocker;
  let mockUSDT;
  let owner;
  let user1;
  let user2;
  let addrs;

  const INITIAL_SUPPLY = ethers.parseUnits("1000000", 6); // 1M USDT (6 decimals)
  const DEPOSIT_AMOUNT = ethers.parseUnits("1000", 6); // 1000 USDT

  beforeEach(async function () {
    // 获取测试账户
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // 部署模拟USDT合约
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy(INITIAL_SUPPLY);
    await mockUSDT.waitForDeployment();

    // 部署PhoenixLocker合约
    const PhoenixLocker = await ethers.getContractFactory("PhoenixLocker");
    phoenixLocker = await PhoenixLocker.deploy(await mockUSDT.getAddress());
    await phoenixLocker.waitForDeployment();

    // 给测试用户分配USDT
    await mockUSDT.transfer(user1.address, DEPOSIT_AMOUNT * 2n);
    await mockUSDT.transfer(user2.address, DEPOSIT_AMOUNT);
  });

  describe("部署", function () {
    it("应该正确设置USDT地址", async function () {
      expect(await phoenixLocker.usdt()).to.equal(await mockUSDT.getAddress());
    });

    it("应该正确设置常量", async function () {
      expect(await phoenixLocker.LOCK_PERIOD_MONTHS()).to.equal(18);
      expect(await phoenixLocker.DAYS_PER_MONTH()).to.equal(30);
      expect(await phoenixLocker.TOTAL_DAYS()).to.equal(540);
    });
  });

  describe("存款功能", function () {
    it("应该允许用户存款", async function () {
      // 用户1授权合约使用USDT
      await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      
      // 存款
      await expect(phoenixLocker.connect(user1).deposit(DEPOSIT_AMOUNT))
        .to.emit(phoenixLocker, "Deposit")
        .withArgs(user1.address, DEPOSIT_AMOUNT, await time.latest());

      // 检查用户余额
      const [totalAmount, remainingAmount, withdrawnAmount] = await phoenixLocker.getUserBalance(user1.address);
      expect(totalAmount).to.equal(DEPOSIT_AMOUNT);
      expect(remainingAmount).to.equal(DEPOSIT_AMOUNT);
      expect(withdrawnAmount).to.equal(0);

      // 检查合约总余额
      expect(await phoenixLocker.getTotalContractBalance()).to.equal(DEPOSIT_AMOUNT);
    });

    it("应该拒绝零金额存款", async function () {
      await expect(phoenixLocker.connect(user1).deposit(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("应该正确计算每日和每月可提取金额", async function () {
      await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      await phoenixLocker.connect(user1).deposit(DEPOSIT_AMOUNT);

      const [dailyWithdrawable, monthlyWithdrawable] = await phoenixLocker.getUserWithdrawableAmounts(user1.address);
      
      // 每日可提取 = 总金额 / 540天
      const expectedDaily = DEPOSIT_AMOUNT / 540n;
      // 每月可提取 = 总金额 / 18个月
      const expectedMonthly = DEPOSIT_AMOUNT / 18n;
      
      expect(dailyWithdrawable).to.equal(expectedDaily);
      expect(monthlyWithdrawable).to.equal(expectedMonthly);
    });
  });

  describe("提取功能", function () {
    beforeEach(async function () {
      // 用户1存款
      await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      await phoenixLocker.connect(user1).deposit(DEPOSIT_AMOUNT);
    });

    it("应该允许按天提取资金", async function () {
      // 增加时间1天
      await time.increase(86400); // 1天 = 86400秒
      
      const dailyAmount = DEPOSIT_AMOUNT / 540n;
      
      await expect(phoenixLocker.connect(user1).withdrawDaily())
        .to.emit(phoenixLocker, "Withdraw")
        .withArgs(user1.address, dailyAmount, await time.latest(), true);

      // 检查余额变化
      const [, remainingAmount, withdrawnAmount] = await phoenixLocker.getUserBalance(user1.address);
      expect(remainingAmount).to.equal(DEPOSIT_AMOUNT - dailyAmount);
      expect(withdrawnAmount).to.equal(dailyAmount);
    });

    it("应该允许按月提取资金", async function () {
      // 增加时间1个月
      await time.increase(30 * 86400); // 30天
      
      const monthlyAmount = DEPOSIT_AMOUNT / 18n;
      
      await expect(phoenixLocker.connect(user1).withdrawMonthly())
        .to.emit(phoenixLocker, "Withdraw")
        .withArgs(user1.address, monthlyAmount, await time.latest(), false);

      // 检查余额变化
      const [, remainingAmount, withdrawnAmount] = await phoenixLocker.getUserBalance(user1.address);
      expect(remainingAmount).to.equal(DEPOSIT_AMOUNT - monthlyAmount);
      expect(withdrawnAmount).to.equal(monthlyAmount);
    });

    it("应该允许紧急提取所有资金", async function () {
      await expect(phoenixLocker.connect(user1).emergencyWithdraw())
        .to.emit(phoenixLocker, "EmergencyWithdraw")
        .withArgs(user1.address, DEPOSIT_AMOUNT, await time.latest());

      // 检查余额变化
      const [, remainingAmount, withdrawnAmount] = await phoenixLocker.getUserBalance(user1.address);
      expect(remainingAmount).to.equal(0);
      expect(withdrawnAmount).to.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("查询功能", function () {
    beforeEach(async function () {
      // 两个用户都存款
      await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      await phoenixLocker.connect(user1).deposit(DEPOSIT_AMOUNT);
      
      await mockUSDT.connect(user2).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      await phoenixLocker.connect(user2).deposit(DEPOSIT_AMOUNT);
    });

    it("应该正确返回所有有资金的用户", async function () {
      const users = await phoenixLocker.getAllDepositUsers();
      expect(users.length).to.equal(2);
      expect(users).to.include(user1.address);
      expect(users).to.include(user2.address);
    });

    it("应该正确返回合约总余额", async function () {
      expect(await phoenixLocker.getTotalContractBalance()).to.equal(DEPOSIT_AMOUNT * 2n);
    });

    it("应该正确返回用户交易记录", async function () {
      const transactions = await phoenixLocker.getUserTransactions(user1.address);
      expect(transactions.length).to.equal(1);
      expect(transactions[0].user).to.equal(user1.address);
      expect(transactions[0].amount).to.equal(DEPOSIT_AMOUNT);
      expect(transactions[0].isDeposit).to.equal(true);
    });
  });
});

// 时间辅助函数
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock('latest');
    return block.timestamp;
  },
  increase: async (seconds) => {
    await ethers.provider.send('evm_increaseTime', [seconds]);
    await ethers.provider.send('evm_mine');
  }
};