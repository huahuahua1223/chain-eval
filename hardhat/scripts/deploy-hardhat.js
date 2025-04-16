const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // 获取合约工厂实例
  const [deployer] = await hre.ethers.getSigners();
  console.log("正在使用账户部署:", deployer.address);
  console.log("部署网络:", hre.network.name);
  console.log("账户余额:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // 使用合约名编译并部署合约
  const ChainEval = await hre.ethers.getContractFactory("ChainEval", deployer);
  const chainEval = await ChainEval.deploy();

  await chainEval.waitForDeployment();

  const contractAddress = await chainEval.getAddress();
  console.log("ChainEval 合约部署成功，地址:", contractAddress);

  // 创建包含合约地址的 JSON 文件
  const contractData = {
    ChainEval: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId,
    deployTime: new Date().toISOString()
  };

  // 保存到文件
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}-address.json`),
    JSON.stringify(contractData, null, 2)
  );
  console.log(`合约地址已保存到 ${hre.network.name}-address.json 文件`);
}

// 运行部署函数
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 