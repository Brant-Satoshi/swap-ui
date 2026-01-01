"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Token, TokenSelect, defaultTokens } from "./TokenSelect";
import { useBalance, useConnection, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Input } from "../ui/input";
import { useTranslations } from "next-intl";
import bridgeAbi from "@/public/abi/bridgeABI.json";

const BRIDGE_SEPOLIA = "0x26FF133bAC77404Fb87BFB0ce712AFdf1F41d1BE" as const;
// decimals: number, raw: bigint

type Chain = {
  id: number;
  key: string;
  name: string;
  label: string;
};

export default function SwapCard() {
  const t = useTranslations("SwapCard");
  const { address, isConnected } = useConnection();
  // const chains = useChains();
  // console.log('chains', chains);
  // const { switchChain, isPending } = useSwitchChain();

  const chains: Chain[] = [
    { id: 11155111, key: "sep", name: t("sepoliaTestnet"), label: t("to") },
    { id: 11155420, key: "op", name: t("opTestnet"), label: t("from") },
  ];

  // const { data: feeData, isLoading: feeIsLoading, error: feeError } = useReadContract({
  //   address: BRIDGE_SEPOLIA,
  //   abi: bridgeAbi,
  //   functionName: "IsSupportedChainId",
  //   // args: [11155420], // OP TestNet
  //   chainId: 11155111, // 可选：强制用哪条链读（当你多链时很有用）
  // });
  // console.log("feeIsLoading", feeIsLoading);
  // console.log("feeData", feeData);

  const { data, isLoading, error } = useBalance({
    address,
    query: { enabled: isConnected && !!address },
  });
  const shown = data?.value ? formatUnits(data.value, data.decimals) : "0";
  const [fromToken, setFromToken] = useState<Token>(defaultTokens[0]);
  const [toToken, setToToken] = useState<Token>(defaultTokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [fromChain, setFromChain] = useState<Chain>(chains[0]);
  const [toChain, setToChain] = useState<Chain>(chains[1]);

  const impliedRate = useMemo(() => {
    if (!fromAmount) return "1.0000";
    const numeric = Number(fromAmount);
    if (Number.isNaN(numeric) || numeric === 0) return "1.0000";
    return (numeric * 1).toFixed(4);
  }, [fromAmount]);

  const handleSwapSides = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromChain(toChain);
    setToChain(fromChain);
  };

  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/5 bg-[#0c0c0c] p-6 text-white shadow-2xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.05),_transparent_40%),_radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.05),_transparent_35%)]" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <TokenSelect
            title={t("from")}
            selected={fromChain}
            items={chains}
            onSelect={setFromChain}
            getKey={(chain) => chain.key}
            getLabel={(chain) => chain.name}
            getSublabel={t("from")}
            getAvatarText={(chain) => chain.key.toUpperCase()}
            renderTrigger={(chain) => (
              <button type="button" className="flex flex-1 text-left">
                <ChainCard chain={chain} />
              </button>
            )}
            triggerAsChild
            contentClassName="bg-[#101010] border-white/10"
          />
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-white/10"
            onClick={handleSwapSides}
            aria-label={t("swapDirection")}
          >
            →
          </button>
          <TokenSelect
            title={t("to")}
            selected={toChain}
            items={chains}
            onSelect={setToChain}
            getKey={(chain) => chain.key}
            getLabel={(chain) => chain.name}
            getAvatarText={(chain) => chain.key.toUpperCase()}
            renderTrigger={(chain) => (
              <button type="button" className="flex flex-1 text-left">
                <ChainCard chain={chain} />
              </button>
            )}
            triggerAsChild
            contentClassName="bg-[#101010] border-white/10"
          />
        </div>

        <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <Input
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              placeholder={t("amountPlaceholder", { amount: 0.01 })}
              className="h-16 w-full min-w-0 flex-1 bg-transparent text-3xl font-bold leading-[3.5rem] placeholder:leading-[3.5rem] placeholder-white/50 md:text-3xl md:leading-[5rem] md:placeholder:leading-[5rem]"
            />
            <div className="flex items-center gap-3">
              <TokenSelect
                selected={fromToken}
                items={defaultTokens}
                onSelect={setFromToken}
                getKey={(token) => token.symbol}
                getLabel={(token) => token.symbol}
                getIcon={(token) => token.icon}
                title={t("selectToken")}
                searchPlaceholder={t("searchToken")}
                className="w-full sm:w-auto min-w-0 sm:min-w-[140px] rounded-[18px] border border-white/15 bg-white/10 px-4 py-2 text-white"
                contentClassName="bg-[#101010] border-white/10"
              />
            </div>
          </div>
          {
            isConnected && (
              <div className="flex justify-end text-xs text-white/60">
                {t("available")} <span className="ml-1 font-semibold text-white">{shown} {fromToken.symbol}</span>
              </div>
            )
          }
        </div>

        <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/40 p-4">
          <div className="flex items-center gap-3">
            <TokenSelect
              selected={toToken}
              items={defaultTokens}
              onSelect={setToToken}
              getKey={(token) => token.symbol}
              getLabel={(token) => token.symbol}
              getIcon={(token) => token.icon}
              title={t("selectToken")}
              searchPlaceholder={t("searchToken")}
              className="min-w-[140px] rounded-[18px] border-white/15 bg-white/10 px-4 py-2 text-white"
              contentClassName="bg-[#101010] border-white/10"
            />
            <div className="flex flex-1 items-center justify-between text-xs text-white/60">
              <span className="inline-flex items-center gap-1">
                {t("fee")} <Spinner />
              </span>
              <span>{t("eta")}</span>
            </div>
          </div>
        </div>

        <Button
          className="h-14 w-full rounded-[20px] bg-emerald-500 text-base font-semibold text-black hover:bg-emerald-400"
          disabled
        >
          {t("enterValidAmount")}
        </Button>
      </div>
    </div>
  );
}

function ChainCard({ chain }: { chain: Chain }) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <span
        className="inline-flex size-11 items-center justify-center rounded-full text-lg font-black text-white shadow-inner shadow-black/30 bg-gradient-to-br"
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

function Spinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin items-center justify-center rounded-full border-[2px] border-white/30 border-t-transparent" />
  );
}
