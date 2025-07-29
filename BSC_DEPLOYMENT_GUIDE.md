# BNB Smart Chain Deployment Guide

## Overview

This guide will help you deploy the PhoenixLocker smart contract to BNB Smart Chain (BSC) mainnet.

## Prerequisites

### 1. Acquire BNB Tokens

You need to have BNB tokens on BSC mainnet to pay for gas fees. Based on current estimates, deploying the contract requires approximately **0.000005 BNB** (about $0.001).

**Ways to acquire BNB:**
- Purchase from centralized exchanges (like Binance, OKX, etc.) and withdraw to your wallet
- Use cross-chain bridges to transfer assets from other chains
- Exchange other tokens for BNB through DEX

### 2. Configure Wallet

Ensure that the wallet address corresponding to `PRIVATE_KEY` in your `.env` file has sufficient BNB balance.

Currently configured wallet address: `0xd177ec921859f3568ecc849b7204CbC8Af8E0F89`

## Deployment Steps

### 1. Check Balance

Before deployment, check your BNB balance:

```bash
npx hardhat run scripts/check-bsc-balance.js --network bsc
```

### 2. Verify USDT Contract

Verify that the USDT contract on BSC is accessible:

```bash
npx hardhat run scripts/verify-bsc-usdt.js --network bsc
```

### 3. Deploy Contract

Once you have sufficient BNB balance, run the deployment script:

```bash
npx hardhat run scripts/deploy-bsc-simple.js --network bsc
```

## Network Configuration

### BSC Mainnet Information

- **Network Name**: BNB Smart Chain
- **RPC URL**: https://bsc.publicnode.com
- **Chain ID**: 56
- **Block Explorer**: https://bscscan.com/
- **Native Token**: BNB

### USDT Contract Address

- **BSC USDT**: `0x55d398326f99059fF775485246999027B3197955`
- **Decimals**: 18
- **Contract Verification**: ✅ Verified and available

## Gas Fee Configuration

Current gas settings:
- **Gas Price**: 5 gwei (automatically adjustable based on network conditions)
- **Gas Limit**: 2,000,000
- **Estimated Cost**: ~0.000005 BNB

## Troubleshooting

### Common Issues

1. **Insufficient Balance**
   - Ensure wallet has enough BNB
   - Verify wallet address is correct

2. **Network Connection Issues**
   - Check network connectivity
   - Try using different RPC nodes

3. **High Gas Fees**
   - Wait for network congestion to ease
   - Adjust Gas Price settings

### Getting Help

If you encounter issues, you can:
- Check BSC block explorer: https://bscscan.com/
- Monitor network status: https://bscscan.com/gastracker
- Review transaction details to understand failure reasons

## Deployment Results

✅ **Contract successfully deployed to BSC mainnet!**

**Contract Information:**
- Contract Address: `0x1399216420db6c02E6Cd9Cf32BD6bbC3F1aF05C0`
- Network: BSC Mainnet (Chain ID: 56)
- Block Explorer: https://bscscan.com/address/0x1399216420db6c02E6Cd9Cf32BD6bbC3F1aF05C0
- USDT Token: https://bscscan.com/token/0x55d398326f99059fF775485246999027B3197955
- Contract Owner: `0xd177ec921859f3568ecc849b7204CbC8Af8E0F89`

**Verification Information:**
- Lock Period: 18 months
- Total Days: 540 days
- Total Weeks: 77 weeks
- Current Balance: 0 USDT

## Post-Deployment Verification

After successful deployment, you can:
1. View the contract on BSCScan
2. Verify contract source code
3. Test contract functionality

### Verification Command

```bash
npx hardhat run scripts/verify-bsc-deployment.js --network bsc
```

---

**Note**: Please ensure thorough testing of contract functionality before mainnet deployment, as mainnet deployment is irreversible.