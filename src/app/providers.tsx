// app/providers.tsx
"use client";

import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { darkTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import type { Locale } from "@rainbow-me/rainbowkit";
import { ThemeProvider } from "next-themes";
import { wagmiConfig } from "@/lib/wallet/config";
import { AbstractIntlMessages, NextIntlClientProvider } from "next-intl";

const queryClient = new QueryClient();

const NoDisclaimer = () => null;

export function Providers({
  children,
  locale,
  messages
}: {
  children: React.ReactNode;
  locale: string;
  messages: AbstractIntlMessages;
}) {
  const localeMap: Record<string, Locale> = {
    zh: "zh-CN",
    "zh-HK": "zh-HK",
    en: "en-US",
    fr: "fr-FR",
  };
  const rainbowLocale: Locale = localeMap[locale] ?? "en-US";
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
            modalSize="compact"
            locale={rainbowLocale}
            theme={darkTheme({
              accentColor: '#00CE7A',
              accentColorForeground: 'black',
              borderRadius: 'medium',
              fontStack: 'system',
              overlayBlur: 'small',
            })} 
              appInfo={{
                appName: 'CP Chain',
                disclaimer: NoDisclaimer,
                learnMoreUrl: 'https://your.site/learn',
          }}>
             <NextIntlClientProvider locale={locale} messages={messages}>
               {children}
             </NextIntlClientProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ThemeProvider>
  );
}
