export type QuoteResponse = {
  price?: string;
  buyAmount?: string;
  sellAmount?: string;
  estimatedPriceImpact?: string;
  liquidityAvailable?: boolean;
  gas?: string;
  gasPrice?: string;
  buyTokenAddress?: string;
  sellTokenAddress?: string;
  to?: string;
  data?: string;
  value?: string;
  allowanceTarget?: string;
  decodedUniqueId?: string;
};

export async function fetch0xQuote(params: {
  chainId: number;
  sellToken: string;
  buyToken: string;
  sellAmount: string;
  taker: string;
  slippage?: number;
  signal?: AbortSignal;
}) {
  const qs = new URLSearchParams({
    chainId: String(params.chainId),
    sellToken: params.sellToken,
    buyToken: params.buyToken,
    sellAmount: params.sellAmount,
    taker: params.taker,
    slippage: String(params.slippage ?? 0.5),
  });

  const r = await fetch(`/api/0x/quote?${qs.toString()}`, {
    cache: "no-store",
    signal: params.signal,
  });
  const data = await r.json();

  if (!r.ok) {
    throw new Error(data?.message ?? "0x quote error");
  }
  return data as QuoteResponse;
}
