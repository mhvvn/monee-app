"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
// Skema Validasi Zod
const transactionSchema = z.object({
    walletId: z.string().min(1, "Dompet wajib dipilih"),
    categoryId: z.string().min(1, "Kategori wajib dipilih"),
    amount: z.number().positive("Jumlah harus lebih dari 0"),
    type: z.enum(["INCOME", "EXPENSE"]),
    date: z.date(),
    description: z.string().optional(),
});

export async function createTransaction(formData: FormData) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return { success: false, error: "Unauthorized" };
        }

        const userId = session.user.id;
        const amount = Number(formData.get("amount")?.toString().replace(/\D/g, ""));

        // Validasi data masukan dari klien agar aman dari injeksi
        const rawData = {
            walletId: formData.get("walletId") as string,
            categoryId: formData.get("categoryId") as string,
            amount: amount,
            type: formData.get("type") as "INCOME" | "EXPENSE",
            date: new Date(formData.get("date") as string),
            description: formData.get("description") as string,
        };

        const validatedData = transactionSchema.parse(rawData);

        // Hitung perubahan saldo dompet
        const modifier = validatedData.type === "INCOME" ? 1 : -1;
        const balanceChange = validatedData.amount * modifier;

        // Transaksi database Prisma (Atomicity)
        // Pastikan insert transaksi dan update saldo dompet berhasil bersamaan
        await db.$transaction(async (tx: any) => {
            // 1. Simpan record transaksi
            await tx.transaction.create({
                data: {
                    ...validatedData,
                    userId,
                },
            });

            // 2. Update saldo di tabel dompet terkait
            await tx.wallet.update({
                where: { id: validatedData.walletId, userId: userId }, // Pastikan dompet ini milik user ybs
                data: {
                    balance: { increment: balanceChange },
                },
            });
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/transactions");

        return { success: true };
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return { success: false, error: (error as any).errors[0]?.message || "Input tidak valid" };
        }
        return { success: false, error: "Terjadi kesalahan server." };
    }
}

export async function getSelectOptions() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { wallets: [], categories: [] };

    const userId = session.user.id;

    const [walletsRaw, categories] = await Promise.all([
        db.wallet.findMany({ where: { userId }, select: { id: true, name: true, balance: true } }),
        db.category.findMany({ where: { userId }, select: { id: true, name: true, type: true, icon: true } })
    ]);

    const wallets = walletsRaw.map((w: any) => ({
        ...w,
        balance: Number(w.balance)
    }));

    return { wallets, categories };
}

export async function getRecentTransactions(limit = 10) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return [];

    const txsRaw = await db.transaction.findMany({
        where: { userId: session.user.id },
        include: {
            category: { select: { name: true, icon: true, color: true } },
            wallet: { select: { name: true } }
        },
        orderBy: { date: 'desc' },
        take: limit
    });

    return txsRaw.map((t: any) => ({ ...t, amount: Number(t.amount) }));
}
