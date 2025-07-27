require("@nomicfoundation/hardhat-toolbox");

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
    // mainnet: {
    //   url: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    //   accounts: ["YOUR_PRIVATE_KEY"]
    // },
    // sepolia: {
    //   url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    //   accounts: ["YOUR_PRIVATE_KEY"]
    // }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};