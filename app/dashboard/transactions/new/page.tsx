"use client";

import { useTransition, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, Calendar, FileText, PlusCircle, MinusCircle } from "lucide-react";
import { createTransaction, getSelectOptions } from "@/actions/transaction";

export default function NewTransactionPage() {
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

            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm font-medium">
                            {error}
                        </div>
                    )}

                    {/* Type Selector (Tabs) */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-950 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setType("EXPENSE")}
                            className={`flex justify-center items-center py-2.5 rounded-lg text-sm font-medium transition-colors ${type === "EXPENSE" ? "bg-red-500 text-white shadow-lg" : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            <MinusCircle className="h-4 w-4 mr-2" /> Pengeluaran
                        </button>
                        <button
                            type="button"
                            onClick={() => setType("INCOME")}
                            className={`flex justify-center items-center py-2.5 rounded-lg text-sm font-medium transition-colors ${type === "INCOME" ? "bg-emerald-500 text-white shadow-lg" : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            <PlusCircle className="h-4 w-4 mr-2" /> Pemasukan
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Amount */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Jumlah Uang (Rp)</label>
                            <input
                                name="amount"
                                type="text"
                                required
                                value={amount}
                                onChange={handleAmountChange}
                                placeholder="0"
                                className={`w-full bg-neutral-800/50 border rounded-xl px-4 py-4 text-2xl font-bold transition-all focus:outline-none focus:ring-2 ${type === "INCOME"
                                    ? "border-emerald-500/30 focus:ring-emerald-500 text-emerald-400"
                                    : "border-red-500/30 focus:ring-red-500 text-red-400"
                                    }`}
                            />
                        </div>

                        {loadingData ? (
                            <div className="py-4 flex justify-center"><Loader2 className="animate-spin text-emerald-500 h-6 w-6" /></div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Wallet Select */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Pilih Dompet</label>
                                    <select name="walletId" required className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none">
                                        <option value="">- Pilih Sumber -</option>
                                        {wallets.map(w => (
                                            <option key={w.id} value={w.id}>{w.name} (Saldo: Rp {Number(w.balance).toLocaleString('id-ID')})</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Category Select */}
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-1">Kategori</label>
                                    <select name="categoryId" required className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none">
                                        <option value="">- Pilih Kategori -</option>
                                        {filteredCategories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Tanggal Transaksi</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3 h-5 w-5 text-neutral-500" />
                                <input
                                    name="date"
                                    type="date"
                                    required
                                    defaultValue={new Date().toISOString().split('T')[0]} // YYYY-MM-DD
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-12 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-neutral-400 mb-1">Catatan Tambahan (Opsional)</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-3 h-5 w-5 text-neutral-500" />
                                <input
                                    name="description"
                                    type="text"
                                    defaultValue={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Mis. Makan siang di restoran A"
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-12 py-3 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-800">
                        <button
                            type="submit"
                            disabled={isPending || loadingData}
                            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center transition-all ${type === "INCOME"
                                ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950"
                                : "bg-red-500 hover:bg-red-400 text-red-950"
                                }`}
                        >
                            {isPending ? <Loader2 className="animate-spin h-5 w-5" /> : "Simpan Transaksi"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
