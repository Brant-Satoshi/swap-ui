"use client";

import Image from "next/image";
import { useTheme } from "next-themes";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useWallet } from "@/hooks/web3/useWallet";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function Navbar() {
    const { theme, setTheme } = useTheme();
    const { address, shortAddress, isConnected, chain, disconnect } = useWallet();
    console.log(address, shortAddress, isConnected, chain, disconnect)
    const next = theme === "dark" ? "light" : "dark";

    return <nav className="w-full h-16 bg-gray-800 text-white flex items-center px-4">
        <Image src="/logo.png" alt="Logo" width={200} height={50} />

        <div className="ml-8 space-x-4 flex items-center justify-end flex-grow">
            <HoverCard>
                <HoverCardTrigger asChild>
                    <Button variant="ghost" className="ml-4 px-4 py-2 rounded cursor-pointer" >
                        <Image src="/language.png" alt="Logo" width={20} height={20} />
                    </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-40">
                    <div className="flex flex-col space-y-2 cursor-pointer hover:text-primary">English</div>
                    <div className="flex mt-4 flex-col space-y-2 cursor-pointer hover:text-primary">简体中文</div>
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
                                { shortAddress}
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
    </nav>;
}