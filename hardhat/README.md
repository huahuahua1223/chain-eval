# ChainEval 智能合约

这是ChainEval课程评价系统的智能合约部分，使用Hardhat开发环境构建。智能合约实现了用户管理、课程管理、评价系统等核心功能。

## 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0
- Geth (如需部署到本地私有链)

## 安装依赖

```bash
pnpm install
```

## 编译合约

```bash
pnpm compile
```

## 运行测试

```bash
pnpm test
```

## 启动本地开发网络

```bash
pnpm node
```

## 部署合约

### 部署到本地测试网络
```bash
pnpm run deploy-geth
```

### 查看账户
```bash
# 查看本地账户
pnpm run accounts

# 查看geth网络账户
pnpm run accounts-geth
```

## 合约功能

- **用户管理**：注册、登录、权限控制
- **课程管理**：添加课程、修改课程信息、关联教师
- **评价系统**：学生提交评价、查看评价统计
- **数据隐私**：支持匿名评价功能

## 合约结构

- `ChainEval.sol`: 主合约，实现了用户认证、课程管理和评价系统
  - 用户结构体：存储用户基本信息和角色
  - 课程结构体：存储课程详情和相关教师
  - 评价结构体：存储评分、评论和隐私设置

## 项目文件说明

- `contracts/`: 智能合约源代码
  - `ChainEval.sol`: 课程评价系统的主合约
- `scripts/`: 部署和其他脚本
  - `deploy-geth.js`: 部署到本地geth网络的脚本
- `deployments/`: 部署记录和合约地址
- `test/`: 自动化测试用例
- `hardhat.config.js`: Hardhat配置文件，包含网络设置和编译选项

## 安全注意事项

- 合约使用OpenZeppelin库增强安全性
- 实现了防重入保护机制
- 添加了适当的访问控制和权限验证
- 密码使用哈希存储保障安全

## 常见问题

1. **部署失败**：确保geth网络已启动且配置正确
2. **Gas费不足**：调整hardhat.config.js中的gas设置
3. **无法连接钱包**：检查网络配置和账户权限 