"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Token, TokenSelect, defaultTokens } from "./TokenSelect";
import { cn } from "@/lib/utils";

type Chain = {
  key: string;
  name: string;
  label: string;
  color: string;
};

const chains: Chain[] = [
  { key: "op", name: "Op TestNet", label: "From", color: "from-red-500 to-orange-500" },
  { key: "sep", name: "Sepolia TestNet", label: "To", color: "from-indigo-400 to-blue-500" },
];

export default function SwapCard() {
  const [fromToken, setFromToken] = useState<Token>(defaultTokens[0]);
  const [toToken, setToToken] = useState<Token>(defaultTokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [fromChain] = useState<Chain>(chains[0]);
  const [toChain] = useState<Chain>(chains[1]);

  const impliedRate = useMemo(() => {
    if (!fromAmount) return "1.0000";
    const numeric = Number(fromAmount);
    if (Number.isNaN(numeric) || numeric === 0) return "1.0000";
    return (numeric * 1).toFixed(4);
  }, [fromAmount]);

  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/5 bg-[#0c0c0c] p-6 text-white shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.05),_transparent_40%),_radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.05),_transparent_35%)]" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <ChainCard chain={fromChain} />
          <div className="flex size-8 items-center justify-center rounded-full bg-white/5 text-lg">→</div>
          <ChainCard chain={toChain} />
        </div>

        <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-3xl font-extrabold text-white/30 sm:text-4xl">at least 0.1</p>
            <div className="flex items-center gap-3">
              <TokenSelect
                selected={fromToken}
                onSelect={setFromToken}
                align="end"
                className="min-w-[140px] rounded-[18px] border-white/15 bg-white/10 px-4 py-2 text-white"
                contentClassName="bg-[#101010] border-white/10"
              />
            </div>
          </div>
          <div className="flex justify-end text-xs text-white/60">
            Available <span className="ml-1 font-semibold text-white">0.008000 {fromToken.symbol}</span>
          </div>
        </div>

        <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-3">
            <TokenBadge token={toToken} />
            <div className="flex flex-1 items-center justify-between text-xs text-white/60">
              <span className="inline-flex items-center gap-1">
                fee <Spinner />
              </span>
              <span>3~10 mins ⏱️</span>
            </div>
          </div>
        </div>

        <Button
          className="h-14 w-full rounded-[20px] bg-emerald-500 text-base font-semibold text-black hover:bg-emerald-400"
          disabled
        >
          Please enter valid amount
        </Button>
      </div>
    </div>
  );
}

function ChainCard({ chain }: { chain: Chain }) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <span
        className={cn(
          "inline-flex size-11 items-center justify-center rounded-full text-lg font-black text-white shadow-inner shadow-black/30",
          "bg-gradient-to-br",
          chain.color
        )}
      >
        {chain.key.toUpperCase()}
      </span>
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-white/60">{chain.label}</span>
        <span className="text-sm font-semibold text-white">{chain.name}</span>
      </div>
    </div>
  );
}

function TokenBadge({ token }: { token: Token }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "inline-flex size-12 items-center justify-center rounded-full text-lg font-black text-white shadow-inner shadow-black/30",
          "bg-gradient-to-br",
          token.color
        )}
      >
        {token.symbol.slice(0, 3).toUpperCase()}
      </span>
      <span className="text-xl font-bold">{token.symbol}</span>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin items-center justify-center rounded-full border-[2px] border-white/30 border-t-transparent" />
  );
}
