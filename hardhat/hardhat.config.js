require("@nomicfoundation/hardhat-toolbox");
require("./tasks/accounts");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  networks: {
    hardhat: {
      chainId: 31337,
      port: 8546,
    },
    geth: {
      url: "http://127.0.0.1:8888",
      chainId: 1337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk", // 请替换为您的助记词
        path: "m/44'/60'/0'/0",
        initialIndex: 0,
        count: 10
      },
      gas: 2100000,
      gasPrice: 8000000000
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 11155111
    }
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
}; 