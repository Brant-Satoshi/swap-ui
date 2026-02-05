# CP Chain Bridge & Swap Frontend Architecture

> Last updated: 2026-02-02

## 1. 项目概述

### 1.1 项目定位

这是一个面向 **CP Chain** 的 Web3 前端应用，提供以下核心功能：

- **Token 兑换 (Swap)**: 基于 0x API 的去中心化交易路由
- **跨链桥接 (Bridge)**: 在不同链之间转移代币（Sepolia、OP Sepolia、CP Chain）
- **钱包连接**: 多钱包支持（MetaMask、OKX Wallet、Trust Wallet 等）

### 1.2 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | Next.js 16.0.10 (App Router) |
| 语言 | TypeScript 5 |
| 区块链 | wagmi v2, viem v2, RainbowKit v2 |
| 状态管理 | TanStack Query v5 |
| 样式 | Tailwind CSS v4, tw-animate-css |
| UI 组件 | Radix UI primitives, clsx, tailwind-merge |
| 国际化 | next-intl v4 |
| 主题 | next-themes (深色/浅色模式) |
| 字体 | Geist Sans, Geist Mono |
| 包管理器 | pnpm |

---

## 2. 目录结构

```
bridge-frontend/
├── src/
│   ├── app/
│   │   ├── [locale]/               # 国际化路由
│   │   │   ├── swap/page.tsx       # 兑换页面
│   │   │   └── bridge/page.tsx     # 跨链桥页面
│   │   ├── api/0x/                 # 0x API 代理
│   │   │   ├── price/route.ts      # 报价接口
│   │   │   └── quote/route.ts      # 兑换交易接口
│   │   ├── layout.tsx              # 根布局
│   │   ├── page.tsx                # 首页
│   │   ├── providers.tsx           # Context Providers
│   │   └── globals.css             # 全局样式
│   ├── components/
│   │   ├── ui/                     # 可复用 UI 组件
│   │   │   ├── button.tsx
│   │   │   ├── dialog.tsx          # Token 选择弹窗
│   │   │   ├── popover.tsx
│   │   │   ├── hover-card.tsx
│   │   │   ├── input.tsx
│   │   │   ├── sheet.tsx
│   │   │   └── spinner.tsx
│   │   ├── navbar/
│   │   │   └── Navbar.tsx          # 导航栏 + 钱包连接
│   │   └── swap/                   # Swap/Bridge 相关组件
│   │       ├── SwapPanel.tsx       # 主兑换界面
│   │       ├── TokenSelect.tsx     # Token/Chain 选择器
│   │       ├── BridgeCard.tsx      # 跨链桥界面
│   │       └── TypingTitle.tsx     # 动画标题
│   ├── hooks/web3/
│   │   ├── useWallet.tsx           # 钱包连接状态
│   │   └── useNativeBalance.tsx    # 原生代币余额
│   ├── lib/
│   │   ├── swap/
│   │   │   ├── fetchPrice.ts       # 0x API 客户端
│   │   │   └── tokens.ts           # Token 列表定义
│   │   ├── wallet/
│   │   │   ├── config.ts           # wagmi/RainbowKit 配置
│   │   │   └── getBalance.ts       # 余额查询
│   │   └── utils.ts                # 工具函数
│   ├── messages/                   # 国际化文案
│   │   ├── en.json
│   │   └── cn.json
│   ├── i18n/
│   │   └── request.ts              # next-intl 配置
│   └── generated.ts                # wagmi CLI 生成的类型
├── public/
│   ├── coin/                       # 代币图标
│   ├── logo.png, favicon.ico
│   └── chain/                      # 链图标
├── docs/
│   └── ARCHITECTURE.md             # 本文档
├── package.json
├── next.config.ts
├── wagmi.config.ts
└── tsconfig.json
```

---

## 3. 核心模块

### 3.1 区块链交互层 (`src/lib/wallet/`)

**支持的网络：**

| 链 | Chain ID | RPC | Explorer |
|---|----------|-----|----------|
| Ethereum Mainnet | 1 | - | etherscan.io |
| Sepolia Testnet | 11155111 | - | sepolia.etherscan.io |
| Optimism | 10 | - | optimistic.etherscan.io |
| Optimism Sepolia | 11155420 | - | sepolia-optimism.etherscan.io |
| Polygon | 137 | - | polygonscan.com |
| Arbitrum | 42161 | - | arbiscan.io |
| CP Chain Testnet | 86606 | https://rpc-testnet.cpchain.com | explorer-testnet.cpchain.com |

**钱包支持：**
- MetaMask
- TokenPocket
- OKX Wallet
- Trust Wallet
- Bitget Wallet
- WalletConnect
- Injected Wallet

### 3.2 兑换模块 (`src/lib/swap/`)

| 文件 | 功能 |
|------|------|
| `fetchPrice.ts` | 调用 `/api/0x/price` 获取 0x 报价 |
| `tokens.ts` | 定义可兑换的代币列表 |

**支持的代币：**

| Symbol | Name | Address | Decimals |
|--------|------|---------|----------|
| ETH | Ether | 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE | 18 |
| SepoliaETH | Sepolia ETH | 0xdd13E55209Fd76AfE204dBda4007C227904f0a81 | 18 |
| OP | Optimism | 0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238 | 18 |
| CP | CP Token | 0x0000000000000000000000000000000000000000 | 18 |
| USDT | Tether | 0xdAC17F958D2ee523a2206206994597C13D831ec7 | 6 |

### 3.3 API 代理层 (`src/app/api/0x/`)

```typescript
// 价格查询
GET /api/0x/price?chainId=11155111&sellToken=...&buyToken=...&sellAmount=...

// 兑换交易
GET /api/0x/quote?chainId=11155111&sellToken=...&buyToken=...&sellAmount=...
```

代理逻辑：
1. 从环境变量读取 `ZEROX_API_KEY`
2. 将请求转发到 `https://api.0x.org`
3. 添加 `0x-api-key` 和 `0x-version` 请求头
4. 返回 0x 的响应（不暴露 API Key）

### 3.4 UI 组件层

**SwapPanel 状态流程：**

```
IDLE → EDITING (输入金额)
     → QUOTING (防抖 300ms)
     → SUCCESS/ERROR (显示报价)
```

---

## 4. 数据流

### 4.1 报价获取流程

```
┌─────────────────────────────────────────────────────────────┐
│ User Input                                                   │
│  - sellToken, buyToken, sellAmount                          │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ SwapPanel.tsx                                                │
│ - useSwapQuote hook (300ms debounce)                        │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ fetch0xPrice()                                               │
│ - fetch('/api/0x/price?...')                                │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ /api/0x/price (Next.js API Route)                           │
│ - Add ZEROX_API_KEY header                                  │
│ - Proxy to https://api.0x.org/swap/allowance-holder/price   │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ 0x API                                                       │
│ Response: { price, buyAmount, sellAmount,                   │
│            estimatedPriceImpact, liquidityAvailable }        │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ UI Update                                                    │
│ - buyAmount input filled                                    │
│ - 显示 price, priceImpact                                   │
│ - 显示错误信息（如无流动性）                                  │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 钱包连接流程

```
┌─────────────────────────────────────────────────────────────┐
│ RainbowKit ConnectButton                                     │
│ - 检测钱包安装状态                                           │
│ - 显示连接/断开按钮                                          │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ wagmi config + WalletConnect                                │
│ - 建立 WalletConnection                                     │
│ - 返回 account, chain, isConnected                          │
└─────────────────────┬───────────────────────────────────────┘
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ useBalance Hook                                             │
│ - 查询连接账户的代币余额                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. 关键依赖

### 5.1 第三方 API

| 服务 | 用途 | 端点 | 认证 |
|------|------|------|------|
| **0x API** | 兑换报价路由 | `https://api.0x.org/swap/allowance-holder/price` | `ZEROX_API_KEY` 环境变量 |
| **CP Chain RPC** | 链上数据查询 | `https://rpc-testnet.cpchain.com` | 无 |
| **WalletConnect** | 钱包连接 | `https://rpc.walletconnect.com` | `NEXT_PUBLIC_WC_PROJECT_ID` |

### 5.2 缓存策略

| 层级 | 技术 | 配置 |
|------|------|------|
| API 响应 | TanStack Query | `staleTime: 10s`, `gcTime: 10min`, `retry: 1` |
| 请求去重 | React Query | 自动 deduplicate 相同 key 的请求 |
| 防抖 | setTimeout | `300ms` 延迟触发报价请求 |

### 5.3 无数据库

- **原因**: 这是纯前端应用，所有链上数据通过 RPC 直接查询
- **状态管理**: React Context + TanStack Query

---

## 6. 环境变量

```bash
# WalletConnect 项目 ID
NEXT_PUBLIC_WC_PROJECT_ID=903c24c5f73ffb24608497d3153f9ef5

# 0x API Key (仅后端使用，不暴露给客户端)
ZEROX_API_KEY=f8ada49f-667e-474e-b546-aa7b5d632e20
```

---

## 7. 跨链桥配置

**桥接合约地址：**

| 源链 | 合约地址 |
|------|----------|
| Sepolia Testnet | `0xa84593B6FC3DF802fBEa7Ed8a72EEF05Ca6f19f9` |
| OP Sepolia | `0x04557519Fb29146d29203faD03B307F1775527E0` |
| CP Chain Testnet | `0x558A58D22d5fE5832A2E11Eb0f89552a8C85190f` |

---

## 8. 国际化

支持语言：
- English (`/en`)
- 中文 (`/cn`)

文案文件：`src/messages/{en,cn}.json`

主要文案模块：
- `Navbar`: 导航栏
- `SwapPage`: 兑换页面标题
- `SwapCard`: 跨链桥卡片
- `SwapUi`: 兑换界面

---

## 9. 未实现功能 (Roadmap)

根据设计文档，以下功能待实现：

| 功能 | 里程碑 | 状态 |
|------|--------|------|
| Max 按钮 (设置全部余额) | M1.3 | ❌ |
| 骨架屏加载状态 | M4.1 | ❌ |
| Allowance 检查 | M3.1 | ❌ |
| Approve 交易流程 | M3.2 | ❌ |
| Swap 交易执行 | M3.3 | ❌ |
| 状态机管理 UI 状态 | M3.5 | ❌ |
| 交易状态弹窗 | M3.4 | ❌ |
| 测试网验证与部署 | M4.2 | ❌ |

详见：[implementation-plan.md](../memory-bank/implementation-plan.md)

---

## 10. 错误处理

### 10.1 报价阶段错误

| 错误码 | 描述 | 显示文案 |
|--------|------|----------|
| `NO_LIQUIDITY` | 无流动性 | "流动性不足" / "No liquidity" |
| `NETWORK` | 网络错误 | "网络错误" / "Network error" |
| `RATE_LIMIT` | 请求限流 | "请求过于频繁" / "Rate limited" |
| `INVALID_PAIR` | 无效交易对 | "交易对不可用" / "Invalid pair" |

### 10.2 用户操作限制

- 禁止 `sellToken == buyToken`
- 余额不足时禁用 Swap 按钮
- 链不支持时提示切换

---

## 11. 安全措施

- ✅ API Key 通过 Next.js API Route 代理，不暴露给客户端
- ✅ 所有地址进行 checksum 校验
- ✅ 报价请求使用防抖和竞态处理（AbortController）
- ✅ 桥接合约地址在配置中集中管理
