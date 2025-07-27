// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PhoenixLocker Protocol
 * @dev 基于比尔·盖茨"微软离破产永远只有18个月"理念的资金锁定智能合约
 * @notice 允许用户存入USDT并按18个月周期分期提取资金
 */
contract PhoenixLocker is ReentrancyGuard, Ownable {
    IERC20 public immutable usdt;
    
    // 常量定义
    uint256 public constant LOCK_PERIOD_MONTHS = 18;
    uint256 public constant DAYS_PER_MONTH = 30;
    uint256 public constant DAYS_PER_WEEK = 7;
    uint256 public constant TOTAL_DAYS = LOCK_PERIOD_MONTHS * DAYS_PER_MONTH; // 540天
    uint256 public constant TOTAL_WEEKS = TOTAL_DAYS / DAYS_PER_WEEK; // 约77周
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // 用户存款信息结构体
    struct UserDeposit {
        uint256 totalAmount;        // 总存款金额
        uint256 remainingAmount;    // 剩余金额
        uint256 dailyWithdrawable;  // 每日可提取金额
        uint256 weeklyWithdrawable; // 每周可提取金额
        uint256 monthlyWithdrawable; // 每月可提取金额
        uint256 depositTime;       // 存款时间
        uint256 lastWithdrawTime;  // 最后提取时间
        uint256 withdrawnAmount;   // 已提取金额
    }
    
    // 交易记录结构体
    struct Transaction {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool isDeposit; // true为存款，false为提款
    }
    
    // 状态变量
    mapping(address => UserDeposit) public userDeposits;
    mapping(address => Transaction[]) public userTransactions;
    address[] public depositUsers;
    Transaction[] public allTransactions;
    uint256 public totalContractBalance;
    
    // 事件定义
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdraw(address indexed user, uint256 amount, uint256 timestamp, bool isDaily);
    event EmergencyWithdraw(address indexed user, uint256 amount, uint256 timestamp);
    
    constructor(address _usdtAddress) Ownable(msg.sender) {
        usdt = IERC20(_usdtAddress);
    }
    
    /**
     * @dev 存款函数 - 用户转账USDT到智能合约
     * @param amount 存款金额
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(usdt.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        
        // 如果是新用户，添加到用户列表
        if (userDeposit.totalAmount == 0) {
            depositUsers.push(msg.sender);
        }
        
        // 更新用户存款信息
        userDeposit.totalAmount += amount;
        userDeposit.remainingAmount += amount;
        userDeposit.dailyWithdrawable = userDeposit.totalAmount / TOTAL_DAYS;
        userDeposit.weeklyWithdrawable = userDeposit.totalAmount / TOTAL_WEEKS;
        userDeposit.monthlyWithdrawable = userDeposit.totalAmount / LOCK_PERIOD_MONTHS;
        userDeposit.depositTime = block.timestamp;
        // 首次存款时设置lastWithdrawTime为0，允许立即提取
        if (userDeposit.lastWithdrawTime == 0) {
            userDeposit.lastWithdrawTime = 0;
        }
        
        // 更新合约总余额
        totalContractBalance += amount;
        
        // 记录交易
        Transaction memory newTransaction = Transaction({
            user: msg.sender,
            amount: amount,
            timestamp: block.timestamp,
            isDeposit: true
        });
        
        userTransactions[msg.sender].push(newTransaction);
        allTransactions.push(newTransaction);
        
        emit Deposit(msg.sender, amount, block.timestamp);
    }
    
    /**
     * @dev 按天提取资金 - 每天可提取 1/(18*30) 的资金
     */
    function withdrawDaily() external nonReentrant {
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        require(userDeposit.totalAmount > 0, "No deposit found");
        require(userDeposit.remainingAmount > 0, "No remaining balance");
        
        // 计算可提取的天数
        uint256 daysSinceLastWithdraw;
        if (userDeposit.lastWithdrawTime == 0) {
            // 首次提取，允许立即提取
            daysSinceLastWithdraw = 1;
        } else {
            daysSinceLastWithdraw = (block.timestamp - userDeposit.lastWithdrawTime) / SECONDS_PER_DAY;
            require(daysSinceLastWithdraw >= 1, "Wait 24 hours");
        }
        
        // 计算提取金额
        uint256 withdrawAmount = userDeposit.dailyWithdrawable * daysSinceLastWithdraw;
        if (withdrawAmount > userDeposit.remainingAmount) {
            withdrawAmount = userDeposit.remainingAmount;
        }
        
        require(withdrawAmount > 0, "No amount to withdraw");
        
        // 更新用户信息
        userDeposit.remainingAmount -= withdrawAmount;
        userDeposit.withdrawnAmount += withdrawAmount;
        userDeposit.lastWithdrawTime = block.timestamp;
        
        // 更新合约总余额
        totalContractBalance -= withdrawAmount;
        
        // 转账给用户
        require(usdt.transfer(msg.sender, withdrawAmount), "Transfer failed");
        
        // 记录交易
        Transaction memory newTransaction = Transaction({
            user: msg.sender,
            amount: withdrawAmount,
            timestamp: block.timestamp,
            isDeposit: false
        });
        
        userTransactions[msg.sender].push(newTransaction);
        allTransactions.push(newTransaction);
        
        emit Withdraw(msg.sender, withdrawAmount, block.timestamp, true);
    }
    
    /**
     * @dev 按月提取资金 - 每月可提取 1/18 的资金
     */
    function withdrawMonthly() external nonReentrant {
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        require(userDeposit.totalAmount > 0, "No deposit found");
        require(userDeposit.remainingAmount > 0, "No remaining balance");
        
        // 计算可提取的月数
        uint256 monthsSinceLastWithdraw;
        if (userDeposit.lastWithdrawTime == 0) {
            // 首次提取，允许立即提取
            monthsSinceLastWithdraw = 1;
        } else {
            monthsSinceLastWithdraw = (block.timestamp - userDeposit.lastWithdrawTime) / (DAYS_PER_MONTH * SECONDS_PER_DAY);
            require(monthsSinceLastWithdraw >= 1, "Wait 30 days");
        }
        
        // 计算提取金额
        uint256 withdrawAmount = userDeposit.monthlyWithdrawable * monthsSinceLastWithdraw;
        if (withdrawAmount > userDeposit.remainingAmount) {
            withdrawAmount = userDeposit.remainingAmount;
        }
        
        require(withdrawAmount > 0, "No amount to withdraw");
        
        // 更新用户信息
        userDeposit.remainingAmount -= withdrawAmount;
        userDeposit.withdrawnAmount += withdrawAmount;
        userDeposit.lastWithdrawTime = block.timestamp;
        
        // 更新合约总余额
        totalContractBalance -= withdrawAmount;
        
        // 转账给用户
        require(usdt.transfer(msg.sender, withdrawAmount), "Transfer failed");
        
        // 记录交易
        Transaction memory newTransaction = Transaction({
            user: msg.sender,
            amount: withdrawAmount,
            timestamp: block.timestamp,
            isDeposit: false
        });
        
        userTransactions[msg.sender].push(newTransaction);
        allTransactions.push(newTransaction);
        
        emit Withdraw(msg.sender, withdrawAmount, block.timestamp, false);
    }
    
    /**
     * @dev 按周提取资金 - 每周可提取 1/77 的资金
     */
    function withdrawWeekly() external nonReentrant {
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        require(userDeposit.totalAmount > 0, "No deposit found");
        require(userDeposit.remainingAmount > 0, "No remaining balance");
        
        // 计算可提取的周数
        uint256 weeksSinceLastWithdraw;
        if (userDeposit.lastWithdrawTime == 0) {
            // 首次提取，允许立即提取
            weeksSinceLastWithdraw = 1;
        } else {
            weeksSinceLastWithdraw = (block.timestamp - userDeposit.lastWithdrawTime) / (DAYS_PER_WEEK * SECONDS_PER_DAY);
            require(weeksSinceLastWithdraw >= 1, "Wait 7 days");
        }
        
        // 计算提取金额
        uint256 withdrawAmount = userDeposit.weeklyWithdrawable * weeksSinceLastWithdraw;
        if (withdrawAmount > userDeposit.remainingAmount) {
            withdrawAmount = userDeposit.remainingAmount;
        }
        
        require(withdrawAmount > 0, "No amount to withdraw");
        
        // 更新用户信息
        userDeposit.remainingAmount -= withdrawAmount;
        userDeposit.withdrawnAmount += withdrawAmount;
        userDeposit.lastWithdrawTime = block.timestamp;
        
        // 更新合约总余额
        totalContractBalance -= withdrawAmount;
        
        // 转账给用户
        require(usdt.transfer(msg.sender, withdrawAmount), "Transfer failed");
        
        // 记录交易
        Transaction memory newTransaction = Transaction({
            user: msg.sender,
            amount: withdrawAmount,
            timestamp: block.timestamp,
            isDeposit: false
        });
        
        userTransactions[msg.sender].push(newTransaction);
        allTransactions.push(newTransaction);
        
        emit Withdraw(msg.sender, withdrawAmount, block.timestamp, false);
    }
    
    /**
     * @dev 紧急提取所有剩余资金（仅限存款人）
     */
    function emergencyWithdraw() external nonReentrant {
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        require(userDeposit.totalAmount > 0, "No deposit found");
        require(userDeposit.remainingAmount > 0, "No remaining balance");
        
        uint256 withdrawAmount = userDeposit.remainingAmount;
        
        // 更新用户信息
        userDeposit.remainingAmount = 0;
        userDeposit.withdrawnAmount += withdrawAmount;
        
        // 更新合约总余额
        totalContractBalance -= withdrawAmount;
        
        // 转账给用户
        require(usdt.transfer(msg.sender, withdrawAmount), "Transfer failed");
        
        // 记录交易
        Transaction memory newTransaction = Transaction({
            user: msg.sender,
            amount: withdrawAmount,
            timestamp: block.timestamp,
            isDeposit: false
        });
        
        userTransactions[msg.sender].push(newTransaction);
        allTransactions.push(newTransaction);
        
        emit EmergencyWithdraw(msg.sender, withdrawAmount, block.timestamp);
    }
    
    /**
     * @dev 查询用户在智能合约中的总资金
     * @param user 用户地址
     * @return totalAmount 总存款金额
     * @return remainingAmount 剩余金额
     * @return withdrawnAmount 已提取金额
     */
    function getUserBalance(address user) external view returns (
        uint256 totalAmount,
        uint256 remainingAmount,
        uint256 withdrawnAmount
    ) {
        UserDeposit memory userDeposit = userDeposits[user];
        return (userDeposit.totalAmount, userDeposit.remainingAmount, userDeposit.withdrawnAmount);
    }
    
    /**
     * @dev 查询用户每日/每周/每月可提取金额
     * @param user 用户地址
     * @return dailyWithdrawable 每日可提取金额
     * @return weeklyWithdrawable 每周可提取金额
     * @return monthlyWithdrawable 每月可提取金额
     */
    function getUserWithdrawableAmounts(address user) external view returns (
        uint256 dailyWithdrawable,
        uint256 weeklyWithdrawable,
        uint256 monthlyWithdrawable
    ) {
        UserDeposit memory userDeposit = userDeposits[user];
        
        // 如果没有剩余余额，返回0
        if (userDeposit.remainingAmount == 0) {
            return (0, 0, 0);
        }
        
        return (userDeposit.dailyWithdrawable, userDeposit.weeklyWithdrawable, userDeposit.monthlyWithdrawable);
    }
    
    /**
     * @dev 查询整个智能合约的总资金
     * @return totalBalance 合约总余额
     */
    function getTotalContractBalance() external view returns (uint256 totalBalance) {
        return totalContractBalance;
    }
    
    /**
     * @dev 查询所有有资金的账号
     * @return users 有资金的用户地址数组
     */
    function getAllDepositUsers() external view returns (address[] memory users) {
        uint256 activeUserCount = 0;
        
        // 计算活跃用户数量
        for (uint256 i = 0; i < depositUsers.length; i++) {
            if (userDeposits[depositUsers[i]].remainingAmount > 0) {
                activeUserCount++;
            }
        }
        
        // 创建活跃用户数组
        address[] memory activeUsers = new address[](activeUserCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < depositUsers.length; i++) {
            if (userDeposits[depositUsers[i]].remainingAmount > 0) {
                activeUsers[index] = depositUsers[i];
                index++;
            }
        }
        
        return activeUsers;
    }
    
    /**
     * @dev 查询用户的存款和取款记录
     * @param user 用户地址
     * @return transactions 用户的交易记录数组
     */
    function getUserTransactions(address user) external view returns (Transaction[] memory transactions) {
        return userTransactions[user];
    }
    
    /**
     * @dev 查询所有交易记录
     * @return transactions 所有交易记录数组
     */
    function getAllTransactions() external view returns (Transaction[] memory transactions) {
        return allTransactions;
    }
    
    /**
     * @dev 查询用户详细信息
     * @param user 用户地址
     * @return userDeposit 用户存款详细信息
     */
    function getUserDepositInfo(address user) external view returns (UserDeposit memory userDeposit) {
        return userDeposits[user];
    }
    
    /**
     * @dev 计算用户当前可提取的金额（按天）
     * @param user 用户地址
     * @return availableAmount 可提取金额
     */
    function getAvailableDailyWithdraw(address user) external view returns (uint256 availableAmount) {
        UserDeposit memory userDeposit = userDeposits[user];
        if (userDeposit.totalAmount == 0 || userDeposit.remainingAmount == 0) {
            return 0;
        }
        
        uint256 daysSinceLastWithdraw = (block.timestamp - userDeposit.lastWithdrawTime) / SECONDS_PER_DAY;
        uint256 withdrawAmount = userDeposit.dailyWithdrawable * daysSinceLastWithdraw;
        
        if (withdrawAmount > userDeposit.remainingAmount) {
            withdrawAmount = userDeposit.remainingAmount;
        }
        
        return withdrawAmount;
    }
    
    /**
     * @dev 计算用户当前可提取的金额（按周）
     * @param user 用户地址
     * @return availableAmount 可提取金额
     */
    function getAvailableWeeklyWithdraw(address user) external view returns (uint256 availableAmount) {
        UserDeposit memory userDeposit = userDeposits[user];
        if (userDeposit.totalAmount == 0 || userDeposit.remainingAmount == 0) {
            return 0;
        }
        
        uint256 weeksSinceLastWithdraw = (block.timestamp - userDeposit.lastWithdrawTime) / (DAYS_PER_WEEK * SECONDS_PER_DAY);
        uint256 withdrawAmount = userDeposit.weeklyWithdrawable * weeksSinceLastWithdraw;
        
        if (withdrawAmount > userDeposit.remainingAmount) {
            withdrawAmount = userDeposit.remainingAmount;
        }
        
        return withdrawAmount;
    }
    
    /**
     * @dev 计算用户当前可提取的金额（按月）
     * @param user 用户地址
     * @return availableAmount 可提取金额
     */
    function getAvailableMonthlyWithdraw(address user) external view returns (uint256 availableAmount) {
        UserDeposit memory userDeposit = userDeposits[user];
        if (userDeposit.totalAmount == 0 || userDeposit.remainingAmount == 0) {
            return 0;
        }
        
        uint256 monthsSinceLastWithdraw = (block.timestamp - userDeposit.lastWithdrawTime) / (DAYS_PER_MONTH * SECONDS_PER_DAY);
        uint256 withdrawAmount = userDeposit.monthlyWithdrawable * monthsSinceLastWithdraw;
        
        if (withdrawAmount > userDeposit.remainingAmount) {
            withdrawAmount = userDeposit.remainingAmount;
        }
        
        return withdrawAmount;
    }
}