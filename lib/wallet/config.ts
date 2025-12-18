import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import {
  bitgetWallet,
  injectedWallet,
  metaMaskWallet,
  okxWallet,
  tokenPocketWallet,
  trustWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { arbitrum, mainnet, optimism, polygon } from "wagmi/chains";

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID;
if (!projectId) throw new Error("Missing NEXT_PUBLIC_WC_PROJECT_ID");

export const wagmiConfig = getDefaultConfig({
  appName: "CP Chain",
  projectId,
  chains: [mainnet, polygon, optimism, arbitrum],
  ssr: true,
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
