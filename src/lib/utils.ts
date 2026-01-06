import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { QueryClient } from "@tanstack/react-query";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Web3 常见：宁可短一点，也别无限长
      staleTime: 10_000,        // 10s 内认为新鲜
      gcTime: 10 * 60_000,      // 10 分钟缓存回收
      refetchOnWindowFocus: false, // 你也可以按需打开
      retry: 1,                 // RPC 偶发失败，重试一次够了
    },
  },
});