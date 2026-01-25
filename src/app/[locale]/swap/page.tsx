import SwapPanel from "@/components/swap/SwapPanel";
import TypingTitle from "@/components/swap/TypingTitle";
import { get0xPrice } from "@/lib/wallet/get0xprice";
import { useTranslations } from "next-intl";

export default function SwapPage() {
  const t = useTranslations("SwapPage");

  return (
    <main className="relative min-h-screen w-full overflow-hidden px-4 py-12 text-white">
      <div className="pointer-events-none absolute inset-0" />
      <div className="relative mx-auto flex w-full max-w-4xl flex-col items-center gap-12">
        <div className="space-y-3 text-center">
          <TypingTitle
            text={t("swapTitle")}
            className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl"
          />
        </div>
        <section className="w-full max-w-xl">
          <SwapPanel />
        </section>
      </div>
    </main>
  );
}
