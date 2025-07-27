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
    // Get test accounts
    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Deploy mock USDT contract
    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy(INITIAL_SUPPLY);
    await mockUSDT.waitForDeployment();

    // Deploy PhoenixLocker contract
    const PhoenixLocker = await ethers.getContractFactory("PhoenixLocker");
    phoenixLocker = await PhoenixLocker.deploy(await mockUSDT.getAddress());
    await phoenixLocker.waitForDeployment();

    // Allocate USDT to test users
    await mockUSDT.transfer(user1.address, DEPOSIT_AMOUNT * 2n);
    await mockUSDT.transfer(user2.address, DEPOSIT_AMOUNT);
  });

  describe("Deployment", function () {
    it("Should correctly set USDT address", async function () {
      expect(await phoenixLocker.usdt()).to.equal(await mockUSDT.getAddress());
    });

    it("Should correctly set constants", async function () {
      expect(await phoenixLocker.LOCK_PERIOD_MONTHS()).to.equal(18);
      expect(await phoenixLocker.DAYS_PER_MONTH()).to.equal(30);
      expect(await phoenixLocker.TOTAL_DAYS()).to.equal(540);
    });
  });

  describe("Deposit functionality", function () {
    it("Should allow user deposits", async function () {
      // User 1 approves contract to use USDT
      await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      
      // Deposit
      await expect(phoenixLocker.connect(user1).deposit(DEPOSIT_AMOUNT))
        .to.emit(phoenixLocker, "Deposit")
        .withArgs(user1.address, DEPOSIT_AMOUNT, await time.latest());

      // Check user balance
      const [totalAmount, remainingAmount, withdrawnAmount] = await phoenixLocker.getUserBalance(user1.address);
      expect(totalAmount).to.equal(DEPOSIT_AMOUNT);
      expect(remainingAmount).to.equal(DEPOSIT_AMOUNT);
      expect(withdrawnAmount).to.equal(0);

      // Check contract total balance
      expect(await phoenixLocker.getTotalContractBalance()).to.equal(DEPOSIT_AMOUNT);
    });

    it("Should reject zero amount deposits", async function () {
      await expect(phoenixLocker.connect(user1).deposit(0))
        .to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should correctly calculate daily and monthly withdrawable amounts", async function () {
      await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      await phoenixLocker.connect(user1).deposit(DEPOSIT_AMOUNT);

      const [dailyWithdrawable, monthlyWithdrawable] = await phoenixLocker.getUserWithdrawableAmounts(user1.address);
      
      // Daily withdrawable = total amount / 540 days
      const expectedDaily = DEPOSIT_AMOUNT / 540n;
      // Monthly withdrawable = total amount / 18 months
      const expectedMonthly = DEPOSIT_AMOUNT / 18n;
      
      expect(dailyWithdrawable).to.equal(expectedDaily);
      expect(monthlyWithdrawable).to.equal(expectedMonthly);
    });
  });

  describe("Withdrawal functionality", function () {
    beforeEach(async function () {
      // User 1 deposits
      await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      await phoenixLocker.connect(user1).deposit(DEPOSIT_AMOUNT);
    });

    it("Should allow daily withdrawal of funds", async function () {
      // Increase time by 1 day
      await time.increase(86400); // 1 day = 86400 seconds
      
      const dailyAmount = DEPOSIT_AMOUNT / 540n;
      
      await expect(phoenixLocker.connect(user1).withdrawDaily())
        .to.emit(phoenixLocker, "Withdraw")
        .withArgs(user1.address, dailyAmount, await time.latest(), true);

      // Check balance changes
      const [, remainingAmount, withdrawnAmount] = await phoenixLocker.getUserBalance(user1.address);
      expect(remainingAmount).to.equal(DEPOSIT_AMOUNT - dailyAmount);
      expect(withdrawnAmount).to.equal(dailyAmount);
    });

    it("Should allow monthly withdrawal of funds", async function () {
      // Increase time by 1 month
      await time.increase(30 * 86400); // 30 days
      
      const monthlyAmount = DEPOSIT_AMOUNT / 18n;
      
      await expect(phoenixLocker.connect(user1).withdrawMonthly())
        .to.emit(phoenixLocker, "Withdraw")
        .withArgs(user1.address, monthlyAmount, await time.latest(), false);

      // 检查余额变化
      const [, remainingAmount, withdrawnAmount] = await phoenixLocker.getUserBalance(user1.address);
      expect(remainingAmount).to.equal(DEPOSIT_AMOUNT - monthlyAmount);
      expect(withdrawnAmount).to.equal(monthlyAmount);
    });

    it("Should allow emergency withdrawal of all funds", async function () {
      await expect(phoenixLocker.connect(user1).emergencyWithdraw())
        .to.emit(phoenixLocker, "EmergencyWithdraw")
        .withArgs(user1.address, DEPOSIT_AMOUNT, await time.latest());

      // 检查余额变化
      const [, remainingAmount, withdrawnAmount] = await phoenixLocker.getUserBalance(user1.address);
      expect(remainingAmount).to.equal(0);
      expect(withdrawnAmount).to.equal(DEPOSIT_AMOUNT);
    });
  });

  describe("Query functionality", function () {
    beforeEach(async function () {
      // Both users deposit
      await mockUSDT.connect(user1).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      await phoenixLocker.connect(user1).deposit(DEPOSIT_AMOUNT);
      
      await mockUSDT.connect(user2).approve(await phoenixLocker.getAddress(), DEPOSIT_AMOUNT);
      await phoenixLocker.connect(user2).deposit(DEPOSIT_AMOUNT);
    });

    it("Should correctly return all users with funds", async function () {
      const users = await phoenixLocker.getAllDepositUsers();
      expect(users.length).to.equal(2);
      expect(users).to.include(user1.address);
      expect(users).to.include(user2.address);
    });

    it("Should correctly return contract total balance", async function () {
      expect(await phoenixLocker.getTotalContractBalance()).to.equal(DEPOSIT_AMOUNT * 2n);
    });

    it("Should correctly return user transaction records", async function () {
      const transactions = await phoenixLocker.getUserTransactions(user1.address);
      expect(transactions.length).to.equal(1);
      expect(transactions[0].user).to.equal(user1.address);
      expect(transactions[0].amount).to.equal(DEPOSIT_AMOUNT);
      expect(transactions[0].isDeposit).to.equal(true);
    });
  });
});

// Time helper functions
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