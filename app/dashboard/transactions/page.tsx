import Link from "next/link";
import { getRecentTransactions } from "@/actions/transaction";
import { Wallet, Tag, PlusCircle, ArrowUpCircle, ArrowDownCircle, Camera } from "lucide-react";
import DeleteTransactionButton from "@/components/DeleteTransactionButton";
import ExportTransactions from "@/components/ExportTransactions";

export default async function TransactionsPage() {
    const transactions = await getRecentTransactions(1000); // Increased limit for export purposes

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <div>
                    <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Riwayat Transaksi</h2>
                    <p className="text-neutral-500 dark:text-neutral-400 mt-1">Daftar semua pergerakan dana Anda.</p>
                </div>
                <div className="mt-4 md:mt-0 flex flex-wrap gap-3 items-center">
                    <ExportTransactions transactions={transactions} />
                    <Link
                        href="/dashboard/transactions/scan"
                        className="flex items-center space-x-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20 font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                        <Camera className="h-5 w-5" />
                        <span className="hidden sm:inline">Scan Struk</span>
                    </Link>
                    <Link
                        href="/dashboard/transactions/new?type=expense"
                        className="flex items-center space-x-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                        <ArrowDownCircle className="h-5 w-5" />
                        <span>Pengeluaran</span>
                    </Link>
                    <Link
                        href="/dashboard/transactions/new?type=income"
                        className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 font-medium px-4 py-2.5 rounded-xl transition-colors shadow-sm"
                    >
                        <ArrowUpCircle className="h-5 w-5" />
                        <span>Pemasukan</span>
                    </Link>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm dark:shadow-xl">
                {transactions.length === 0 ? (
                    <div className="p-12 text-center text-neutral-500 dark:text-neutral-500">
                        <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300">Belum Ada Transaksi</h3>
                        <p className="mt-2 text-neutral-500 dark:text-neutral-400">Catat pemasukan atau pengeluaran pertama Anda.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm">
                                    <th className="p-4 font-medium">Tanggal</th>
                                    <th className="p-4 font-medium">Kategori</th>
                                    <th className="p-4 font-medium">Deskripsi</th>
                                    <th className="p-4 font-medium">Dompet</th>
                                    <th className="p-4 flex justify-end font-medium">Jumlah</th>
                                    <th className="p-4 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60">
                                {transactions.map((t: any) => {
                                    const isIncome = t.type === "INCOME";
                                    return (
                                        <tr key={t.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors text-neutral-900 dark:text-white">
                                            <td className="p-4 text-sm whitespace-nowrap">
                                                {new Date(t.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium" style={{ backgroundColor: `${t.category.color}20`, color: t.category.color! }}>
                                                    {t.category.name}
                                                </span>
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-300 max-w-xs truncate">
                                                {t.description || "-"}
                                            </td>
                                            <td className="p-4 text-neutral-500 dark:text-neutral-400 text-sm">
                                                {t.wallet.name}
                                            </td>
                                            <td className={`p-4 text-right font-medium whitespace-nowrap ${isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-neutral-900 dark:text-white"}`}>
                                                {isIncome ? "+" : "-"} Rp {Number(t.amount).toLocaleString("id-ID")}
                                            </td>
                                            <td className="p-4 text-center">
                                                <DeleteTransactionButton id={t.id} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
