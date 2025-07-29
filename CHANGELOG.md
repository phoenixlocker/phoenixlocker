# Changelog

All notable changes to the PhoenixLocker Protocol will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.1] - 2024-12-24

### Fixed
- **USDT Balance Display**: Fixed USDT balance formatting issue in frontend DApp
  - Resolved incorrect balance display showing 25,131,051.36 USDT instead of 25.13 USDT
  - Implemented dynamic decimal detection using `usdtContract.decimals()` function
  - Replaced hardcoded 6-decimal formatting with actual contract decimal precision
  - Added debugging logs for balance formatting troubleshooting
  - Maintained thousand separator formatting and USDT symbol display
- **Balance Calculation**: Improved accuracy of USDT balance calculations
  - Enhanced `updateWalletUSDTBalance()` function with proper decimal handling
  - Added real-time decimal precision detection for better compatibility
  - Ensured consistent formatting across different USDT contract implementations

### Technical Details
- **Issue**: Hardcoded 6-decimal formatting caused incorrect balance display
- **Solution**: Dynamic decimal detection using contract's `decimals()` method
- **Impact**: Accurate USDT balance display for all users
- **Compatibility**: Works with any ERC-20 token with standard decimals() function

## [1.1.0] - 2024-12-19

### Added
- **BNB Smart Chain (BSC) Support**: Full deployment support for BSC mainnet
- **BSC Deployment Scripts**: 
  - `deploy-bsc-simple.js` - Optimized BSC deployment script
  - `verify-bsc-deployment.js` - Contract verification script
  - `check-bsc-balance.js` - BSC account balance checker
- **BSC Network Configuration**: Added BSC mainnet configuration to Hardhat
- **Multi-Network Documentation**: 
  - `BSC_DEPLOYMENT_GUIDE.md` - Comprehensive BSC deployment guide
  - `SCRIPTS_REFERENCE.md` - Complete scripts reference documentation
- **Contract Deployment**: Successfully deployed to BSC mainnet at `0x1399216420db6c02E6Cd9Cf32BD6bbC3F1aF05C0`

### Changed
- **README.md**: Updated with BSC deployment information and multi-network support
- **Network Configuration**: Optimized RPC endpoints for better connectivity
- **Gas Configuration**: Improved gas settings for BSC deployment
- **Frontend DApp**: Migrated `app.html` from Ethereum to BNB Smart Chain
  - Updated contract addresses to BSC mainnet deployment
  - Changed USDT contract to BSC USDT (`0x55d398326f99059fF775485246999027B3197955`)
  - Modified UI text from "ETH" to "BNB" for gas fee display
  - Updated balance checking functions for BNB instead of ETH
  - Renamed `MOCK_USDT_ADDRESS` to `USDT_ADDRESS` for better naming convention
- **Documentation**: Translated documentation to English
  - Converted `BSC_DEPLOYMENT_GUIDE.md` from Chinese to English
  - Converted `SCRIPTS_REFERENCE.md` from Chinese to English
  - Updated deployment script references to use `deploy-bsc-simple.js`
  - Added verification command documentation

### Fixed
- **BSC RPC Connectivity**: Resolved connection timeout issues with multiple RPC fallbacks
- **Gas Estimation**: Fixed gas limit issues for successful contract deployment
- **USDT Address Validation**: Ensured correct BSC USDT contract address usage
- **Frontend Network Compatibility**: Aligned frontend with BSC mainnet deployment

### Technical Details
- **BSC Contract Address**: `0x1399216420db6c02E6Cd9Cf32BD6bbC3F1aF05C0`
- **BSC USDT Address**: `0x55d398326f99059fF775485246999027B3197955`
- **Chain ID**: 56 (BSC Mainnet)
- **Gas Used**: ~800,000 gas units
- **Deployment Cost**: ~0.0024 BNB

### Verification
- ✅ Contract successfully deployed and verified on BSC
- ✅ All contract functions working as expected
- ✅ USDT integration confirmed
- ✅ 18-month lock period configuration verified
- ✅ Owner permissions properly set

## [1.0.1] - 2024-12-20

### Fixed
- **Frontend Network Compatibility**: Resolved network compatibility issues for BSC integration
- **Network Auto-Switch**: Added automatic BSC network detection and switching
  - Implemented `ensureBSCNetwork()` function for automatic network switching
  - Added BSC network configuration with proper RPC endpoints
  - Added network change listener to handle user network switches
  - Enhanced error handling for network-related issues

## [1.0.0] - 2024-12-18

### Added
- **Initial Release**: PhoenixLocker Protocol smart contract
- **Core Features**:
  - 18-month fund locking mechanism
  - Daily withdrawal option (1/540 of total per day)
  - Monthly withdrawal option (1/18 of total per month)
  - USDT integration for deposits and withdrawals
- **Ethereum Support**: Full deployment support for Ethereum mainnet
- **Sepolia Testnet**: Testing environment with mock USDT
- **Security Features**:
  - ReentrancyGuard protection
  - Ownable access control
  - Comprehensive event logging
- **Frontend Interface**: Web-based user interface for contract interaction
- **Testing Suite**: Comprehensive test coverage with Hardhat

### Technical Specifications
- **Solidity Version**: ^0.8.0
- **OpenZeppelin Contracts**: Latest stable version
- **Lock Period**: 18 months (540 days)
- **Withdrawal Frequency**: Daily or Monthly options
- **Supported Networks**: Ethereum Mainnet, Sepolia Testnet

---

## Network Deployments

### BSC Mainnet ✅
- **Contract**: `0x1399216420db6c02E6Cd9Cf32BD6bbC3F1aF05C0`
- **Explorer**: https://bscscan.com/address/0x1399216420db6c02E6Cd9Cf32BD6bbC3F1aF05C0
- **Status**: Active

### Ethereum Mainnet
- **Status**: Ready for deployment
- **USDT**: `0xdAC17F958D2ee523a2206206994597C13D831ec7`

### Sepolia Testnet
- **Status**: Available for testing
- **Mock USDT**: Deployed for testing purposes

---

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.