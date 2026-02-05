// app/hooks/useWallet.ts
"use client";
import { useAccount, useChainId, useChains, useDisconnect } from "wagmi";

export function useWallet() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const chain = chains.find((item) => item.id === chainId);
  const { disconnect } = useDisconnect();

  const shortAddress =
    address && address.length > 10
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  return { address, shortAddress, isConnected, chain, disconnect };
}
