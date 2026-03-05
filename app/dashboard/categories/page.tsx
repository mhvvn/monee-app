import React from "react";
import { Tags, Construction } from "lucide-react";

export default function CategoriesPage() {
    return (
        <div className="space-y-6 max-w-4xl mx-auto px-4 py-8 h-full flex flex-col items-center justify-center min-h-[60vh]">
            <div className="bg-white dark:bg-neutral-900/50 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden group w-full max-w-2xl">
                {/* Glow effects */}
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[80px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-purple-500/20" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-500/10 blur-[80px] rounded-full pointer-events-none transition-all duration-700 group-hover:bg-pink-500/20" />

                <div className="relative z-10 flex flex-col items-center">
                    <div className="relative mb-8">
                        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 blur-xl opacity-20 rounded-full animate-pulse" />
                        <div className="bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-6 rounded-full relative z-10 shadow-inner">
                            <Tags className="h-16 w-16 text-neutral-400 animate-pulse" />
                            <Construction className="h-8 w-8 text-amber-500 absolute bottom-0 right-0 transform translate-x-2 translate-y-2 drop-shadow-md animate-[spin_5s_linear_infinite]" />
                        </div>
                    </div>

                    <h2 className="text-3xl font-bold bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent mb-4">
                        Kustomisasi Kategori Segera Hadir
                    </h2>

                    <p className="text-neutral-500 dark:text-neutral-400 text-lg leading-relaxed max-w-md mx-auto mb-8">
                        Modul untuk menambah, menghapus, atau mengubah warna dan ikon kategori pemasukan/pengeluaran mandiri akan segera tersedia!
                    </p>

                    <div className="inline-flex items-center space-x-2 bg-neutral-100 dark:bg-neutral-950/80 px-4 py-2 rounded-full border border-neutral-200 dark:border-neutral-800/60 text-sm text-neutral-600 dark:text-neutral-500 shadow-inner">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                        </span>
                        <span>Tetap pantau pembaruan kami</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
