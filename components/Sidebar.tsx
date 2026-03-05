"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useMobileSidebar } from "./MobileSidebarContext";
import { X } from "lucide-react";
import CoinIcon from "@/components/CoinIcon";
import {
    LayoutDashboard,
    ArrowRightLeft,
    Wallet,
    Tags,
    Settings
} from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const { isOpen, setIsOpen } = useMobileSidebar();

    // Close sidebar on route change in mobile
    useEffect(() => {
        setIsOpen(false);
    }, [pathname, setIsOpen]);

    const navItems = [
        { name: "Ringkasan", href: "/dashboard", icon: LayoutDashboard },
        { name: "Transaksi", href: "/dashboard/transactions", icon: ArrowRightLeft },
        { name: "Dompet", href: "/dashboard/wallets", icon: Wallet },
        { name: "Kategori", href: "/dashboard/categories", icon: Tags },
        { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
    ];

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                className={`w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                <div className="p-6 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800/50">
                    <Link href="/dashboard" className="flex items-center space-x-2 truncate">
                        <CoinIcon className="h-8 w-8 flex-shrink-0" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent truncate">
                            monee
                        </h1>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="md:hidden p-1 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium"
                                    : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                                <span>{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

            </aside>
        </>
    );
}
