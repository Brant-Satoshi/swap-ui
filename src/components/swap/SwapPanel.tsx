"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelect, Token } from "@/components/swap/TokenSelect";
import { cn } from "@/lib/utils";

const swapTokens: Token[] = [
  { symbol: "CPUSDT", name: "CP USDT", chain: "CP Chain", color: "from-emerald-400 to-teal-500" },
  { symbol: "CPUSDC", name: "CP USDC", chain: "CP Chain", color: "from-sky-400 to-indigo-500" },
  { symbol: "CP", name: "CP", chain: "CP Chain", color: "from-emerald-400 to-teal-500", icon: "/coin/cp.png" },
  { symbol: "USDT", name: "USDT", chain: "CP Chain", color: "from-emerald-400 to-teal-500", icon: "/coin/usdt.png" },
];

export default function SwapPanel() {
  const t = useTranslations("SwapUi");
  const [sellToken, setSellToken] = useState<Token>(swapTokens[0]);
  const [buyToken, setBuyToken] = useState<Token>(swapTokens[1]);
  const [sellAmount, setSellAmount] = useState("");
  const [buyAmount, setBuyAmount] = useState("");

  const handleFlip = () => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    setSellAmount(buyAmount);
    setBuyAmount(sellAmount);
  };

  const balanceLabel = useMemo(() => t("balance", { amount: 0 }), [t]);

  return (
    <div className="swap-panel-reveal relative w-full max-w-xl rounded-[36px] border border-white/10 bg-[#161616] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.6)] sm:p-8">
      <div className="pointer-events-none absolute inset-0 rounded-[36px] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.06),_transparent_50%),radial-gradient(circle_at_bottom_right,_rgba(20,184,166,0.1),_transparent_45%)]" />
      <div className="relative space-y-5">
        <div className="relative">
          <div className="flex flex-col gap-[2px]">
            <SwapField
              label={t("sell")}
              amount={sellAmount}
              onAmountChange={setSellAmount}
              token={sellToken}
              onTokenChange={setSellToken}
              balanceLabel={balanceLabel}
              muted
            />
            <SwapField
              label={t("buy")}
              amount={buyAmount}
              onAmountChange={setBuyAmount}
              token={buyToken}
              onTokenChange={setBuyToken}
              balanceLabel={balanceLabel}
            />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={handleFlip}
              aria-label={t("switchDirection")}
              className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-white/10 bg-[#1a1a1a] text-emerald-400 shadow-[0_10px_40px_rgba(0,0,0,0.35)] transition hover:-translate-y-0.5 hover:border-emerald-400/40"
            >
              <ArrowDown className="size-5" />
            </button>
          </div>
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white/90 transition hover:border-white/20"
        >
          <span>{t("slippageSetting")}</span>
          <span className="inline-flex items-center gap-2 text-white">
            {t("slippageValue")}
            <ChevronRight className="size-4 text-white/60" />
          </span>
        </button>

        <Button
          disabled
          className="h-14 w-full rounded-[24px] bg-white/10 text-base font-semibold text-white/50 hover:bg-white/10"
        >
          {t("insufficientBalance")}
        </Button>
      </div>
    </div>
  );
}

function SwapField({
  label,
  amount,
  onAmountChange,
  token,
  onTokenChange,
  balanceLabel,
  muted = false,
}: {
  label: string;
  amount: string;
  onAmountChange: (value: string) => void;
  token: Token;
  onTokenChange: (token: Token) => void;
  balanceLabel: string;
  muted?: boolean;
}) {
  return (
    <div className="relative rounded-[28px] border border-white/10 bg-[#1b1b1b] px-5 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3">
          <span className="text-sm font-semibold text-white">{label}</span>
          <Input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="0"
            className={cn(
              "mt-2 h-16 w-full min-w-0 flex-1 border-transparent bg-transparent text-3xl font-bold leading-[3.5rem] placeholder:leading-[3.5rem] placeholder-white/50 sm:placeholder:text-3xl md:text-3xl md:leading-[5rem] md:placeholder:leading-[5rem] dark:bg-transparent dark:border-transparent",
              muted && "text-white/60"
            )}
          />
          <span className="text-sm text-white/50">{balanceLabel}</span>
        </div>
        <TokenSelect
          selected={token}
          items={swapTokens}
          onSelect={onTokenChange}
          getKey={(item) => item.symbol}
          getLabel={(item) => item.symbol}
          getSublabel={(item) => item.name}
          getIcon={(item) => item.icon}
          className="min-w-[140px] rounded-full border border-white/10 bg-[#151515] px-4 py-2 text-sm text-white shadow-inner shadow-black/30"
          contentClassName="bg-[#101010] border-white/10"
        />
      </div>
    </div>
  );
}
