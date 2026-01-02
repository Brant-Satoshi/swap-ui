"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/src/components/ui/hover-card"
import { Button } from "@/src/components/ui/button";
import { useWallet } from "@/src/hooks/web3/useWallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/src/components/ui/sheet";

export default function Navbar() {
    const { address, shortAddress, isConnected, chain, disconnect } = useWallet();
    const [navOpacity, setNavOpacity] = useState(0);
    const t = useTranslations('Navbar');
    const locale = useLocale();
    const router = useRouter();

    const handleLocaleChange = (newLocale: string) => {
        if (newLocale === locale) return;
        document.cookie = `locale=${newLocale}; path=/; max-age=31536000`;
        router.refresh();
    };

    useEffect(() => {
        const handleScroll = () => {
            const progress = Math.min(0.6, window.scrollY / 250);
            setNavOpacity(progress);
        };
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return <header
        className="sticky top-0 z-50 w-full h-16 flex items-center justify-between px-4 backdrop-blur transition-colors duration-200"
        style={{ backgroundColor: `rgba(0,0,0,${navOpacity})` }}
    >
        <Image src="/logo.png" alt="Logo" width={128} height={30} />

        <div className="flex ml-8 space-x-4 items-center justify-end flex-grow">
            <HoverCard>
                <HoverCardTrigger asChild>
                    <Image className="cursor-pointer hover:text-primary" src="/language.png" alt="Logo" width={20} height={20} />
                </HoverCardTrigger>
                <HoverCardContent className="w-40">
                    <div
                        className="flex flex-col space-y-2 cursor-pointer hover:text-primary"
                        onClick={() => handleLocaleChange("en")}
                    >
                        {t('english')}
                    </div>
                    <div
                        className="flex mt-4 flex-col space-y-2 cursor-pointer hover:text-primary"
                        onClick={() => handleLocaleChange("cn")}
                    >
                        {t('chinese')}
                    </div>
                </HoverCardContent>
            </HoverCard>
            <ConnectButton.Custom>
                {({
                    account,
                    chain,
                    mounted,
                    authenticationStatus,
                    openConnectModal,
                    openAccountModal,
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
                                className="rounded-full border border-white/80 bg-transparent px-6 py-2 text-white/90"
                                disabled
                            >
                                {t("connectWallet")}
                            </Button>
                        );
                    }

                    if (!connected) {
                        return (
                            <Button
                                className="rounded-full cursor-pointer border border-white/80 bg-transparent px-6 py-2 text-white/90 hover:bg-transparent"
                                onClick={openConnectModal}
                            >
                                {t("connectWallet")}
                            </Button>
                        );
                    }

                    if (chain.unsupported) {
                        return (
                            <Button
                                className="rounded-full cursor-pointer border border-white/80 bg-transparent px-6 py-2 text-white/90 hover:bg-transparent"
                                onClick={openChainModal}
                            >
                                {chain.name}
                            </Button>
                        );
                    }

                    return (
                        <Button
                            className="rounded-full cursor-pointer border border-white/80 bg-transparent px-6 py-2 text-white/90 hover:bg-transparent"
                            onClick={() => openAccountModal?.()}
                        >
                            {shortAddress || account.displayName}
                        </Button>
                    );
                }}
            </ConnectButton.Custom>
        </div>
    </header>
}
