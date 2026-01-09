import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { QueryClient } from "@tanstack/react-query";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { formatUnits } from 'viem'

export const roundTo2 = (value: bigint, decimals: number) => {
  const s = formatUnits(value, decimals) // string
  const [i, f = ''] = s.split('.')
  const d0 = f[0] ?? '0'
  const d1 = f[1] ?? '0'
  const d2 = f[2] ?? '0'

  let frac = d0 + d1
  const carry = d2 >= '5'

  let intPart = i
  if (carry) {
    const n = BigInt(intPart + frac) + 1n
    const s2 = n.toString().padStart(intPart.length + 2, '0')
    intPart = s2.slice(0, s2.length - 2)
    frac = s2.slice(-2)
  }

  return `${intPart}.${frac}`
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