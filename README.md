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

### Supported Networks

#### Ethereum Mainnet
- **Chain ID**: 1
- **USDT Address**: `0xdAC17F958D2ee523a2206206994597C13D831ec7`
- **RPC**: Infura/Alchemy
- **Gas Token**: ETH

#### BNB Smart Chain (BSC) ✅ Deployed
- **Chain ID**: 56
- **USDT Address**: `0x55d398326f99059fF775485246999027B3197955`
- **RPC**: https://bsc.publicnode.com
- **Gas Token**: BNB
- **Contract Address**: `0x1399216420db6c02E6Cd9Cf32BD6bbC3F1aF05C0`
- **Contract Explorer**: https://bscscan.com/address/0x1399216420db6c02E6Cd9Cf32BD6bbC3F1aF05C0

#### Sepolia Testnet
- **Chain ID**: 11155111
- **Gas Token**: Sepolia ETH

### Deployment Steps

#### Deploy to Ethereum Mainnet
```bash
# Check balance
npx hardhat run scripts/check-balance.js --network mainnet

# Deploy contract
npx hardhat run scripts/deploy-simple.js --network mainnet
```

#### Deploy to BNB Smart Chain
```bash
# Check BNB balance
npx hardhat run scripts/check-bsc-balance.js --network bsc

# Verify USDT contract
npx hardhat run scripts/verify-bsc-usdt.js --network bsc

# Deploy contract
npx hardhat run scripts/deploy-bsc-simple.js --network bsc

# Verify deployment
npx hardhat run scripts/verify-bsc-deployment.js --network bsc
```

#### Deploy to Testnet
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Prerequisites

1. **Environment Setup**
   - Create `.env` file with `PRIVATE_KEY` and `INFURA_PROJECT_ID`
   - Ensure wallet has sufficient gas tokens

2. **Gas Requirements**
   - **Ethereum**: ~0.0003 ETH for deployment
   - **BSC**: ~0.000005 BNB for deployment

3. **Network Configuration**
   - All networks are pre-configured in `hardhat.config.js`
   - BSC configuration includes optimized gas settings

For detailed BSC deployment instructions, see [BSC_DEPLOYMENT_GUIDE.md](./BSC_DEPLOYMENT_GUIDE.md)

## License

MIT License

## Contributing

Welcome to submit Issues and Pull Requests to improve this project.

## Disclaimer

This smart contract is for learning and research purposes only. Please conduct thorough security audits before using in production environments. The developers are not responsible for any losses incurred from using this contract.