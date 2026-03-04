"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { User, Bell, Menu, LogOut } from "lucide-react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useMobileSidebar } from "./MobileSidebarContext";
import CoinIcon from "@/components/CoinIcon";

export default function Navbar() {
    const { data: session } = useSession();
    const { isOpen, setIsOpen } = useMobileSidebar();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 md:justify-end md:px-8 backdrop-blur-md">

            <div className="flex items-center md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-neutral-400 hover:text-white"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center ml-4 space-x-2">
                    <CoinIcon className="h-6 w-6" />
                    <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        monee
                    </h1>
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="text-neutral-400 hover:text-emerald-400 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-neutral-950" />
                </button>

                <div className="relative" ref={dropdownRef}>
                    <div
                        className="flex items-center space-x-3 cursor-pointer p-1.5 rounded-full hover:bg-neutral-800 transition-colors"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium">{session?.user.name}</p>
                            <p className="text-xs text-neutral-400">{session?.user.email}</p>
                        </div>
                        <div className="h-9 w-9 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/30">
                            {session?.user.image ? (
                                <img src={session.user.image} alt="Profile" className="h-full w-full rounded-full object-cover" />
                            ) : (
                                <User className="h-5 w-5" />
                            )}
                        </div>
                    </div>

                    {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="px-4 py-2 border-b border-neutral-800/60 md:hidden">
                                <p className="text-sm font-medium text-white truncate">{session?.user.name}</p>
                                <p className="text-xs text-neutral-400 truncate">{session?.user.email}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setIsDropdownOpen(false);
                                    signOut({ fetchOptions: { onSuccess: () => { window.location.href = "/login"; } } });
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-neutral-300 hover:text-red-400 hover:bg-red-500/10 transition-colors flex items-center mt-1"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Keluar Akun
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Menu Dropdown... (Simplified for now) */}
        </header>
    );
}
