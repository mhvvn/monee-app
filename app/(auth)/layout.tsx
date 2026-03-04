import React from "react";
import CoinIcon from "@/components/CoinIcon";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative background gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none" />

            <div className="z-10 w-full max-w-md">
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="flex items-center justify-center space-x-3 mb-3 transform -skew-x-6 hover:scale-105 transition duration-300">
                        <CoinIcon className="h-10 w-10 drop-shadow-md" />
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            monee
                        </h1>
                    </div>
                    <p className="text-neutral-400 mt-2">
                        Kelola pengeluaran dan pemasukan Anda dengan cerdas.
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
