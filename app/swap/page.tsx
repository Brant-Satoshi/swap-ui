import SwapCard from "@/components/swap/SwapCard";

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center from-slate-50 via-white to-indigo-50 px-4 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_35%),_radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.06),_transparent_30%)]" />
      <div className="relative flex w-full max-w-3xl flex-col items-center gap-10 text-center">
        <section className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Swap</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">Cross-chain anytime, anywhere, with ease.</h1>
          <p className="max-w-xl text-base text-muted-foreground">
            A clean, Uniswap-inspired experience to move your assets with confidence. Pick tokens, preview rates, and swap in a few clicks.
          </p>
          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/5">Best price routing</span>
            <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/5">Low slippage</span>
            <span className="rounded-full bg-black/5 px-3 py-1 dark:bg-white/5">Multi-chain</span>
          </div>
        </section>

        <section className="w-full max-w-xl">
          <SwapCard />
        </section>
      </div>
    </main>
  );
}
