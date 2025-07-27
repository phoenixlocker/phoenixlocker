// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PhoenixLocker Protocol
 * @dev Fund locking smart contract based on Bill Gates' "Microsoft is always 18 months away from bankruptcy" philosophy
 * @notice Allows users to deposit USDT and withdraw funds in installments over an 18-month cycle
 */
contract PhoenixLocker is ReentrancyGuard, Ownable {
    IERC20 public immutable usdt;
    
    // Constant definitions
    uint256 public constant LOCK_PERIOD_MONTHS = 18;
    uint256 public constant DAYS_PER_MONTH = 30;
    uint256 public constant DAYS_PER_WEEK = 7;
    uint256 public constant TOTAL_DAYS = LOCK_PERIOD_MONTHS * DAYS_PER_MONTH; // 540 days
    uint256 public constant TOTAL_WEEKS = TOTAL_DAYS / DAYS_PER_WEEK; // approximately 77 weeks
    uint256 public constant SECONDS_PER_DAY = 86400;
    
    // User deposit information struct
    struct UserDeposit {
        uint256 totalAmount;        // Total deposit amount
        uint256 remainingAmount;    // Remaining amount
        uint256 dailyWithdrawable;  // Daily withdrawable amount
        uint256 weeklyWithdrawable; // Weekly withdrawable amount
        uint256 monthlyWithdrawable; // Monthly withdrawable amount
        uint256 depositTime;       // Deposit time
        uint256 lastWithdrawTime;  // Last withdrawal time
        uint256 withdrawnAmount;   // Withdrawn amount
    }
    
    // Transaction record struct
    struct Transaction {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool isDeposit; // true for deposit, false for withdrawal
    }
    
    // State variables
    mapping(address => UserDeposit) public userDeposits;
    mapping(address => Transaction[]) public userTransactions;
    address[] public depositUsers;
    Transaction[] public allTransactions;
    uint256 public totalContractBalance;
    
    // Event definitions
    event Deposit(address indexed user, uint256 amount, uint256 timestamp);
    event Withdraw(address indexed user, uint256 amount, uint256 timestamp, bool isDaily);
    event EmergencyWithdraw(address indexed user, uint256 amount, uint256 timestamp);
    
    constructor(address _usdtAddress) Ownable(msg.sender) {
        usdt = IERC20(_usdtAddress);
    }
    
    /**
     * @dev Deposit function - User transfers USDT to smart contract
     * @param amount Deposit amount
     */
    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
        require(usdt.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        
        // If new user, add to user list
        if (userDeposit.totalAmount == 0) {
            depositUsers.push(msg.sender);
        }
        
        // Update user deposit information
        userDeposit.totalAmount += amount;
        userDeposit.remainingAmount += amount;
        userDeposit.dailyWithdrawable = userDeposit.totalAmount / TOTAL_DAYS;
        userDeposit.weeklyWithdrawable = userDeposit.totalAmount / TOTAL_WEEKS;
        userDeposit.monthlyWithdrawable = userDeposit.totalAmount / LOCK_PERIOD_MONTHS;
        userDeposit.depositTime = block.timestamp;
        // Set lastWithdrawTime to 0 for first deposit, allowing immediate withdrawal
        if (userDeposit.lastWithdrawTime == 0) {
            userDeposit.lastWithdrawTime = 0;
        }
        
        // Update contract total balance
        totalContractBalance += amount;
        
        // Record transaction
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
     * @dev Withdraw funds daily - Can withdraw 1/(18*30) of funds per day
     */
    function withdrawDaily() external nonReentrant {
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        require(userDeposit.totalAmount > 0, "No deposit found");
        require(userDeposit.remainingAmount > 0, "No remaining balance");
        
        // Calculate withdrawable days
        uint256 daysSinceLastWithdraw;
        if (userDeposit.lastWithdrawTime == 0) {
            // First withdrawal, allow immediate withdrawal
            daysSinceLastWithdraw = 1;
        } else {
            daysSinceLastWithdraw = (block.timestamp - userDeposit.lastWithdrawTime) / SECONDS_PER_DAY;
            require(daysSinceLastWithdraw >= 1, "Wait 24 hours");
        }
        
        // Calculate withdrawal amount
        uint256 withdrawAmount = userDeposit.dailyWithdrawable * daysSinceLastWithdraw;
        if (withdrawAmount > userDeposit.remainingAmount) {
            withdrawAmount = userDeposit.remainingAmount;
        }
        
        require(withdrawAmount > 0, "No amount to withdraw");
        
        // Update user information
        userDeposit.remainingAmount -= withdrawAmount;
        userDeposit.withdrawnAmount += withdrawAmount;
        userDeposit.lastWithdrawTime = block.timestamp;
        
        // Update contract total balance
        totalContractBalance -= withdrawAmount;
        
        // Transfer to user
        require(usdt.transfer(msg.sender, withdrawAmount), "Transfer failed");
        
        // Record transaction
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
     * @dev Withdraw funds monthly - Can withdraw 1/18 of funds per month
     */
    function withdrawMonthly() external nonReentrant {
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        require(userDeposit.totalAmount > 0, "No deposit found");
        require(userDeposit.remainingAmount > 0, "No remaining balance");
        
        // Calculate withdrawable months
        uint256 monthsSinceLastWithdraw;
        if (userDeposit.lastWithdrawTime == 0) {
            // First withdrawal, allow immediate withdrawal
            monthsSinceLastWithdraw = 1;
        } else {
            monthsSinceLastWithdraw = (block.timestamp - userDeposit.lastWithdrawTime) / (DAYS_PER_MONTH * SECONDS_PER_DAY);
            require(monthsSinceLastWithdraw >= 1, "Wait 30 days");
        }
        
        // Calculate withdrawal amount
        uint256 withdrawAmount = userDeposit.monthlyWithdrawable * monthsSinceLastWithdraw;
        if (withdrawAmount > userDeposit.remainingAmount) {
            withdrawAmount = userDeposit.remainingAmount;
        }
        
        require(withdrawAmount > 0, "No amount to withdraw");
        
        // Update user information
        userDeposit.remainingAmount -= withdrawAmount;
        userDeposit.withdrawnAmount += withdrawAmount;
        userDeposit.lastWithdrawTime = block.timestamp;
        
        // Update contract total balance
        totalContractBalance -= withdrawAmount;
        
        // Transfer to user
        require(usdt.transfer(msg.sender, withdrawAmount), "Transfer failed");
        
        // Record transaction
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
     * @dev Withdraw funds weekly - Can withdraw 1/77 of funds per week
     */
    function withdrawWeekly() external nonReentrant {
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        require(userDeposit.totalAmount > 0, "No deposit found");
        require(userDeposit.remainingAmount > 0, "No remaining balance");
        
        // Calculate withdrawable weeks
        uint256 weeksSinceLastWithdraw;
        if (userDeposit.lastWithdrawTime == 0) {
            // First withdrawal, allow immediate withdrawal
            weeksSinceLastWithdraw = 1;
        } else {
            weeksSinceLastWithdraw = (block.timestamp - userDeposit.lastWithdrawTime) / (DAYS_PER_WEEK * SECONDS_PER_DAY);
            require(weeksSinceLastWithdraw >= 1, "Wait 7 days");
        }
        
        // Calculate withdrawal amount
        uint256 withdrawAmount = userDeposit.weeklyWithdrawable * weeksSinceLastWithdraw;
        if (withdrawAmount > userDeposit.remainingAmount) {
            withdrawAmount = userDeposit.remainingAmount;
        }
        
        require(withdrawAmount > 0, "No amount to withdraw");
        
        // Update user information
        userDeposit.remainingAmount -= withdrawAmount;
        userDeposit.withdrawnAmount += withdrawAmount;
        userDeposit.lastWithdrawTime = block.timestamp;
        
        // Update contract total balance
        totalContractBalance -= withdrawAmount;
        
        // Transfer to user
        require(usdt.transfer(msg.sender, withdrawAmount), "Transfer failed");
        
        // Record transaction
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
     * @dev Emergency withdrawal of all remaining funds (depositors only)
     */
    function emergencyWithdraw() external nonReentrant {
        UserDeposit storage userDeposit = userDeposits[msg.sender];
        require(userDeposit.totalAmount > 0, "No deposit found");
        require(userDeposit.remainingAmount > 0, "No remaining balance");
        
        uint256 withdrawAmount = userDeposit.remainingAmount;
        
        // Update user information
        userDeposit.remainingAmount = 0;
        userDeposit.withdrawnAmount += withdrawAmount;
        
        // Update contract total balance
        totalContractBalance -= withdrawAmount;
        
        // Transfer to user
        require(usdt.transfer(msg.sender, withdrawAmount), "Transfer failed");
        
        // Record transaction
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
     * @dev Query user's total funds in smart contract
     * @param user User address
     * @return totalAmount Total deposit amount
     * @return remainingAmount Remaining amount
     * @return withdrawnAmount Withdrawn amount
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
     * @dev Query user's daily/weekly/monthly withdrawable amounts
     * @param user User address
     * @return dailyWithdrawable Daily withdrawable amount
     * @return weeklyWithdrawable Weekly withdrawable amount
     * @return monthlyWithdrawable Monthly withdrawable amount
     */
    function getUserWithdrawableAmounts(address user) external view returns (
        uint256 dailyWithdrawable,
        uint256 weeklyWithdrawable,
        uint256 monthlyWithdrawable
    ) {
        UserDeposit memory userDeposit = userDeposits[user];
        
        // If no remaining balance, return 0
        if (userDeposit.remainingAmount == 0) {
            return (0, 0, 0);
        }
        
        return (userDeposit.dailyWithdrawable, userDeposit.weeklyWithdrawable, userDeposit.monthlyWithdrawable);
    }
    
    /**
     * @dev Query total funds of the entire smart contract
     * @return totalBalance Contract total balance
     */
    function getTotalContractBalance() external view returns (uint256 totalBalance) {
        return totalContractBalance;
    }
    
    /**
     * @dev Query all accounts with funds
     * @return users Array of user addresses with funds
     */
    function getAllDepositUsers() external view returns (address[] memory users) {
        uint256 activeUserCount = 0;
        
        // Calculate active user count
        for (uint256 i = 0; i < depositUsers.length; i++) {
            if (userDeposits[depositUsers[i]].remainingAmount > 0) {
                activeUserCount++;
            }
        }
        
        // Create active users array
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
     * @dev Query user's deposit and withdrawal records
     * @param user User address
     * @return transactions User's transaction record array
     */
    function getUserTransactions(address user) external view returns (Transaction[] memory transactions) {
        return userTransactions[user];
    }
    
    /**
     * @dev Query all transaction records
     * @return transactions All transaction record array
     */
    function getAllTransactions() external view returns (Transaction[] memory transactions) {
        return allTransactions;
    }
    
    /**
     * @dev Query user detailed information
     * @param user User address
     * @return userDeposit User deposit detailed information
     */
    function getUserDepositInfo(address user) external view returns (UserDeposit memory userDeposit) {
        return userDeposits[user];
    }
    
    /**
     * @dev Calculate user's current withdrawable amount (daily)
     * @param user User address
     * @return availableAmount Withdrawable amount
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
     * @dev Calculate user's current withdrawable amount (weekly)
     * @param user User address
     * @return availableAmount Withdrawable amount
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
     * @dev Calculate user's current withdrawable amount (monthly)
     * @param user User address
     * @return availableAmount Withdrawable amount
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