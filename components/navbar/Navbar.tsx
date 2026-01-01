"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/web3/useWallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const { address, shortAddress, isConnected, chain, disconnect } = useWallet();
    const next = theme === "dark" ? "light" : "dark";
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

        <div className="hidden md:flex ml-8 space-x-4 items-center justify-end flex-grow">
            <ul>
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <li className="inline-block mx-4 cursor-pointer hover:text-primary">{t('home')}</li>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-40">
                        <div className="flex flex-col space-y-2 cursor-pointer hover:text-primary" onClick={() => {
                            window.open("https://explorer.cpchain.com/");
                        }}>{t('mainnet')}</div>
                        <div className="flex mt-4 flex-col space-y-2 cursor-pointer hover:text-primary">{t('testnet')}</div>
                    </HoverCardContent>
                </HoverCard>
                <li className="inline-block mx-4 cursor-pointer hover:text-primary">{t('swap')}</li>
                <li className="inline-block mx-4 cursor-pointer hover:text-primary">{t('bridge')}</li>
                <li className="inline-block mx-4 cursor-pointer hover:text-primary">{t('faucet')}</li>
            </ul>
            <HoverCard>
                <HoverCardTrigger asChild>
                    <Button variant="ghost" className="ml-4 px-4 py-2 rounded cursor-pointer" >
                        <Image src="/language.png" alt="Logo" width={20} height={20} />
                    </Button>
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

            <Button
                className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                onClick={() => setTheme(next)}
            >
                <Image src="/logo.svg" alt="Logo" width={30} height={30} />
            </Button>

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
                            <Button className="bg-gray-700 px-4 py-2 rounded cursor-pointer" disabled>
                                {t("connectWallet")}
                            </Button>
                        );
                    }

                    if (!connected) {
                        return (
                            <Button
                                className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                                onClick={openConnectModal}
                            >
                                {t("connectWallet")}
                            </Button>
                        );
                    }

                    if (chain.unsupported) {
                        return (
                            <Button
                                className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                                onClick={openChainModal}
                            >
                                {chain.name}
                            </Button>
                        );
                    }

                    return (
                        <Button
                            className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                            onClick={() => openAccountModal?.()}
                        >
                            {shortAddress || account.displayName}
                        </Button>
                    );
                }}
            </ConnectButton.Custom>
        </div>
        <div className="md:hidden">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="ghost" className="text-white hover:text-primary">
                        <Image src="/menu.svg" alt="Menu" width={24} height={24} />
                    </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                        <SheetTitle>{t('menu')}</SheetTitle>
                    </SheetHeader>
                    <div className="flex flex-col space-y-4 mt-8">
                        <ul className="flex flex-col space-y-4">
                            <li>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <span className="cursor-pointer hover:text-primary">{t('home')}</span>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-40">
                                        <div className="flex flex-col space-y-2 cursor-pointer hover:text-primary" onClick={() => {
                                            window.open("https://explorer.cpchain.com/");
                                        }}>{t('mainnet')}</div>
                                        <div className="flex mt-4 flex-col space-y-2 cursor-pointer hover:text-primary">{t('testnet')}</div>
                                    </PopoverContent>
                                </Popover>
                            </li>
                            <li className="cursor-pointer hover:text-primary">{t('swap')}</li>
                            <li className="cursor-pointer hover:text-primary">{t('bridge')}</li>
                            <li className="cursor-pointer hover:text-primary">{t('faucet')}</li>
                        </ul>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="ghost" className="justify-start">
                                    <Image src="/language.png" alt="Logo" width={20} height={20} className="mr-2" />
                                    {t('language')}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-40">
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
                            </PopoverContent>
                        </Popover>
                        ...

                        <Button
                            className="bg-gray-700 px-4 py-2 rounded cursor-pointer flex justify-start"
                            onClick={() => setTheme(next)}
                        >
                            <Image src="/logo.svg" alt="Logo" width={30} height={30} className="mr-2" />
                            {theme === 'dark' ? t('lightMode') : t('darkMode')}
                        </Button>

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
                                        <Button className="bg-gray-700 px-4 py-2 rounded cursor-pointer" disabled>
                                            {t("connectWallet")}
                                        </Button>
                                    );
                                }

                                if (!connected) {
                                    return (
                                        <Button
                                            className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                                            onClick={openConnectModal}
                                        >
                                            {t("connectWallet")}
                                        </Button>
                                    );
                                }

                                if (chain.unsupported) {
                                    return (
                                        <Button
                                            className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                                            onClick={openChainModal}
                                        >
                                            {chain.name}
                                        </Button>
                                    );
                                }

                                return (
                                    <Button
                                        className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                                        onClick={() => openAccountModal?.()}
                                    >
                                        {shortAddress || account.displayName}
                                    </Button>
                                );
                            }}
                        </ConnectButton.Custom>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    </header>
}
