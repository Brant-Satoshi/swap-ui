This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

src/
  app/
    layout.tsx
    page.tsx
    swap/
      page.tsx                 // Swap 页面（组合各块 UI）
    api/                       // 可选：后端转发/quote 聚合
      quote/route.ts

  components/
    ui/                        // shadcn 组件
    layout/                    // Header, Footer, Container
    wallet/                    // Connect button / modal / chain switch
    swap/                      // 纯 UI 组件（不含业务）
      SwapCard.tsx
      TokenSelector.tsx
      AmountInput.tsx
      PriceInfo.tsx
      SettingsDialog.tsx
      ReviewDialog.tsx
      TxStatusToast.tsx

  features/
    swap/                      // 业务与状态（核心）
      hooks/
        useQuote.ts            // 输入变化 -> 获取报价
        useSwap.ts             // 发起 swap（含 approve/permit 流程的编排）
        useAllowance.ts
        useBalances.ts
        useSlippage.ts
      services/
        quoteService.ts        // 调用 Uniswap/自家路由/聚合器
        tokenService.ts        // token 列表、metadata、logo
        txService.ts           // 发交易、等待确认、解析回执
      store/
        useSwapStore.ts        // Zustand/Redux（推荐 Zustand）
      types.ts
      constants.ts

  lib/
    wagmi/
      config.ts                // wagmiConfig(getDefaultConfig)
      providers.tsx            // Providers: Wagmi/Query/RainbowKit
    viem/
      clients.ts               // publicClient / walletClient
    chains.ts                  // 支持的链、RPC、explorer
    env.ts                     // 环境变量校验

  config/
    tokens/
      mainnet.json
      polygon.json
      optimism.json
      arbitrum.json

  styles/
    globals.css

  utils/
    format.ts                  // formatUnits, shortenAddress, number format
    debounce.ts
    error.ts

  assets/
    wallets/
    tokens/
