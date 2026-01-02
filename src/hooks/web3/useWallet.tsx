// app/hooks/useWallet.ts
"use client";
import { useConnection, useDisconnect } from "wagmi";

export function useWallet() {
  const { address, isConnected, chain } = useConnection();
  const { mutate: disconnect } = useDisconnect();

  const shortAddress =
    address && address.length > 10
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  return { address, shortAddress, isConnected, chain, disconnect };
}