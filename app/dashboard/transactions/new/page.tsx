"use client";

import { useTransition, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, Calendar, FileText, PlusCircle, MinusCircle } from "lucide-react";
import { createTransaction, getSelectOptions } from "@/actions/transaction";

function TransactionForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialType = searchParams.get("type")?.toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE";
    const initialAmount = searchParams.get("amount") || "";
    const initialDesc = searchParams.get("desc") || "";

    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const [wallets, setWallets] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [type, setType] = useState(initialType);
    const [amount, setAmount] = useState(initialAmount ? Number(initialAmount).toLocaleString('id-ID') : "");
    const [description, setDescription] = useState(initialDesc);

    useEffect(() => {
        async function loadOptions() {
            const res = await getSelectOptions();
            setWallets(res.wallets);
            setCategories(res.categories);
            setLoadingData(false);
        }
        loadOptions();
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        formData.set("type", type);

        // Default today date if missing
        if (!formData.get("date")) {
            formData.set("date", new Date().toISOString());
        }

        startTransition(async () => {
            const res = await createTransaction(formData);
            if (!res.success) {
                setError(res.error || "Gagal menyimpan transaksi.");
            } else {
                router.push("/dashboard/transactions");
                router.refresh();
            }
        });
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Format only numbers, no decimals for simple IDR format
        const val = e.target.value.replace(/\D/g, "");
        if (val) {
            setAmount(Number(val).toLocaleString('id-ID'));
        } else {
            setAmount("");
        }
    };

    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <form onSubmit={handleSubmit} className="bg-neutral-900/50 backdrop-blur-xl border border-neutral-800 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group">
            {/* Soft background reflections */}
            <div className={`absolute top-[-20%] right-[-10%] w-[50%] h-[50%] blur-[100px] rounded-full pointer-events-none transition-all duration-1000 ${type === "INCOME" ? "bg-emerald-500/10" : "bg-red-500/10"}`} />

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl mb-6 text-sm flex items-center shadow-inner relative z-10 transition-all">
                    <div className="w-1.5 h-full absolute left-0 top-0 bg-red-500 rounded-l-xl" />
                    {error}
                </div>
            )}

            <div className="space-y-8 relative z-10">

                {/* 1. Transaction Type Toggle */}
                <div className="flex p-1 bg-neutral-950/50 rounded-2xl border border-neutral-800 shadow-inner">
                    <button
                        type="button"
                        onClick={() => setType("EXPENSE")}
                        className={`flex-1 flex justify-center items-center py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${type === "EXPENSE"
                            ? "bg-red-500/20 text-red-400 shadow-[0_0_20px_rgba(239,68,68,0.2)] border border-red-500/30 scale-[1.02]"
                            : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                            }`}
                    >
                        <MinusCircle className={`mr-2 h-4 w-4 ${type === "EXPENSE" ? "animate-pulse" : ""}`} /> Pengeluaran
                    </button>
                    <button
                        type="button"
                        onClick={() => setType("INCOME")}
                        className={`flex-1 flex justify-center items-center py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${type === "INCOME"
                            ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)] border border-emerald-500/30 scale-[1.02]"
                            : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800/50"
                            }`}
                    >
                        <PlusCircle className={`mr-2 h-4 w-4 ${type === "INCOME" ? "animate-pulse" : ""}`} /> Pemasukan
                    </button>
                </div>

                {/* 2. Amount Input (Large Centered) */}
                <div className="text-center pb-6 border-b border-neutral-800/50">
                    <p className="text-sm text-neutral-500 font-medium mb-2 uppercase tracking-widest">Nominal Transaksi</p>
                    <div className="flex items-center justify-center text-4xl md:text-5xl font-bold font-mono">
                        <span className={`mr-2 ${type === "INCOME" ? "text-emerald-500" : "text-red-500"}`}>Rp</span>
                        <input
                            type="text"
                            name="amount"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0"
                            autoComplete="off"
                            className="bg-transparent border-none text-white focus:ring-0 focus:outline-none w-full max-w-[300px] text-center placeholder-neutral-700 transition-all focus:scale-105"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">

                    {/* Left Column */}
                    <div className="space-y-6">
                        <div className="group/input">
                            <label className="block text-sm font-medium text-neutral-400 mb-2 group-focus-within/input:text-emerald-400 transition-colors">
                                Pilih Dompet / Rekening
                            </label>
                            <div className="relative">
                                <WalletIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-5 w-5 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors" />
                                <select
                                    name="walletId"
                                    required
                                    disabled={loadingData}
                                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-11 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50 appearance-none shadow-inner"
                                >
                                    <option value="" disabled selected hidden>Pilih sumber dana...</option>
                                    {wallets.map(w => (
                                        <option key={w.id} value={w.id}>
                                            {w.name} (Saldo: Rp {Number(w.balance).toLocaleString('id-ID')})
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                    ▼
                                </div>
                            </div>
                        </div>

                        <div className="group/input">
                            <label className="block text-sm font-medium text-neutral-400 mb-2 group-focus-within/input:text-emerald-400 transition-colors">
                                Kategori
                            </label>
                            <div className="relative">
                                <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-5 w-5 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors" />
                                <select
                                    name="categoryId"
                                    required
                                    disabled={loadingData}
                                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-11 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all disabled:opacity-50 appearance-none shadow-inner"
                                >
                                    <option value="" disabled selected hidden>Pilih kategori...</option>
                                    {filteredCategories.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.icon} {c.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-500">
                                    ▼
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        <div className="group/input">
                            <label className="block text-sm font-medium text-neutral-400 mb-2 group-focus-within/input:text-emerald-400 transition-colors">
                                Tanggal Transaksi
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 h-5 w-5 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors" />
                                <input
                                    type="date"
                                    name="date"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]}
                                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl px-11 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all shadow-inner [color-scheme:dark]"
                                />
                            </div>
                        </div>

                        <div className="group/input">
                            <label className="block text-sm font-medium text-neutral-400 mb-2 group-focus-within/input:text-emerald-400 transition-colors">
                                Catatan Tambahan (Opsional)
                            </label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-4 text-neutral-500 h-5 w-5 pointer-events-none group-focus-within/input:text-emerald-500 transition-colors" />
                                <textarea
                                    name="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Contoh: Beli makan siang, Bayar listrik..."
                                    rows={3}
                                    className="w-full bg-neutral-950/80 border border-neutral-800 rounded-xl pl-11 pr-4 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none shadow-inner"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8">
                    <button
                        type="submit"
                        disabled={isPending || loadingData}
                        className={`w-full flex items-center justify-center py-4 px-4 rounded-xl text-neutral-950 font-bold transition-all shadow-lg text-lg ${type === 'INCOME'
                            ? 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'
                            : 'bg-red-500 hover:bg-red-400 shadow-red-500/20 text-white'
                            } disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 active:translate-y-0`}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Menyimpan Data...
                            </>
                        ) : (
                            "Simpan Transaksi"
                        )}
                    </button>
                </div>
            </div>
        </form>
    );
}

// Icon helpers to prevent large lucide imports inline
function WalletIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></svg>
}
function TagIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42l-8.704-8.704z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></svg>
}

export default function NewTransactionPage() {
    const router = useRouter();

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 border-b border-neutral-800 pb-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold">Tambah Transaksi</h2>
                    <p className="text-sm text-neutral-400">Catat histori pengeluaran/pemasukan Anda.</p>
                </div>
            </div>

            <Suspense fallback={
                <div className="h-64 flex items-center justify-center">
                    <Loader2 className="animate-spin text-emerald-500 h-8 w-8" />
                </div>
            }>
                <TransactionForm />
            </Suspense>
        </div>
    );
}
