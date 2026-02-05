# Swap UI Design Doc (MVP)

> Owner: Brant  
> Status: Draft  
> Last updated: 2026-01-29

## 1. Overview
Swap UI 是一个面向 EVM 链的前端应用，完成从“连接钱包 → 获取报价 → 检查授权 → Approve → Swap → 状态反馈”的闭环。  
MVP 优先保证：**稳定、可用、错误清晰、状态可追踪**。

---

## 2. Goals
### Must-have (MVP)
- 支持至少 1 条链（建议：Base 或 Sepolia）与基础 token swap（ERC20↔ERC20，含原生币/WETH 的 wrap/unwrap 可选）
- 核心流程闭环：
  1) 连接钱包  
  2) 选择 Token & 输入卖出数量  
  3) 获取报价（Quote Preview）  
  4) Allowance 检查  
  5) Approve（可选 infinite / exact）  
  6) Swap 发起 & 确认  
  7) 成功/失败状态展示，余额刷新
- 可靠的请求防抖 + 竞态处理（过期请求不写 UI）
- 明确、可读的错误分类与展示（不只一句 “failed”）
- 交易状态机（UI 与链上事务一致）

### Nice-to-have (Post-MVP)
- 多链切换与多 tokenlist 来源
- 交易历史、价格图表、路由展示增强
- AA / Paymaster 支持
- 多报价比价（0x + 1inch fallback）

---

## 3. Non-goals
- 不做限价单、跨链 swap、复杂路由可视化
- 不做链上价格预言机、做市深度分析
- 不承担交易执行保障（仅作为用户发起交易的界面）

---

## 4. Assumptions
- 使用 wagmi/viem 与钱包交互
- 聚合报价服务优先选择 0x（也可抽象成 QuoteProvider）
- Token 数据来源：MVP 先用静态白名单 + 可选 tokenlist
- RPC 由环境变量提供（可后续加 fallback RPC）

---

## 5. System Architecture

### 5.1 High-level components
- **UI Layer**
  - SwapPanel（核心交互）
  - TokenSelector（搜索/常用/余额）
  - Settings（slippage、approve 模式）
  - TxStatusModal / Toast（事务状态与错误）
- **Domain Layer**
  - SwapStateMachine（状态机）
  - QuoteService（报价/刷新/过期）
  - AllowanceService（allowance 查询）
  - TxService（approve/swap 发送与确认）
  - ErrorMapper（错误归一化与用户提示）
- **Infra Layer**
  - Public RPC / wagmi client
  - API proxy（可选：Next.js route handler 代理 0x API key）
  - Cache（内存 cache + 请求去重）

### 5.2 Data flow (happy path)
1) User input sellAmount → debounce
2) QuoteService.fetchQuote → 更新 quote
3) AllowanceService.fetchAllowance → 更新 approvalNeeded
4) 点击 Approve → TxService.approve → 等确认
5) 点击 Swap → QuoteService.fetchSwapTx → TxService.sendTx → 等确认
6) 成功后刷新余额 + 清理输入

---

## 6. Core User Flows

### 6.1 Quote Preview
Trigger 条件：
- 钱包已连接
- sellToken 与 buyToken 不同
- sellAmount 合法（>0 且不超余额）
- 当前链在支持列表中

展示内容（MVP）：
- buyAmount（预计买入）
- price（sell/buy 汇率）
- priceImpact（若可得）
- 估算 gas（可选）
- 报价时间与过期（如 0x 返回有效期/或自定义 TTL）

### 6.2 Allowance & Approve
- 原生币（ETH）无需 allowance
- ERC20：
  - allowance >= sellAmount → 可直接 swap
  - allowance < sellAmount → 显示 Approve CTA
Approve 策略：
- Exact：授权 sellAmount（更安全）
- Infinite：授权 MaxUint256（更省事，默认可选）

### 6.3 Swap Execution
- Swap 前二次校验：报价未过期、余额足够、链正确
- 发起交易后显示：
  - pending（hash + explorer link）
  - confirmed（成功提示）
  - failed（失败原因 + 可重试建议）

---

## 7. State Machine

### 7.1 States
- `IDLE`：未输入/未准备
- `EDITING`：输入中
- `QUOTING`：请求报价中
- `QUOTE_READY`：报价可用
- `APPROVAL_NEEDED`：需要授权
- `APPROVING`：授权交易进行中
- `READY_TO_SWAP`：可 swap
- `SWAPPING`：swap 交易进行中
- `SUCCESS`：成功
- `ERROR`：错误（带 errorCode）

### 7.2 Transitions (simplified)
- IDLE → EDITING（用户选择 token/输入金额）
- EDITING → QUOTING（防抖触发）
- QUOTING → QUOTE_READY | ERROR
- QUOTE_READY → APPROVAL_NEEDED | READY_TO_SWAP（根据 allowance）
- APPROVAL_NEEDED → APPROVING → READY_TO_SWAP | ERROR
- READY_TO_SWAP → SWAPPING → SUCCESS | ERROR
- 任意状态：chain/token/sellAmount 变化 → 回到 EDITING（并清理过期 quote）

---

## 8. API & Integration (Provider Abstraction)

### 8.1 QuoteProvider interface
- `getPrice({ chainId, sellToken, buyToken, sellAmount, taker }) -> Quote`
- `getSwapTx({ chainId, sellToken, buyToken, sellAmount, taker, slippage }) -> TxRequest`

### 8.2 0x Integration (recommended)
- 通过 Next.js API route 代理请求，隐藏 0x API key
- 支持 price endpoint & swap endpoint
- 将上游错误映射成统一 ErrorCode（见第 10 节）

---

## 9. Token Data
### 9.1 MVP token strategy
- 静态白名单（每条链 10~30 个常用 token）
- 可选：加载 tokenlist（失败则降级到白名单）
- 用户手动添加 token（address → 读取 symbol/decimals/name）

### 9.2 Balance fetching
- 使用 multicall 批量读取余额、allowance
- 缓存策略：
  - quote: TTL 10~20s
  - balances: 10~30s 或 tx confirmed 后强制刷新

---

## 10. Error Handling (User-visible)
### 10.1 Error taxonomy
- `UNSUPPORTED_CHAIN`
- `INSUFFICIENT_BALANCE`
- `NO_LIQUIDITY`
- `QUOTE_EXPIRED`
- `RATE_LIMITED`（429）
- `INVALID_API_KEY`（401）
- `USER_REJECTED`（用户拒签）
- `TX_REVERTED`
- `RPC_ERROR` / `NETWORK_ERROR`

### 10.2 Display rules
- Quote 阶段错误：展示在价格区域（不弹窗打断）
- Approve/Swap 错误：toast + modal（包含可复制的短错误详情）
- 提供 “Retry” 行为：
  - Quote：自动重试（指数退避）或手动刷新按钮
  - Tx：用户手动重试（保留输入）

---

## 11. Security & Safety
- 所有地址做 checksum 校验
- 禁止 sellToken == buyToken
- slippage 默认合理值（例如 0.5% / 1%）
- approve 默认 exact（更安全），infinite 作为可选项并提示风险
- 不在前端暴露敏感 API key（使用 server route proxy）
- 防止过期 quote 用于 swap：swap 前重新校验/必要时重新报价

---

## 12. Performance & UX
- 输入防抖（例如 300ms）
- 并发请求取消：AbortController / requestId 校验
- 关键路径的 loading/disabled：
  - QUOTING：禁用 Swap，显示 skeleton
  - APPROVING/SWAPPING：禁用所有输入与按钮（或半禁用）
- 移动端适配：TokenSelector、弹窗与按钮区域可触达

---

## 13. Testing Plan
### Unit tests
- 金额校验（parse/format/decimals）
- ErrorMapper（上游错误 → ErrorCode）
- 状态机 transition

### Integration tests
- Quote → Allowance → Approve → Swap 的模拟流程（mock provider）
- 竞态：快速切 token/输入，确保最终 UI 与最后一次请求一致

### E2E (optional)
- 测试网真实跑通（Sepolia/Base testnet）
- 断网/RPC 错误/用户拒签

---

## 14. Deployment
- Vercel 部署（Next.js）
- 环境变量：
  - RPC URLs（per chain）
  - Provider API Key（server-side）
  - Explorer base URL（per chain）
- 观测（可选）：Sentry + 基础埋点（quote fail、tx fail）

---

## 15. Milestones & Deliverables
### M1 (1~2 days)
- 钱包连接、Token 白名单、输入与余额展示

### M2 (2~4 days)
- 报价、错误展示、竞态处理

### M3 (2~4 days)
- Allowance、Approve、Swap、状态机与 Tx modal

### M4 (1~2 days)
- 体验打磨、测试网验证、上线

---

## 16. Open Questions
- MVP 支持哪条链（Base/Sepolia/主网？）
- tokenlist 是否要支持（以及来源）
- approve 默认策略：exact vs infinite
- Quote TTL & 刷新策略（自动 vs 手动）
- 是否要 wrap/unwrap 原生币（ETH↔WETH）
