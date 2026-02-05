# Swap UI 实施计划 (MVP)

本文档为 AI 开发者提供逐步指令，以实现一个最小可行产品（MVP）的 Swap UI。每一步都包含具体的实现要求和验证测试。

## 里程碑 1: 基础设置与数据显示

### 步骤 1.1: 实现钱包连接功能

*   **指令**:
    1.  在 `src/components/navbar/Navbar.tsx` 组件中，添加一个“连接钱包”按钮。
    2.  使用 `wagmi` 和 `viem` 库，配置 `src/lib/wallet/config.ts` 以支持至少一个 EVM 兼容链（例如，Sepolia 测试网）。
    3.  实现 `useWallet.tsx` hook，管理钱包的连接状态（已连接/未连接）、账户地址和链 ID。
    4.  当用户点击“连接钱包”按钮时，触发钱包连接流程（例如，弹出 MetaMask）。
    5.  连接成功后，按钮应显示截断的钱包地址（例如 `0x123...abc`），并提供断开连接的选项。

*   **测试**:
    1.  **手动测试**: 访问页面，初始状态下应看到“连接钱包”按钮。点击按钮，确认钱包扩展程序弹出。完成连接后，确认导航栏中的按钮文本更新为用户的钱包地址。刷新页面，应保持连接状态。
    2.  **单元测试**: 为 `useWallet.tsx` hook 编写测试，模拟钱包连接和断开操作，验证其状态变化是否符合预期。

### 步骤 1.2: 创建静态 Token 列表和选择器

*   **指令**:
    1.  在 `public/json/` 目录下创建一个 `tokens.json` 文件，为目标链（例如 Sepolia）定义一个静态的 Token 白名单。每个 Token 对象应包含 `address`, `symbol`, `name`, `decimals`, 和 `logoURI` 字段。至少包含 5-10 个常用 Token。
    2.  创建 `src/components/swap/TokenSelect.tsx` 组件。该组件应作为按钮，显示当前选中的 Token 信息（Logo 和 Symbol）。
    3.  点击该按钮时，弹出一个模态框（Dialog/Popover），其中包含一个搜索框和一个可滚动的列表，用于展示从 `tokens.json` 加载的所有可选 Token。
    4.  实现 `sellToken` 和 `buyToken` 的状态管理。在 `src/app/[locale]/swap/page.tsx` 中，默认选择白名单中的前两个 Token 作为初始 `sellToken` 和 `buyToken`。确保 `sellToken` 和 `buyToken` 不能是同一个 Token。
    5.  用户在模态框中选择一个新的 Token 后，应更新相应的状态（`sellToken` 或 `buyToken`）并关闭模态框。

*   **测试**:
    1.  **手动测试**: 页面加载后，`SwapPanel` 中应默认显示两个不同的 Token。点击任一 Token，应弹出选择列表。在列表中选择另一个 Token，面板上的显示应随之更新。尝试将 `buyToken` 设置为与 `sellToken` 相同，UI 应能阻止此操作或自动切换另一个 Token。
    2.  **组件测试**: 对 `TokenSelect.tsx` 进行测试，验证点击时是否能正确弹出模态框，以及列表是否正确渲染了从 `tokens.json` 传入的数据。

### 步骤 1.3: 实现金额输入与余额显示

*   **指令**:
    1.  在 `src/components/swap/SwapPanel.tsx` 中，为 `sellToken` 添加一个数字输入框，允许用户输入希望卖出的数量。
    2.  在 `src/hooks/web3/` 下创建 `useTokenBalance.ts` hook，该 hook 接收一个 Token 地址，并使用 `wagmi` 的 `useBalance` 来获取当前连接账户的该 Token 余额。对于原生币（如 ETH），地址应为 `undefined`。
    3.  在 `sellToken` 输入框下方，显示当前用户该 Token 的余额。
    4.  添加一个“Max”按钮，点击后将输入框的值设置为用户的 `sellToken` 全部余额。

*   **测试**:
    1.  **手动测试**: 连接钱包后，在 `sellToken`下方应能看到正确的余额。切换 `sellToken`，余额应随之更新。手动输入一个数字，应能正常显示。点击“Max”按钮，输入框应被填充为全部余额。
    2.  **Hook 测试**: 对 `useTokenBalance.ts` 进行单元测试，mock `wagmi` 的 `useBalance` 返回值，验证 hook 是否能正确格式化并返回余额数据。

---

## 里程碑 2: 获取报价与错误处理

### 步骤 2.1: 实现后端代理以安全调用 0x API

*   **指令**:
    1.  在 `src/app/api/0x/` 目录下，利用 Next.js API Routes 创建 `price/route.ts` 和 `quote/route.ts`。
    2.  这些路由应从请求参数中接收 `sellToken`, `buyToken`, `sellAmount` 等参数。
    3.  在服务器端，这些路由将从环境变量（`process.env.ZEROEX_API_KEY`）中读取 0x API 密钥。
    4.  将用户的请求转发到 0x API 的 `/swap/v1/price` 和 `/swap/v1/quote` 端点，并将 0x 的响应直接返回给前端。
    5.  确保隐藏 API Key，不将其暴露给客户端。

*   **测试**:
    1.  **API 测试**: 使用 Postman 或 `curl` 等工具，直接调用你创建的 `/api/0x/price` 端点，并附上必要的查询参数。验证它是否能从 0x API 成功获取报价并返回，同时确认响应中不包含 API 密钥。测试无效参数，确保 API 能正确处理并返回错误信息。

### 步骤 2.2: 实现报价获取与显示

*   **指令**:
    1.  在 `src/lib/swap/` 下创建 `fetchQuote.ts`，该文件导出一个函数，用于调用上一步创建的 `/api/0x/price` 接口。
    2.  在 `SwapPanel.tsx` 中，当 `sellToken`、`buyToken` 和 `sellAmount`（大于 0）都存在时，触发 `fetchQuote` 函数。
    3.  获取到报价后，将预期的 `buyAmount` 显示在 `buyToken` 的输入框中。
    4.  在 UI 中展示汇率（例如“1 ETH = 1,800 USDC”）和报价的有效时间（例如“报价将在 15 秒后过期”）。
    5.  当报价请求正在进行时，在 `buyAmount` 输入框位置显示一个加载指示器（Spinner）。

*   **测试**:
    1.  **手动测试**: 在 `sellAmount` 输入框中输入一个有效的数字（例如 0.1）。确认网络请求已发送至 `/api/0x/price`，并且在短暂的加载后，`buyAmount` 输入框被自动填充。同时，检查汇率信息是否正确显示。
    2.  **集成测试**: 编写测试，模拟用户输入，mock `fetchQuote` 函数的成功和加载中状态，验证 UI 是否在不同状态下（加载中、成功）正确渲染。

### 步骤 2.3: 处理输入防抖和过期的请求

*   **指令**:
    1.  实现一个 `useDebounce` hook。在 `SwapPanel.tsx` 中，使用此 hook 来包裹 `sellAmount` 的值，设置一个 300ms 左右的延迟。
    2.  报价请求应使用这个去抖后的值来触发，以避免在用户快速输入时发送大量请求。
    3.  修改 `fetchQuote.ts` 和其调用逻辑，使用 `AbortController` 来取消前一个正在进行的请求。当发起一个新的报价请求时，如果上一个请求尚未完成，应将其取消。

*   **测试**:
    1.  **手动测试**: 打开浏览器的网络调试工具。快速连续输入或删除 `sellAmount` 中的数字。确认 API 请求不是在每次按键时都发送，而是在停止输入后的一小段时间（例如 300ms）才发送一次。快速切换 `sellToken` 或 `buyToken`，确认旧的报价请求被取消（在网络工具中显示为 "canceled"），并且只有最后一次选择对应的请求被处理。

### 步骤 2.4: 为报价流程实现基础的错误显示

*   **指令**:
    1.  定义一个错误状态，用于在 `SwapPanel.tsx` 中存储来自报价接口的错误信息。
    2.  当 `/api/0x/price` 返回错误时（例如，没有流动性、网络错误），捕获该错误。
    3.  在 `buyAmount` 输入框的位置清晰地展示用户友好的错误信息，例如“没有足够的流动性”或“获取报价失败，请重试”。
    4.  发生错误时，应清空之前可能存在的报价数据。

*   **测试**:
    1.  **手动测试**: 尝试选择两个几乎没有流动性的 Token 进行交换，或者在 `fetchQuote` 中手动模拟一个 API 错误。确认 UI 上不再显示加载指示器，而是显示了明确的错误消息。
    2.  **单元测试**: 为处理报价的逻辑编写测试，模拟 API 返回 4xx 或 5xx 错误，验证 UI 状态是否正确更新为错误状态。

---

## 里程碑 3: 核心 Swap 逻辑

### 步骤 3.1: 实现 Allowance 检查

*   **指令**:
    1.  在 `src/lib/wallet/` 下创建 `getAllowance.ts` 函数，用于查询当前连接账户对 `sellToken` 的授权额度。该函数应接受 `chainId`, `tokenAddress`, `ownerAddress`, 和 `spenderAddress` (通常是 0x 路由器地址) 作为参数，并使用 `viem` 调用 ERC20 合约的 `allowance` 方法。
    2.  在 `SwapPanel.tsx` 中，当获取到报价后，调用 `getAllowance` 检查 `sellToken` 的授权额度是否足以覆盖 `sellAmount`。
    3.  根据检查结果，显示“Approve”按钮（如果需要授权）或“Swap”按钮（如果已授权）。

*   **测试**:
    1.  **手动测试**: 连接钱包并选择一个 ERC20 `sellToken`。如果当前账户从未授权过该 Token 或授权额度不足，应显示“Approve”按钮。如果已授权足够金额，应显示“Swap”按钮。切换不同的 `sellAmount`，验证按钮状态是否正确切换。
    2.  **集成测试**: 编写测试，模拟 `getAllowance` 返回不同的授权额度，验证 UI (Approve/Swap 按钮) 是否正确响应。

### 步骤 3.2: 实现 Approve 交易流程

*   **指令**:
    1.  在 `src/lib/wallet/` 下创建 `approveToken.ts` 函数，用于构建和发送 `approve` 交易。该函数应接受 `chainId`, `tokenAddress`, `spenderAddress`, 和 `amount` 作为参数，并使用 `viem` 调用 ERC20 合约的 `approve` 方法。
    2.  在 `SwapPanel.tsx` 中，当用户点击“Approve”按钮时，调用 `approveToken` 发起授权交易。
    3.  在交易进行中显示加载状态（例如，按钮变为“Approving...”并禁用），并提供交易哈希和指向区块浏览器的链接。
    4.  处理交易的成功和失败状态。成功后，重新检查 allowance 并更新 UI。失败时显示错误消息。
    5.  提供选项允许用户选择“Exact”（授权 `sellAmount`）或“Infinite”（授权 `MaxUint256`）授权模式，默认为“Exact”。

*   **测试**:
    1.  **手动测试**: 确保 `sellToken` 需要授权。点击“Approve”按钮，确认钱包弹出交易确认。确认交易发送后，UI 显示交易状态。交易成功后，页面应显示“Swap”按钮。
    2.  **单元测试**: 为 `approveToken.ts` 编写测试，模拟交易发送和确认，验证其功能。
    3.  **集成测试**: 模拟用户点击“Approve”按钮，mock `approveToken` 的不同返回结果（成功、失败），验证 UI 状态的正确转换。

### 步骤 3.3: 实现 Swap 交易流程

*   **指令**:
    1.  在 `src/lib/swap/` 下创建 `fetchSwapTx.ts`，该文件导出一个函数，用于调用 `/api/0x/quote` 接口获取 Swap 交易数据（`data`, `to`, `value` 等）。
    2.  在 `src/lib/wallet/` 下创建 `sendSwapTx.ts` 函数，用于发送 Swap 交易。该函数应接受 `chainId`, `to`, `data`, `value` 等参数，并使用 `viem` 发送交易。
    3.  在 `SwapPanel.tsx` 中，当用户点击“Swap”按钮时，首先调用 `fetchSwapTx` 获取交易数据，然后调用 `sendSwapTx` 发起 Swap 交易。
    4.  在交易进行中显示加载状态（例如，按钮变为“Swapping...”并禁用），并提供交易哈希和指向区块浏览器的链接。
    5.  处理交易的成功和失败状态。成功后刷新余额并清理输入。失败时显示错误消息。
    6.  在 Swap 前，二次校验报价未过期、余额足够、链正确。

*   **测试**:
    1.  **手动测试**: 确保已连接钱包、`sellToken` 已授权且有足额余额。点击“Swap”按钮，确认钱包弹出交易确认。确认交易发送后，UI 显示交易状态。交易成功后，刷新页面并检查余额。
    2.  **单元测试**: 为 `fetchSwapTx.ts` 和 `sendSwapTx.ts` 编写测试，模拟 API 调用和交易发送。
    3.  **集成测试**: 模拟用户点击“Swap”按钮，mock `fetchSwapTx` 和 `sendSwapTx` 的不同返回结果，验证 UI 状态的正确转换。

### 步骤 3.4: 实现交易状态显示

*   **指令**:
    1.  在 `src/components/ui/` 下创建一个 `TxStatusModal.tsx` 组件，用于显示交易的详细状态。
    2.  当 Approve 或 Swap 交易发起后，弹出 `TxStatusModal`。
    3.  模态框应显示：交易类型（Approve/Swap）、交易状态（Pending/Confirmed/Failed）、交易哈希、以及指向区块浏览器的链接。
    4.  对于失败的交易，显示详细的错误原因，并提供重试建议（例如，对于用户拒签）。
    5.  模态框应有一个关闭按钮。

*   **测试**:
    1.  **手动测试**: 发起一个 Approve 或 Swap 交易，观察 `TxStatusModal` 是否正确弹出，并显示正确的交易信息。故意拒绝交易，验证模态框是否显示失败状态和错误信息。
    2.  **组件测试**: 为 `TxStatusModal.tsx` 编写测试，模拟不同的交易状态和错误信息，验证组件的渲染是否正确。

### 步骤 3.5: 集成基本状态机管理 UI 状态

*   **指令**:
    1.  在 `src/hooks/` 下创建一个 `useSwapStateMachine.ts` hook。根据 `swap-design-document.md` 的第 7 节“State Machine”定义状态和转换。
    2.  在 `SwapPanel.tsx` 中使用 `useSwapStateMachine` 来管理整个 Swap 流程的 UI 状态。
    3.  根据状态机的当前状态，禁用或启用输入框和按钮，显示加载指示器，并触发相应的操作（例如，在 `QUOTING` 状态时调用 `fetchQuote`）。
    4.  确保在链、Token 或 `sellAmount` 变化时，状态机能正确回到 `EDITING` 状态并清理过期报价。

*   **测试**:
    1.  **手动测试**: 执行一个完整的 Swap 流程（输入金额 -> 获取报价 -> Approve -> Swap），观察 UI 元素（输入框、按钮、加载指示器）是否严格按照状态机的定义进行切换。例如，在 `QUOTING` 状态时，Swap 按钮应被禁用且 Buy Amount 显示加载。
    2.  **单元测试**: 为 `useSwapStateMachine.ts` hook 编写测试，模拟用户行为和外部事件（例如，报价返回、交易确认），验证状态转换是否符合预期。

---

## 里程碑 4: 优化与部署准备

### 步骤 4.1: 优化 UI 加载状态和用户体验

*   **指令**:
    1.  在 `QUOTING` 状态下，`buyAmount` 输入框显示 skeleton 骨架屏，而不是简单的 spinner。
    2.  在 `APPROVING` 和 `SWAPPING` 状态下，禁用所有的 Token 选择器和金额输入框，将“Approve”/“Swap”按钮替换为加载指示器和文字（例如，“Approving...”）。
    3.  确保移动端适配，TokenSelector、弹窗和按钮区域在小屏幕上也能正常触达和使用。

*   **测试**:
    1.  **手动测试**: 模拟网络慢速环境。输入金额以触发报价，观察 `buyAmount` 是否显示骨架屏。点击 Approve/Swap 按钮，观察所有交互元素是否正确禁用，并显示对应的加载文本。在移动设备或使用浏览器开发者工具模拟移动视图，检查布局和交互是否良好。

### 步骤 4.2: 测试网验证和部署

*   **指令**:
    1.  在 `wagmi.config.ts` 中，除了 Sepolia，添加 Base Goerli 或 Base Sepolia 等测试网支持。
    2.  配置 `next.config.ts` 以允许从环境变量中读取多个 RPC URL 和 Explorer base URL。
    3.  部署应用程序到 Vercel 或类似平台。
    4.  在部署的应用程序上，使用真实的测试网资金执行完整的 Swap 流程。

*   **测试**:
    1.  **手动测试**: 在部署后的应用程序上，连接到测试网（例如 Base Sepolia），获取测试币。执行一个完整的 ERC20 到 ERC20 的 Swap 流程。验证交易是否成功，余额是否更新。尝试多种不同的 Token 对。
    2.  **生产环境验证**: 确认所有环境变量都已正确配置，并且应用程序可以正常与区块链交互。

---

## 开放问题 (需与产品/用户确认)

*   MVP 支持哪条链（Base/Sepolia/主网？）
*   tokenlist 是否要支持（以及来源）
*   approve 默认策略：exact vs infinite
*   Quote TTL & 刷新策略（自动 vs 手动）
*   是否要 wrap/unwrap 原生币（ETH↔WETH）

---
