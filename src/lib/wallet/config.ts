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

export enum ChainId {
  SEPOLIA = 11155111,
  OP_SEPOLIA = 11155420,
  CP_CHAIN = 86606,
}

export type Chain = {
  name: string;
  chainId: ChainId;
  img: string;
  rpcUrl: string;
  explorerUrl: string;
  currency: "ETH" | "CP";
  nativeTokenContract: `0x${string}`;
  usdtContract: `0x${string}`;
  cpContract: `0x${string}`;
  ethContract: `0x${string}`;
  bridgeContract: `0x${string}`;
};

export const CHAINS: Chain[]= [
  {
    name: "Sepolia TestNet",
    chainId: ChainId.SEPOLIA,
    img: "eth.svg",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/afSCtxPWD3NE5vSjJm2GQ",
    explorerUrl: "https://sepolia.etherscan.io",
    currency: "ETH",
    nativeTokenContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    usdtContract: "0xe5dE0e7f8d0c44190c8Aa512B4E999d7ec7F65F7",
    cpContract: "0x5576cA7b329F2931cDC7D14f11362d03a5760E4E",
    ethContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    bridgeContract: "0xa84593B6FC3DF802fBEa7Ed8a72EEF05Ca6f19f9",
  },
  {
    name: "Op TestNet",
    chainId: ChainId.OP_SEPOLIA,
    img: "optimism.svg",
    rpcUrl: "https://opt-sepolia.g.alchemy.com/v2/afSCtxPWD3NE5vSjJm2GQ",
    explorerUrl: "https://sepolia-optimism.etherscan.io",
    currency: "ETH",
    nativeTokenContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    usdtContract: "0x39A1eA1f9F1E55898013a494B022e52597099970",
    cpContract: "0x572977b99292d985cc39f1574Ae429b61A375813",
    ethContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    bridgeContract: "0x04557519Fb29146d29203faD03B307F1775527E0",
  },
  {
    name: "CP Chain",
    chainId: ChainId.CP_CHAIN,
    img: "cp.svg",
    rpcUrl: "https://rpc-testnet.cpchain.com",
    explorerUrl: "https://explorer-testnet.cpchain.com",
    currency: "CP",
    nativeTokenContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    usdtContract: "0x6C255b22864bBC176431c42695D16f41576e5618",
    cpContract: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    ethContract: "0x478210a1678046a0C6af45D159176e75B1BACA91",
    bridgeContract: "0x558A58D22d5fE5832A2E11Eb0f89552a8C85190f",
  },
] as const;

export type ChainConfig = (typeof CHAINS)[number];
