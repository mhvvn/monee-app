"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteTransaction(transactionId: string) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;

        // Cari transaksi yang mau dihapus beserta data wallet-nya
        const transaction = await db.transaction.findUnique({
            where: {
                id: transactionId,
                userId: userId // Pastikan user hanya bisa menghapus miliknya sendiri
            }
        });

        if (!transaction) {
            return { success: false, error: "Transaksi tidak ditemukan." };
        }

        // Atomicity: Hapus transaksi dan kembalikan (rollback) saldo dompet
        await db.$transaction(async (tx) => {
            // 1. Hapus record transaksi
            await tx.transaction.delete({
                where: { id: transactionId }
            });

            // 2. Rollback saldo
            // Jika yang dihapus INCOME, maka kurangi saldo. Jika EXPENSE, tambah saldo.
            const modifier = transaction.type === "INCOME" ? -1 : 1;
            const reverseAmount = Number(transaction.amount) * modifier;

            await tx.wallet.update({
                where: { id: transaction.walletId },
                data: {
                    balance: { increment: reverseAmount }
                }
            });
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/transactions");

        return { success: true };
    } catch (error) {
        console.error("Delete error:", error);
        return { success: false, error: "Terjadi kesalahan saat menghapus transaksi." };
    }
}
