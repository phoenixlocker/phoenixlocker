require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hardhat: {
      chainId: 1337
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    // Can add other network configurations
     mainnet: {
       url: "https://eth-mainnet.public.blastapi.io",
       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
       gasPrice: "auto",
       gas: "auto",
       timeout: 120000,
       httpHeaders: {
         "User-Agent": "hardhat"
       }
     },
     sepolia: {
       url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
       timeout: 60000,
       gasPrice: 5000000000
     },
     bsc: {
       url: "https://bsc-dataseed2.defibit.io/",
       chainId: 56,
       accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
       gasPrice: 5000000000, // 5 gwei
       gas: "auto",
       timeout: 120000,
       httpHeaders: {
         "User-Agent": "hardhat"
       }
     }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};