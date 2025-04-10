# ChainEval - 基于区块链的课程评价系统

ChainEval是一个使用区块链技术实现的课程评价系统，允许学生对自己修过的课程进行评价，并确保评价数据的安全性和不可篡改性。系统提供匿名评价选项，保护学生隐私的同时提高评价真实性。

## 技术栈

- **前端**: 
  - React 19 + TypeScript + Vite
  - TailwindCSS 用于UI开发
  - React Router v7 实现路由管理
  - FontAwesome 提供图标支持
  - dayjs 处理日期时间
  
- **区块链技术**:
  - Solidity 0.8.19 编写智能合约
  - Web3.js 与区块链交互
  - Hardhat 开发、测试和部署智能合约
  - OpenZeppelin 合约安全库

## 主要功能

### 用户角色
- **学生**: 
  - 浏览所有可用课程
  - 查看已修课程列表
  - 提交课程评价（可选匿名）
  - 管理个人评价历史
  
- **教师**: 
  - 查看自己教授的课程列表
  - 获取课程评价统计数据
  - 浏览学生对课程的反馈
  
- **管理员**: 
  - 管理全部用户账户
  - 添加和更新课程信息
  - 标记学生修过的课程
  - 查看所有评价数据

### 核心功能
- 基于区块链的用户认证系统
- 课程管理与浏览
- 安全的评价提交机制
- 支持匿名评价的隐私保护
- 数据统计与可视化展示

## 项目结构

```
/ (根目录)
├── src/                    # 前端源代码
│   ├── assets/             # 静态资源文件
│   ├── components/         # 共用组件
│   │   ├── Layout.tsx      # 布局组件
│   │   └── Navbar.tsx      # 导航栏组件
│   ├── pages/              # 页面组件
│   │   ├── Login.tsx       # 登录页面
│   │   ├── Register.tsx    # 注册页面
│   │   ├── Dashboard.tsx   # 控制面板
│   │   └── ...             # 其他页面组件
│   ├── types/              # TypeScript类型定义
│   ├── utils/              # 工具函数
│   │   └── contract.ts     # 区块链合约交互
│   └── ChainEval.json      # 智能合约ABI
├── hardhat/                # 区块链开发环境
│   ├── contracts/          # Solidity智能合约
│   │   └── ChainEval.sol   # 主合约文件
│   ├── scripts/            # 部署脚本
│   ├── tasks/              # Hardhat任务
│   └── deployments/        # 部署记录
├── public/                 # 公共静态文件
└── index.html              # 应用入口HTML
```

## 智能合约

系统的核心是ChainEval智能合约，实现了:

- **用户管理**:
  - 支持学生、教师和管理员角色
  - 安全的密码哈希存储
  - 基于地址的身份验证

- **课程管理**:
  - 课程创建和更新
  - 学生修课记录存储
  - 教师与课程关联

- **评价系统**:
  - 评分和文字评价
  - 匿名评价选项
  - 评价历史记录

- **安全保障**:
  - 防重入保护
  - 访问控制
  - 数据隐私保护

## 快速开始

### 前端部分

#### 安装依赖
```bash
pnpm install
```

#### 开发环境运行
```bash
pnpm dev
```

#### 构建生产环境代码
```bash
pnpm build
```

#### 预览构建结果
```bash
pnpm preview
```

### 区块链部分

#### 安装智能合约依赖
```bash
cd hardhat
pnpm install
```

#### 编译智能合约
```bash
pnpm compile
```

#### 启动本地测试网络
```bash
pnpm node
```

#### 部署到geth网络
```bash
pnpm deploy-geth
```

## 浏览器支持

- Chrome/Edge >= 100
- Firefox >= 100
- Safari >= 15

## 贡献指南

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的改动 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建新的 Pull Request

## 联系方式

如有问题或建议，请提交issue或PR。
