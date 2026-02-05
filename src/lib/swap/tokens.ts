import type { Token } from "@/components/swap/TokenSelect";

export type SwapToken = Token & {
  address: `0x${string}`;
  decimals: number;
};

export const swapTokens: SwapToken[] = [
  {
    symbol: "ETH",
    name: "Ether",
    chain: "Ethereum",
    color: "from-indigo-500 to-purple-500",
    icon: "/coin/eth.png",
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    decimals: 18,
  },
  {
    symbol: "SepoliaETH",
    name: "Sepolia ETH",
    chain: "Sepolia",
    color: "from-emerald-400 to-teal-500",
    icon: "/coin/eth.png",
    address: "0xdd13E55209Fd76AfE204dBda4007C227904f0a81",
    decimals: 18,
  },
  {
    symbol: "OP",
    name: "OP",
    chain: "Sepolia",
    color: "from-sky-400 to-indigo-500",
    address: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    decimals: 18,
  },
  {
    symbol: "CP",
    name: "CP",
    chain: "CP Chain",
    color: "from-emerald-400 to-teal-500",
    icon: "/coin/cp.png",
    address: "0x0000000000000000000000000000000000000000",
    decimals: 18,
  },
  {
    symbol: "USDT",
    name: "USDT",
    chain: "CP Chain",
    color: "from-emerald-400 to-teal-500",
    icon: "/coin/usdt.png",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
  },
];
