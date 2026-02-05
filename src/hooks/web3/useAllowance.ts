import { useAccount, useReadContract } from "wagmi";
import { erc20Abi } from "viem";

/**
 * 0x Exchange Proxy addresses by chain
 * Used for allowance checking and swap execution
 */
export const ZEROX_EXCHANGE_PROXY: Record<number, `0x${string}`> = {
  // Mainnet
  1: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  // Sepolia
  11155111: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  // Base
  8453: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  // Optimism
  10: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
  // Polygon
  137: "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
};

export function useAllowance({
  tokenAddress,
  chainId,
}: {
  tokenAddress: `0x${string}`;
  chainId: number;
}) {
  const { address } = useAccount();

  // Native ETH doesn't need allowance
  const isNativeToken =
    tokenAddress.toLowerCase() === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE".toLowerCase();

  const { data: allowance, ...rest } = useReadContract({
    address: isNativeToken ? undefined : tokenAddress,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && !isNativeToken ? [address, ZEROX_EXCHANGE_PROXY[chainId]] : undefined,
    query: {
      enabled: !isNativeToken && !!address,
    },
  });

  return {
    allowance: isNativeToken ? BigInt(0) : allowance ?? BigInt(0),
    isNativeToken,
    ...rest,
  };
}
