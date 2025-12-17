import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  tokenPocketWallet,
  okxWallet,
  trustWallet,
  bitgetWallet,
  walletConnectWallet,
  injectedWallet,
  // 可选：injectedWallet, 让“Installed”更友好
} from "@rainbow-me/rainbowkit/wallets";

import { mainnet, polygon, optimism, arbitrum } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) throw new Error("Missing NEXT_PUBLIC_WC_PROJECT_ID");

export const wagmiConfig = getDefaultConfig({
  appName: "CP Chain",
  projectId,
  chains: [mainnet, polygon, optimism, arbitrum],
  wallets: [
    {
      groupName: "Wallets",
      wallets: [
        metaMaskWallet,
        tokenPocketWallet,
        okxWallet,
        trustWallet,
        bitgetWallet,
        walletConnectWallet,
        injectedWallet,
      ],
    },
  ],
});
