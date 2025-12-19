"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { Input } from "@/components/ui/input"
import { Dialog,DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";

export type Token = {
  symbol: string;
  name: string;
  chain: string;
  color: string;
};

export const defaultTokens: Token[] = [
  { symbol: "ETH", name: "Ether", chain: "Ethereum", color: "from-indigo-500 to-purple-500" },
  { symbol: "USDC", name: "USD Coin", chain: "Ethereum", color: "from-sky-400 to-blue-500" },
  { symbol: "USDT", name: "Tether", chain: "Ethereum", color: "from-emerald-400 to-teal-500" },
];

type TokenSelectProps = {
  selected: Token;
  tokens?: Token[];
  onSelect: (token: Token) => void;
  align?: "start" | "center" | "end";
  className?: string;
  contentClassName?: string;
};

export function TokenSelect({
  selected,
  tokens = defaultTokens,
  onSelect,
  className,
  contentClassName,
}: TokenSelectProps) {
  const options = useMemo(() => tokens.filter((t) => t.symbol !== selected.symbol), [tokens, selected.symbol]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex min-w-[120px] items-center justify-between rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-left shadow-sm backdrop-blur transition hover:border-primary/40 dark:border-white/10 dark:bg-white/5",
            className
          )}
        >
          <TokenPill token={selected} />
        </Button>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "w-64 border border-white/10 bg-[#121212] p-3 shadow-lg backdrop-blur",
          contentClassName
        )}
      >
        <DialogTitle>Select a token</DialogTitle>
        <Input />
        <div className="space-y-2">
          {[selected, ...options].map((token) => (
            <button
              key={token.symbol}
              onClick={() => onSelect(token)}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent bg-white/5 px-3 py-2 text-left transition hover:-translate-y-[1px] hover:border-primary/30 hover:bg-white/10"
            >
              <TokenAvatar token={token} />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white">{token.symbol}</span>
                <span className="text-xs text-muted-foreground">{token.name}</span>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TokenPill({ token }: { token: Token }) {
  return (
    <div className="flex w-full items-center gap-2">
      <TokenAvatar token={token} />
      <span className="text-sm font-semibold">{token.symbol}</span>
    </div>
  );
}

function TokenAvatar({ token }: { token: Token }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full text-xs font-bold text-white shadow-inner shadow-black/20",
        "bg-gradient-to-br",
        token.color
      )}
    >
      {token.symbol.slice(0, 3).toUpperCase()}
    </span>
  );
}
