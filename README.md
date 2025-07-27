# PhoenixLocker Protocol

An Ethereum smart contract fund management protocol based on Bill Gates' principle that "Microsoft is always 18 months away from bankruptcy".

## Project Overview

PhoenixLocker Protocol is a smart contract system that allows users to deposit USDT and withdraw funds in installments over an 18-month cycle. This design philosophy is inspired by Microsoft founder Bill Gates' famous statement, emphasizing the need for enterprises to maintain 18 months of stable cash flow.

## Core Features

### 1. Deposit Function
- Users can transfer USDT to the smart contract
- Automatically calculates daily and monthly withdrawable amounts
- Records deposit time and transaction history

### 2. Installment Withdrawal
- **Daily Withdrawal**: Can withdraw 1/(18×30) = 1/540 of total amount daily
- **Monthly Withdrawal**: Can withdraw 1/18 of total amount monthly
- Only depositors can withdraw their own funds

### 3. Query Functions
- Query user's total funds in the contract
- Query daily/monthly withdrawable amounts
- Query total funds in the entire contract
- Query all accounts with funds
- Query user's deposit and withdrawal records

### 4. Security Features
- Reentrancy attack protection
- Only depositors can withdraw their own funds
- Emergency withdrawal function (withdraw all remaining funds)

## Technical Architecture

- **Solidity Version**: ^0.8.0
- **Dependencies**: OpenZeppelin Contracts
- **Development Framework**: Hardhat
- **Testing Framework**: Mocha + Chai

## Installation and Usage

### 1. Install Dependencies
```bash
npm install
```

### 2. Compile Contracts
```bash
npm run compile
```

### 3. Run Tests
```bash
npm run test
```

### 4. Start Local Network
```bash
npm run node
```

### 5. Deploy Contracts
```bash
npm run deploy
```

### 6. Start Web Interface
```bash
cd frontend && python3 -m http.server 8001
```

## Contract Interface

### Main Functions

#### Deposit
```solidity
function deposit(uint256 amount) external
```

#### Daily Withdrawal
```solidity
function withdrawDaily() external
```

#### Monthly Withdrawal
```solidity
function withdrawMonthly() external
```

#### Emergency Withdrawal
```solidity
function emergencyWithdraw() external
```

### Query Functions

#### Query User Balance
```solidity
function getUserBalance(address user) external view returns (
    uint256 totalAmount,
    uint256 remainingAmount,
    uint256 withdrawnAmount
)
```

#### Query Withdrawable Amounts
```solidity
function getUserWithdrawableAmounts(address user) external view returns (
    uint256 dailyWithdrawable,
    uint256 monthlyWithdrawable
)
```

#### Query Contract Total Balance
```solidity
function getTotalContractBalance() external view returns (uint256)
```

#### Query All Users
```solidity
function getAllDepositUsers() external view returns (address[] memory)
```

#### Query Transaction Records
```solidity
function getUserTransactions(address user) external view returns (Transaction[] memory)
```

## Usage Examples

### 1. Deposit
```javascript
// First approve the contract to use USDT
await usdtContract.approve(phoenixLockerAddress, amount);

// Deposit
await phoenixLocker.deposit(amount);
```

### 2. Query Balance
```javascript
const [totalAmount, remainingAmount, withdrawnAmount] = 
    await phoenixLocker.getUserBalance(userAddress);
```

### 3. Withdraw Funds
```javascript
// Daily withdrawal
await phoenixLocker.withdrawDaily();

// Monthly withdrawal
await phoenixLocker.withdrawMonthly();
```

## Security Considerations

1. **Reentrancy Attack Protection**: Uses OpenZeppelin's ReentrancyGuard
2. **Access Control**: Only depositors can withdraw their own funds
3. **Overflow Protection**: Uses Solidity 0.8+ built-in overflow checks
4. **Time Lock**: Limits withdrawal frequency according to set time intervals

## Deployment Instructions

### Mainnet Deployment
1. Modify the USDT address in `scripts/deploy.js` to the mainnet address
2. Configure network settings in `hardhat.config.js`
3. Set private key and RPC node
4. Run deployment script

### Testnet Deployment
1. Use testnet USDT address or deploy MockUSDT
2. Obtain testnet ETH for gas fees
3. Run deployment script

## License

MIT License

## Contributing

Welcome to submit Issues and Pull Requests to improve this project.

## Disclaimer

This smart contract is for learning and research purposes only. Please conduct thorough security audits before using in production environments. The developers are not responsible for any losses incurred from using this contract.