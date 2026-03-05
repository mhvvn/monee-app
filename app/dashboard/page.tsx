"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "@/lib/auth-client";
import { checkAndSetupUser } from "@/actions/setup";
import { getDashboardStats } from "@/actions/dashboard";
import TransactionChart from "@/components/TransactionChart";
import { Loader2, TrendingUp, TrendingDown, Wallet } from "lucide-react";

interface DashboardData {
    balance: number;
    income: number;
    expense: number;
    recentTransactions: any[];
    chartData: any[]; // Added this propertyy
}

export default function Dashboard() {
    const { data: session, isPending } = useSession();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData>({ balance: 0, income: 0, expense: 0, recentTransactions: [], chartData: [] }); // Initialized chartData

    useEffect(() => {
        if (session) {
            // 1. Setup user if first time
            checkAndSetupUser().then(() => {
                // 2. Fetch real data
                getDashboardStats().then((res) => {
                    setData(res as DashboardData);
                    setLoading(false);
                });
            });
        }
    }, [session]);

    if (isPending || loading) {
        return (
            <div className="h-full flex items-center justify-center min-h-[500px]">
                <Loader2 className="animate-spin text-emerald-500 h-8 w-8" />
            </div>
        );
    }

    // Format currency
    const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

    const stats = [
        { name: "Saldo Saat Ini", value: formatIDR(data.balance), icon: Wallet, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
        { name: "Pemasukan Bulan Ini", value: formatIDR(data.income), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
        { name: "Pengeluaran Bulan Ini", value: formatIDR(data.expense), icon: TrendingDown, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Ringkasan Keuangan</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">Pantau arus kas Anda bulan ini.</p>
                </div>
                <div className="mt-4 md:mt-0">
                    <Link href="/dashboard/transactions/new" className="bg-emerald-500 hover:bg-emerald-600 dark:hover:bg-emerald-400 text-white dark:text-neutral-950 font-bold px-4 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-500/20 inline-block">
                        + Tambah Transaksi
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className={`p-6 rounded-2xl border ${stat.border} bg-white dark:bg-neutral-900/50 backdrop-blur-sm relative overflow-hidden group hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors shadow-sm`}>
                        <div className={`absolute top-0 right-0 w-24 h-24 ${stat.bg} rounded-full -mt-8 -mr-8 blur-2xl group-hover:blur-3xl transition-all`} />
                        <div className="flex items-center space-x-4 relative z-10">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-medium">{stat.name}</p>
                                <p className="text-2xl font-bold mt-1 tracking-tight">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 min-h-[400px] shadow-sm">
                    <h3 className="font-semibold text-lg mb-4">Grafik Transaksi</h3>
                    <div className="h-full w-full bg-neutral-50 dark:bg-neutral-950/50 rounded-xl border border-neutral-100 dark:border-neutral-800/50 p-4">
                        <TransactionChart data={data.chartData} />
                    </div>
                </div>

                <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">5 Transaksi Terakhir</h3>
                        <Link href="/dashboard/transactions" className="text-sm text-emerald-400 hover:text-emerald-300">Lihat Semua</Link>
                    </div>

                    {data.recentTransactions.length === 0 ? (
                        <div className="flex items-center justify-center h-48 text-neutral-500 text-sm">
                            <p>Belum ada transaksi.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {data.recentTransactions.map((tx: any) => {
                                const isIncome = tx.type === "INCOME"; // Changed from TransactionType.INCOME
                                return (
                                    <div key={tx.id} className="flex justify-between items-center p-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/30 rounded-xl transition-colors">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.category.color }} />
                                            <div>
                                                <p className="font-medium text-sm text-neutral-900 dark:text-white">{tx.category.name}</p>
                                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                    {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-semibold text-sm ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-900 dark:text-white"}`}>
                                            {isIncome ? "+" : "-"} {formatIDR(Number(tx.amount))}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
