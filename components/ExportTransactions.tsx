"use client";

import React, { useState } from "react";
import { Download, FileText, Table } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useSession } from "@/lib/auth-client";

interface Transaction {
    id: string;
    amount: number | string;
    type: "INCOME" | "EXPENSE";
    date: Date | string;
    description: string | null;
    category: { name: string, color?: string | null };
    wallet: { name: string };
}

export default function ExportTransactions({ transactions }: { transactions: Transaction[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const { data: session } = useSession();

    const exportToCSV = () => {
        // Create CSV header (BOM for Excel Unicode support)
        const BOM = "\uFEFF";
        const headers = ["Tanggal", "Tipe", "Kategori", "Deskripsi", "Dompet", "Jumlah (Rp)", "Jumlah (Signed)"];
        const rows = transactions.map(t => {
            const date = new Date(t.date).toLocaleDateString("id-ID");
            const type = t.type === "INCOME" ? "Pemasukan" : "Pengeluaran";
            const category = t.category.name;
            const description = `"${t.description?.replace(/"/g, '""') || "-"}"`;
            const wallet = t.wallet.name;
            const amount = Number(t.amount);
            const signedAmount = t.type === "INCOME" ? amount : -amount;
            return [date, type, category, description, wallet, amount, signedAmount].join(",");
        });

        const csvContent = BOM + [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `Laporan_Transaksi_${new Date().toLocaleDateString("id-ID")}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        setIsOpen(false);
    };

    const exportToPDF = () => {
        const doc = new jsPDF();

        // 1. Gambar Logo Koin menggunakan jsPDF primitives
        doc.setFillColor(255, 193, 7); // #FFC107 (Outer Circle)
        doc.circle(20, 20, 6, "F");

        doc.setFillColor(255, 213, 79); // #FFD54F (Inner Circle)
        doc.circle(20, 20, 4.5, "F");

        // Simbol $
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(255, 152, 0); // #FF9800
        doc.text("$", 18.5, 21.5);

        // Header - Perusahaan / Aplikasi
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 185, 129); // emerald-500
        doc.text("monee", 29, 23);

        doc.setFontSize(14);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(40, 40, 40);
        doc.text("Laporan Riwayat Transaksi", 14, 34);

        // Info Akun & Waktu Cetak
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);

        const userName = session?.user?.name || "Pengguna";
        const userEmail = session?.user?.email || "Tidak ada email";
        const printDate = new Date().toLocaleString("id-ID");

        doc.text(`Dicetak oleh : ${userName} (${userEmail})`, 14, 42);
        doc.text(`Waktu Cetak  : ${printDate}`, 14, 47);

        const tableColumn = ["Tanggal", "Tipe", "Kategori", "Deskripsi", "Dompet", "Jumlah (Rp)"];
        const tableRows: any[] = [];

        transactions.forEach(t => {
            const date = new Date(t.date).toLocaleDateString("id-ID");
            const type = t.type === "INCOME" ? "Pemasukan" : "Pengeluaran";
            const category = t.category.name;
            const description = t.description || "-";
            const wallet = t.wallet.name;
            const amount = (t.type === "INCOME" ? "+" : "-") + " Rp " + Number(t.amount).toLocaleString("id-ID");
            tableRows.push([date, type, category, description, wallet, amount]);
        });

        // @ts-ignore
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 55,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [16, 185, 129], textColor: 255 }, // emerald-500
            alternateRowStyles: { fillColor: [245, 245, 245] },
            didParseCell: function (data: any) {
                // Colorize income vs expense in the Amount column
                if (data.section === "body" && data.column.index === 5) {
                    const rowData = tableRows[data.row.index];
                    if (rowData[1] === "Pemasukan") {
                        data.cell.styles.textColor = [16, 185, 129]; // Emerald
                    } else {
                        data.cell.styles.textColor = [239, 68, 68]; // Red
                    }
                }
            }
        });

        doc.save(`Laporan_Transaksi_${new Date().toLocaleDateString("id-ID")}.pdf`);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-white px-4 py-2.5 rounded-xl transition-colors font-medium shadow-sm"
            >
                <Download className="h-5 w-5" />
                <span className="hidden sm:inline">Export</span>
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-20 overflow-hidden flex flex-col py-1">
                        <button
                            onClick={exportToCSV}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-300 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors text-left"
                        >
                            <Table className="h-5 w-5 text-emerald-500" />
                            <div className="flex flex-col">
                                <span className="font-medium">Export ke Excel</span>
                                <span className="text-xs text-neutral-500">Format CSV (.csv)</span>
                            </div>
                        </button>
                        <div className="h-px w-full bg-neutral-800"></div>
                        <button
                            onClick={exportToPDF}
                            className="flex items-center space-x-3 px-4 py-3 text-sm text-neutral-300 hover:bg-red-500/10 hover:text-red-400 transition-colors text-left"
                        >
                            <FileText className="h-5 w-5 text-red-500" />
                            <div className="flex flex-col">
                                <span className="font-medium">Export ke PDF</span>
                                <span className="text-xs text-neutral-500">Bisa langsung dicetak</span>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
