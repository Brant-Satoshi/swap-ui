import { useQuery } from "@tanstack/react-query";
import { createPublicClient, http, formatEther } from "viem";

function getClient(chainRpcUrl: string) {
  return createPublicClient({ transport: http(chainRpcUrl) });
}

export function useNativeBalance({
  chainId,
  rpcUrl,
  address,
}: {
  chainId: number;
  rpcUrl: string;
  address?: `0x${string}`;
}) {
  return useQuery({
    queryKey: ["nativeBalance", chainId, address],
    enabled: !!address,
    queryFn: async () => {
      const client = getClient(rpcUrl);
      const wei = await client.getBalance({ address: address! });
      return formatEther(wei);
    },
  });
}
