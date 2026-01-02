"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Token, TokenSelect, defaultTokens } from "./TokenSelect";
import { useBalance, useConnection, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { Input } from "../ui/input";
import { useTranslations } from "next-intl";
import { CHAINS, Chain } from "@/src/lib/wallet/config";
import bridgeAbi from "@/public/abi/bridgeABI.json";

const BRIDGE_SEPOLIA = "0x26FF133bAC77404Fb87BFB0ce712AFdf1F41d1BE" as const;
// decimals: number, raw: bigint

export default function SwapCard() {
  const t = useTranslations("SwapCard");
  const { address, isConnected } = useConnection();
  // const { switchChain, isPending } = useSwitchChain();
  // const { data: feeData, isLoading: feeIsLoading, error: feeError } = useReadContract({
  //   address: BRIDGE_SEPOLIA,
  //   abi: bridgeAbi,
  //   functionName: "IsSupportedChainId",
  //   // args: [11155420], // OP TestNet
  //   chainId: 11155111, // 可选：强制用哪条链读（当你多链时很有用）
  // });
  // console.log("feeIsLoading", feeIsLoading);
  // console.log("feeData", feeData);

  
  
  const [fromToken, setFromToken] = useState<Token>(defaultTokens[0]);
  const [toToken, setToToken] = useState<Token>(defaultTokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [fromChain, setFromChain] = useState<Chain>(CHAINS[0]);
  const [toChain, setToChain] = useState<Chain>(CHAINS[1]);

  const { data, isLoading, error } = useBalance({
    address: address,
    query: { enabled: isConnected && !!address },
  });
  console.log('data', data);
  const shown = data?.value ? formatUnits(data.value, data.decimals) : "0";

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

  const handleSelectFromChain = (nextChain: Chain) => {
    if (nextChain.chainId === toChain.chainId) {
      setFromChain(toChain);
      setToChain(fromChain);
      return;
    }
    setFromChain(nextChain);
  };

  const handleSelectToChain = (nextChain: Chain) => {
    if (nextChain.chainId === fromChain.chainId) {
      setFromChain(toChain);
      setToChain(fromChain);
      return;
    }
    setToChain(nextChain);
  };

  return (
    <div className="relative w-full max-w-xl overflow-hidden rounded-[32px] border border-white/5 bg-[#0c0c0c] p-6 text-white shadow-2xl text-xs sm:text-base">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.05),_transparent_40%),_radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.05),_transparent_35%)]" />
      <div className="relative space-y-4">
        <div className="flex items-center gap-3">
          <TokenSelect
            title={t("from")}
            selected={fromChain}
            items={CHAINS}
            onSelect={handleSelectFromChain}
            getKey={(chain) => chain.chainId.toString()}
            getLabel={(chain) => chain.name}
            getSublabel={() => t("from")}
            getIcon={(chain) => `/${chain.img}`}
            renderTrigger={(chain) => (
              <div className="flex flex-1 text-left">
                <ChainCard chain={chain} label={t("from")} />
              </div>
            )}
            triggerAsChild
            contentClassName="bg-[#101010] border-white/10"
          />
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full bg-white/5 text-lg transition hover:bg-white/10 cursor-pointer text-primary"
            onClick={handleSwapSides}
            aria-label={t("swapDirection")}
          >
            →
          </button>
          <TokenSelect
            title={t("to")}
            selected={toChain}
            items={CHAINS}
            onSelect={handleSelectToChain}
            getKey={(chain) => chain.chainId.toString()}
            getLabel={(chain) => chain.name}
            getIcon={(chain) => `/${chain.img}`}
            renderTrigger={(chain) => (
              <button className="flex flex-1 text-left">
                <ChainCard chain={chain} label={t("to")} />
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
              className="h-16 w-full min-w-0 flex-1 bg-transparent text-3xl font-bold leading-[3.5rem] placeholder:text-base placeholder:leading-[3.5rem] placeholder-white/50 sm:placeholder:text-3xl md:text-3xl md:leading-[5rem] md:placeholder:leading-[5rem]"
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
              <div className="flex flex-col leading-tightitems-center gap-2 text-xs sm:text-sm"> 
                <Image src={`${fromToken.icon}`} alt={fromToken.symbol} width={32} height={32} className="inline-block rounded-full" />
                <div>1 {fromToken.symbol} ≈ {impliedRate} {toToken.symbol}</div>
              </div>
            <div className="flex flex-1 items-center justify-between text-xs text-white/60">
              <span className="inline-flex items-center gap-1">
                {t("fee")} <Spinner />
              </span>
              <span>{t("eta")}</span>
            </div>
          </div>
        </div>

        <Button
          className="h-14 w-full rounded-[20px] bg-emerald-500 text-xs font-semibold text-black hover:bg-emerald-400 sm:text-base"
          disabled
        >
          {t("enterValidAmount")}
        </Button>
      </div>
    </div>
  );
}

function ChainCard({ chain, label }: { chain: Chain, label: string }) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2">
      <Image src={`/${chain.img}`} alt={chain.name} width={32} height={32} className="rounded-full" />
      <div className="flex flex-col leading-tight">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs font-semibold text-white sm:text-sm">{chain.name}</span>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin items-center justify-center rounded-full border-[2px] border-white/30 border-t-transparent" />
  );
}
