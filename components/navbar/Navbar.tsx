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

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const { address, shortAddress, isConnected, chain, disconnect } = useWallet();
    console.log(address, shortAddress, isConnected, chain, disconnect)
    const next = theme === "dark" ? "light" : "dark";
    const [navOpacity, setNavOpacity] = useState(0);

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
        className="sticky top-0 z-50 w-full h-16 flex items-center px-4 backdrop-blur transition-colors duration-200"
        style={{ backgroundColor: `rgba(0,0,0,${navOpacity})` }}
    >
            <Image src="/logo.png" alt="Logo" width={150} height={50} />

            <div className="ml-8 space-x-4 flex items-center justify-end flex-grow">
                <HoverCard>
                    <HoverCardTrigger asChild>
                        <Button variant="ghost" className="ml-4 px-4 py-2 rounded cursor-pointer" >
                            <Image src="/language.png" alt="Logo" width={20} height={20} />
                        </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-40">
                        <div className="flex flex-col space-y-2 cursor-pointer hover:text-primary">English</div>
                        <div className="flex mt-4 flex-col space-y-2 cursor-pointer hover:text-primary">Chinese</div>
                    </HoverCardContent>
                </HoverCard>

                <Button
                    className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                    onClick={() => setTheme(next)}
                >
                    <Image src="/logo.svg" alt="Logo" width={30} height={30} />
                </Button>

                <ConnectButton.Custom>
                    {({ account, chain, openConnectModal, openAccountModal }) => {
                        if (account) {
                            return (
                                <Button
                                    className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                                    onClick={openAccountModal}
                                >
                                    {shortAddress}
                                </Button>
                            );
                        } else {
                            return (
                                <Button
                                    className="bg-gray-700 px-4 py-2 rounded cursor-pointer"
                                    onClick={openConnectModal}
                                >
                                    Connect Wallet
                                </Button>
                            );
                        }
                    }}
                </ConnectButton.Custom>
            </div>
    </header>
}
