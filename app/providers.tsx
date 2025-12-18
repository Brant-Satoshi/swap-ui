// app/providers.tsx
"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, DisclaimerComponent, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { ThemeProvider } from "next-themes";
import { wagmiConfig } from "@/lib/wallet/config";

const queryClient = new QueryClient();

const Disclaimer: DisclaimerComponent = ({ Text, Link }) => (
  <Text>
    连接钱包即表示你同意 <Link href="/terms">Terms</Link> 并阅读 <Link href="/disclaimer">Disclaimer</Link>
  </Text>
)

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            theme={darkTheme({
              accentColor: '#00CE7A',
              accentColorForeground: 'black',
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })} 
              appInfo={{
                appName: 'CP Chain',
                disclaimer: Disclaimer,
                learnMoreUrl: 'https://your.site/learn',
          }}>
            {children}
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
