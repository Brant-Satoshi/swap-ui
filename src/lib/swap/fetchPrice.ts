type PriceResp = {
  price?: string;
  buyAmount?: string;
  sellAmount?: string;
  estimatedPriceImpact?: string;
  liquidityAvailable?: boolean;
};

export async function fetch0xPrice(params: {
  chainId: number;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker: string;
  signal?: AbortSignal;
}) {
  const qs = new URLSearchParams({
    chainId: String(params.chainId),
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    taker: params.taker,
  });

  const r = await fetch(`/api/0x/price?${qs.toString()}`, {
    cache: "no-store",
    signal: params.signal,
  });
  const data = await r.json();

  if (!r.ok) {
    // 0x 会返回结构化错误
    throw new Error(data?.message ?? "0x price error");
  }
  return data as PriceResp;
}
