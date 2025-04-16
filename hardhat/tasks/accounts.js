const { task } = require("hardhat/config");

task("accounts", "打印所有可用账户及其余额")
  .setAction(async (taskArgs, hre) => {
    const accounts = await hre.ethers.getSigners();
    
    console.log("网络:", hre.network.name);
    console.log("ChainID:", hre.network.config.chainId);
    console.log("\n可用账户:");
    
    for (const account of accounts) {
      const balance = await hre.ethers.provider.getBalance(account.address);
      console.log(
        `${account.address} -> ${hre.ethers.formatEther(balance)} ETH`
      );
    }
  });

module.exports = {}; 