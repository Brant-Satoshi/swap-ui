import SwapCard from "@/components/swap/SwapCard";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations('SwapPage');
  return (
    <main className="relative flex min-h-screen w-full justify-center from-slate-50 via-white to-indigo-50 px-4 py-12">
      <div className="relative flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{t('title')}</h1>

        <section className="w-full max-w-xl">
          <SwapCard />
        </section>
      </div>
    </main>
  );
}
