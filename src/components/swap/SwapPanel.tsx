"use client";

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { ArrowDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TokenSelect } from "@/components/swap/TokenSelect";
import { cn } from "@/lib/utils";
import { useAccount, useBalance, useChainId } from "wagmi";
import { formatUnits, parseUnits, maxUint256 } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { swapTokens, type SwapToken } from "@/lib/swap/tokens";
import { fetch0xPrice } from "@/lib/swap/fetchPrice";
import { useAllowance, ZEROX_EXCHANGE_PROXY } from "@/hooks/web3/useAllowance";
import { useApprove, useSwap } from "@/lib/swap/executeSwap";


type QuoteStatus =
  | "idle"
  | "loading"
  | "no_liquidity"
  | "error"
  | "success";

type QuoteError = {
  code: string;
  message: string;
  raw?: unknown;
};

type UseSwapQuoteParams = {
  sellAmount: string;
  sellToken: SwapToken;
  buyToken: SwapToken;
  chainId: number;
  address: `0x${string}` | undefined;
  t: (key: string) => string;
};

type QuoteState = {
  buyAmount: string;
  status: QuoteStatus;
  error: QuoteError | null;
  priceValue: string | null;
  priceImpact: string | null;
};

const initialQuoteState: QuoteState = {
  buyAmount: "",
  status: "idle",
  error: null,
  priceValue: null,
  priceImpact: null,
};

function useSwapQuote({ sellAmount, sellToken, buyToken, chainId, address, t }: UseSwapQuoteParams) {
  const [quote, setQuote] = useState<QuoteState>(initialQuoteState);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!address) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const timeoutId = window.setTimeout(async () => {
      if (!sellAmount || Number.isNaN(Number(sellAmount))) {
        setQuote(initialQuoteState);
        return;
      }

      try {
        setQuote((prev) => ({ ...prev, status: "loading", error: null }));
        const sellAmountBase = parseUnits(sellAmount, sellToken.decimals).toString();
        const price = await fetch0xPrice({
          chainId,
          sellToken: sellToken.address,
          buyToken: buyToken.address,
          sellAmount: sellAmountBase,
          taker: address,
          signal: controller.signal,
        });

        if (price.liquidityAvailable === false) {
          setQuote({
            buyAmount: "",
            status: "no_liquidity",
            error: { code: "NO_LIQUIDITY", message: t("quoteNoLiquidity"), raw: price },
            priceValue: null,
            priceImpact: null,
          });
          return;
        }

        setQuote({
          buyAmount: price.buyAmount ? formatUnits(BigInt(price.buyAmount), buyToken.decimals) : "",
          status: "success",
          error: null,
          priceValue: price.price ?? null,
          priceImpact: price.estimatedPriceImpact ?? null,
        });
      } catch (err) {
        setQuote({
          buyAmount: "",
          status: "error",
          error: normalizeQuoteError(err, t),
          priceValue: null,
          priceImpact: null,
        });
      }
    }, 300);

    return () => window.clearTimeout(timeoutId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, buyToken, chainId, sellAmount, sellToken]);

  const setBuyAmount = useCallback((value: string) => setQuote((prev) => ({ ...prev, buyAmount: value })), []);

  return {
    buyAmount: quote.buyAmount,
    setBuyAmount,
    quoteStatus: quote.status,
    quoteError: quote.error,
    priceValue: quote.priceValue,
    priceImpact: quote.priceImpact,
  };
}

function normalizeQuoteError(err: unknown, t: (key: string) => string): QuoteError {
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    if (msg.includes("liquidity")) {
      return { code: "NO_LIQUIDITY", message: t("quoteNoLiquidity"), raw: err };
    }
    if (msg.includes("rate") && msg.includes("limit")) {
      return { code: "RATE_LIMIT", message: t("quoteRateLimit"), raw: err };
    }
    if (msg.includes("network")) {
      return { code: "NETWORK", message: t("quoteNetworkError"), raw: err };
    }
    if (msg.includes("pair") || msg.includes("token")) {
      return { code: "INVALID_PAIR", message: t("quoteInvalidPair"), raw: err };
    }
    return { code: "UNKNOWN", message: t("quoteError"), raw: err };
  }
  return { code: "UNKNOWN", message: t("quoteError"), raw: err };
}


export default function SwapPanel() {
  const t = useTranslations("SwapUi");
  const [sellToken, setSellToken] = useState<SwapToken>(swapTokens[0]);
  const [buyToken, setBuyToken] = useState<SwapToken>(swapTokens[1]);
  const [sellAmount, setSellAmount] = useState("");

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { data: balanceData } = useBalance({
    address,
    chainId,
    query: { enabled: isConnected && !!address },
  });

  const balanceDisplay = useMemo(() => {
    if (!balanceData?.value) return "0.00";
    return formatUnits(balanceData.value, balanceData.decimals ?? 18);
  }, [balanceData]);

  const sellAmountBigInt = useMemo(() => {
    if (!sellAmount || Number.isNaN(Number(sellAmount))) return BigInt(0);
    try {
      return parseUnits(sellAmount, sellToken.decimals);
    } catch {
      return BigInt(0);
    }
  }, [sellAmount, sellToken.decimals]);

  // Check allowance for sell token
  const { allowance, isNativeToken } = useAllowance({
    tokenAddress: sellToken.address,
    chainId,
  });

  const needsApproval = useMemo(() => {
    if (isNativeToken) return false;
    if (!sellAmountBigInt || sellAmountBigInt <= BigInt(0)) return false;
    return allowance < sellAmountBigInt;
  }, [isNativeToken, allowance, sellAmountBigInt]);

  const { approve, isApproving, isApproveSuccess } = useApprove();
  const { swap, isSwapping, isSwapSuccess, swapHash, swapError } = useSwap();

  const {
    buyAmount,
    setBuyAmount,
    quoteStatus,
    quoteError,
    priceValue,
    priceImpact,
  } = useSwapQuote({
    sellAmount,
    sellToken,
    buyToken,
    chainId,
    address,
    t,
  });

  const handleFlip = useCallback(() => {
    setSellToken(buyToken);
    setBuyToken(sellToken);
    setSellAmount(buyAmount);
    setBuyAmount(sellAmount);
  }, [buyToken, sellToken, buyAmount, sellAmount, setSellToken, setBuyToken, setSellAmount]);

  const handleAction = useCallback(() => {
    if (needsApproval) {
      approve({
        tokenAddress: sellToken.address,
        spender: ZEROX_EXCHANGE_PROXY[chainId] || "0xdef1c0ded9bec7f1a1670819833240f027b25eff",
        amount: maxUint256,
      });
    } else {
      // For now, just show a message that swap execution is coming
      console.log("Swap would be executed here");
    }
  }, [needsApproval, approve, sellToken.address, chainId]);

  // Reset buy amount when sell token changes
  useEffect(() => {
    setBuyAmount("");
  }, [sellToken, setBuyAmount]);

  // Get button text based on state
  const getButtonText = () => {
    if (isApproving) return t("approving");
    if (isSwapping) return t("swapping");
    if (needsApproval) return t("approve");
    if (quoteStatus === "loading") return t("quoteLoading");
    if (quoteStatus === "error" || quoteStatus === "no_liquidity") return quoteError?.message ?? t("quoteError");
    if (!sellAmount || Number(sellAmount) <= 0) return t("enterAmount");
    if (balanceData && parseUnits(sellAmount, sellToken.decimals) > balanceData.value) return t("insufficientBalance");
    return t("swap");
  };

  const isActionDisabled = () => {
    if (isApproving || isSwapping) return true;
    if (!sellAmount || Number(sellAmount) <= 0) return true;
    if (quoteStatus === "loading" || quoteStatus === "error" || quoteStatus === "no_liquidity") return true;
    if (balanceData && parseUnits(sellAmount, sellToken.decimals) > balanceData.value) return true;
    return false;
  };

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
              balance={balanceDisplay}
              muted
              showMax={isConnected && !!balanceDisplay}
              onMax={() => setSellAmount(balanceDisplay)}
            />
            <SwapField
              label={t("buy")}
              amount={buyAmount}
              onAmountChange={setBuyAmount}
              token={buyToken}
              onTokenChange={setBuyToken}
              balance={"0.00"}
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

        {/* <button
          type="button"
          className="flex w-full items-center justify-between rounded-[22px] border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold text-white/90 transition hover:border-white/20"
        >
          <span>{t("slippageSetting")}</span>
          <span className="inline-flex items-center gap-2 text-white">
            {t("slippageValue")}
            <ChevronRight className="size-4 text-white/60" />
          </span>
        </button> */}

        <div className="text-sm text-white/70">
          {renderQuoteStatus(quoteStatus, quoteError, priceValue, priceImpact, t)}
        </div>

        <ConnectButton.Custom>
          {({
            account,
            chain,
            mounted,
            authenticationStatus,
            openConnectModal,
            openChainModal
          }) => {
            const ready = mounted && authenticationStatus !== "loading";
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus || authenticationStatus === "authenticated");

            if (!ready) {
              return (
                <Button
                  className="h-14 w-full rounded-[24px] text-base font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  {t("connectWallet")}
                </Button>
              );
            }

            if (!connected) {
              return (
                <Button
                  className="h-14 w-full rounded-[24px] bg-primary text-base font-semibold text-white/100"
                  onClick={openConnectModal}
                >
                  {t("connectWallet")}
                </Button>
              );
            }

            if (chain.unsupported) {
              return (
                <Button
                  className="h-14 w-full rounded-[24px] bg-white/10 text-base font-semibold text-white/50 hover:bg-white/10"
                  onClick={openChainModal}
                >
                  {chain.name}
                </Button>
              );
            }

            // Determine button state
            const isLoading = isApproving || isSwapping || quoteStatus === "loading";
            const isError = quoteStatus === "error" || quoteStatus === "no_liquidity";
            const hasAmount = sellAmount && Number(sellAmount) > 0;
            const hasBalance = balanceData && parseUnits(sellAmount, sellToken.decimals) <= balanceData.value;
            const disabled = isLoading || isError || !hasAmount || !hasBalance;

            return (
              <Button
                disabled={disabled}
                onClick={handleAction}
                className="h-14 w-full rounded-[24px] bg-white/10 text-base font-semibold text-white/50 hover:bg-white/10 disabled:cursor-not-allowed"
              >
                {isApproving && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("approving")}
                  </>
                )}
                {isSwapping && (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("swapping")}
                  </>
                )}
                {!isApproving && !isSwapping && isError && (
                  quoteError?.message ?? t("quoteError")
                )}
                {!isApproving && !isSwapping && !isError && !hasAmount && (
                  t("enterAmount")
                )}
                {!isApproving && !isSwapping && !isError && hasAmount && !hasBalance && (
                  t("insufficientBalance")
                )}
                {!isApproving && !isSwapping && !isError && hasAmount && hasBalance && needsApproval && (
                  t("approve")
                )}
                {!isApproving && !isSwapping && !isError && hasAmount && hasBalance && !needsApproval && (
                  t("swap")
                )}
              </Button>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </div>
  );
}

function renderQuoteStatus(
  status: QuoteStatus,
  error: QuoteError | null,
  priceValue: string | null,
  priceImpact: string | null,
  t: (key: string, values?: Record<string, string>) => string
) {
  if (status === "loading") return <span>{t("quoteLoading")}</span>;
  if (status === "error" || status === "no_liquidity") {
    return <span className="text-rose-300">{error?.message ?? t("quoteError")}</span>;
  }
  if (status === "success" && priceValue) {
    return (
      <span>
        {t("priceLabel", { price: priceValue })}
        {priceImpact ? <span className="ml-2 text-white/50">{t("impactLabel", { impact: priceImpact })}</span> : null}
      </span>
    );
  }
  return <span>{t("quoteHint")}</span>;
}

function SwapField({
  label,
  amount,
  onAmountChange,
  token,
  onTokenChange,
  balance,
  muted = false,
  showMax = false,
  onMax,
}: {
  label: string;
  amount: string;
  onAmountChange: (value: string) => void;
  token: SwapToken;
  onTokenChange: (token: SwapToken) => void;
  balance: string;
  muted?: boolean;
  showMax?: boolean;
  onMax?: () => void;
}) {
  const t = useTranslations("SwapUi");

  return (
    <div className="relative rounded-[28px] border border-white/10 bg-[#1b1b1b] px-5 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">{label}</span>
            {showMax && onMax ? (
              <button
                type="button"
                onClick={onMax}
                className="text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Max
              </button>
            ) : null}
          </div>
          <Input
            value={amount}
            onChange={(event) => onAmountChange(event.target.value)}
            placeholder="0"
            className={cn(
              "mt-2 h-16 w-full min-w-0 flex-1 border-transparent bg-transparent text-3xl font-bold leading-[3.5rem] placeholder:leading-[3.5rem] placeholder-white/50 sm:placeholder:text-3xl md:text-3xl md:leading-[5rem] md:placeholder:leading-[5rem] dark:bg-transparent dark:border-transparent",
              muted && "text-white/60"
            )}
          />
          <span className="text-sm text-white/50">{t("balance")} {balance}</span>
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
