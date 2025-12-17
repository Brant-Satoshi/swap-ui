'use client';

import { createConfig, http, injected } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { metaMask } from 'wagmi/connectors'

// const projectId = '<YOUR_WALLETCONNECT_PROJECT_ID>'

export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),  // 浏览器注入钱包（包括 MetaMask 等）
    metaMask(), // 显式 MetaMask 
    // walletConnect({ projectId }), // 显式 WalletConnect
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
