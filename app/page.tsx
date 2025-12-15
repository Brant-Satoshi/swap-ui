import Image from "next/image";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="p-8 space-y-4">
          <h1 className="text-2xl font-semibold">Coinbase Blue Theme</h1>

          <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
            Primary
          </button>

          <button className="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
            Secondary
          </button>
        </div>
      </main>
    </div>
  );
}
