import BridgeCard from "@/components/swap/BridgeCard";
import TypingTitle from "@/components/swap/TypingTitle";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('SwapPage');
  return (
    <main className="relative flex min-h-screen w-full justify-center from-slate-50 via-white to-indigo-50 px-4 py-12">
      <div className="relative flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <TypingTitle
          text={t("title")}
          className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl"
        />
        <section className="w-full max-w-xl">
          <BridgeCard />
        </section>
      </div>
    </main>
  );
}
