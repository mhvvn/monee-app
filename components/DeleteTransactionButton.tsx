"use client";

import { useTransition } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteTransaction } from "@/actions/delete";

export default function DeleteTransactionButton({ id }: { id: string }) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (confirm("Apakah Anda yakin ingin menghapus transaksi ini? Saldo dompet akan otomatis disesuaikan.")) {
            startTransition(async () => {
                const res = await deleteTransaction(id);
                if (!res.success) {
                    alert(res.error || "Gagal menghapus transaksi.");
                }
            });
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isPending}
            className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Hapus Transaksi"
        >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin text-red-400" /> : <Trash2 className="h-4 w-4" />}
        </button>
    );
}
