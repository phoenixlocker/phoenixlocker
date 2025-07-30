# Scripts Reference Guide

This document lists all available scripts in the PhoenixLocker project and their purposes.

## Deployment Scripts

### Ethereum Mainnet Deployment

#### `scripts/deploy.js`
- **Purpose**: Original Ethereum mainnet deployment script
- **Features**: Contains detailed gas settings and error handling
- **Usage**: `npx hardhat run scripts/deploy.js --network mainnet`

#### `scripts/deploy-simple.js`
- **Purpose**: Simplified Ethereum mainnet deployment script
- **Features**: Relies on Hardhat automatic gas estimation, cleaner code
- **Usage**: `npx hardhat run scripts/deploy-simple.js --network mainnet`
- **Recommended**: ✅ Recommended for Ethereum mainnet deployment

### BNB Smart Chain Deployment

#### `scripts/deploy-bsc-simple.js`
- **Purpose**: BNB Smart Chain mainnet deployment script
- **Features**: Uses BSC USDT address, optimized gas settings
- **Usage**: `npx hardhat run scripts/deploy-bsc-simple.js --network bsc`
- **Recommended**: ✅ Recommended for BSC deployment

## Balance Check Scripts

### `scripts/check-balance.js`
- **Purpose**: Check Ethereum mainnet account balance and deployment cost estimation
- **Functions**:
  - Display account ETH balance
  - Estimate contract deployment cost
  - Check if balance is sufficient
  - Display network information
- **Usage**: `npx hardhat run scripts/check-balance.js --network mainnet`

### `scripts/check-bsc-balance.js`
- **Purpose**: Check BSC account balance and deployment cost estimation
- **Functions**:
  - Display account BNB balance
  - Estimate contract deployment cost
  - Check if balance is sufficient
  - Display BSC network information
- **Usage**: `npx hardhat run scripts/check-bsc-balance.js --network bsc`

## Contract Verification Scripts

### `scripts/verify-usdt.js`
- **Purpose**: Verify USDT contract on Ethereum mainnet
- **Functions**:
  - Check if USDT contract exists
  - Get token basic information (name, symbol, decimals)
  - Display contract details
- **Usage**: `npx hardhat run scripts/verify-usdt.js --network mainnet`

### `scripts/verify-bsc-usdt.js`
- **Purpose**: Verify USDT contract on BSC
- **Functions**:
  - Check if BSC USDT contract exists
  - Get token basic information
  - Display BSC network and contract information
- **Usage**: `npx hardhat run scripts/verify-bsc-usdt.js --network bsc`

### `scripts/verify-bsc-deployment.js`
- **Purpose**: Verify deployed PhoenixLocker contract on BSC
- **Functions**:
  - Check contract deployment status
  - Verify contract configuration
  - Display contract information and BSCScan links
- **Usage**: `npx hardhat run scripts/verify-bsc-deployment.js --network bsc`

## Script Usage Workflows

### Ethereum Mainnet Deployment Workflow

1. **Check Balance**
   ```bash
   npx hardhat run scripts/check-balance.js --network mainnet
   ```

2. **Verify USDT Contract** (Optional)
   ```bash
   npx hardhat run scripts/verify-usdt.js --network mainnet
   ```

3. **Deploy Contract**
   ```bash
   npx hardhat run scripts/deploy-simple.js --network mainnet
   ```

### BSC Deployment Workflow

1. **Check BNB Balance**
   ```bash
   npx hardhat run scripts/check-bsc-balance.js --network bsc
   ```

2. **Verify USDT Contract**
   ```bash
   npx hardhat run scripts/verify-bsc-usdt.js --network bsc
   ```

3. **Deploy Contract**
   ```bash
   npx hardhat run scripts/deploy-bsc-simple.js --network bsc
   ```

4. **Verify Deployment**
   ```bash
   npx hardhat run scripts/verify-bsc-deployment.js --network bsc
   ```

## Script Configuration

### Environment Variables

All scripts require the following environment variables (configured in `.env` file):

```env
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_project_id
```

### Network Configuration

Scripts use network configurations defined in `hardhat.config.js`:

- **mainnet**: Ethereum mainnet
- **sepolia**: Ethereum testnet
- **bsc**: BNB Smart Chain mainnet

### Gas Settings

#### Ethereum Mainnet
- Automatically fetch current gas price
- Configurable gas limit
- Support for EIP-1559 fee structure

#### BSC
- Default Gas Price: 5 gwei
- Default Gas Limit: 2,000,000
- Optimized fee settings

## Troubleshooting

### Common Errors

1. **Insufficient Balance**
   - Run balance check scripts to confirm
   - Ensure wallet has enough ETH/BNB

2. **Network Connection Issues**
   - Check RPC node status
   - Verify network configuration

3. **High Gas Fees**
   - Wait for network congestion to ease
   - Adjust gas settings

4. **Contract Verification Failed**
   - Check network connectivity
   - Verify contract address

### Debugging Tips

1. **Detailed Logging**: Scripts include detailed console output
2. **Error Handling**: All scripts have comprehensive error handling
3. **Network Information**: Display current network status and configuration
4. **Cost Estimation**: Show estimated fees before deployment

## Script Maintenance

### Updating USDT Address

If you need to update USDT contract addresses:

1. **Ethereum**: Modify `USDT_ADDRESS` in `deploy.js` and `deploy-simple.js`
2. **BSC**: Modify `USDT_ADDRESS` in `deploy-bsc-simple.js`

### Adding New Networks

1. Add network configuration in `hardhat.config.js`
2. Create corresponding deployment scripts
3. Add balance check and contract verification scripts

## Available Scripts Summary

### Deployment Scripts
- `deploy.js` - Ethereum mainnet (detailed)
- `deploy-simple.js` - Ethereum mainnet (simplified) ✅
- `deploy-bsc-simple.js` - BSC mainnet ✅

### Balance Check Scripts
- `check-balance.js` - Ethereum balance check
- `check-bsc-balance.js` - BSC balance check

### Verification Scripts
- `verify-usdt.js` - Ethereum USDT verification
- `verify-bsc-usdt.js` - BSC USDT verification
- `verify-bsc-deployment.js` - BSC deployment verification

---

**Tip**: It is recommended to verify all script functionality on test networks before production deployment.