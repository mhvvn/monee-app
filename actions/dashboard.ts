"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getDashboardStats() {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return { balance: 0, income: 0, expense: 0, recentTransactions: [] };

    const userId = session.user.id;

    // 1. Dapatkan Total Saldo (penjumlahan dari semua balance dompet user)
    const wallets = await db.wallet.findMany({
        where: { userId },
        select: { balance: true }
    });

    const totalBalance = wallets.reduce((acc: any, wallet: any) => acc + Number(wallet.balance), 0);

    // 2. Dapatkan Pemasukan & Pengeluaran Bulan Ini
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const transactionsThisMonth = await db.transaction.findMany({
        where: {
            userId,
            date: {
                gte: firstDayOfMonth,
                lte: lastDayOfMonth,
            }
        },
        select: {
            amount: true,
            type: true,
            date: true
        },
        orderBy: { date: 'asc' }
    });

    let totalIncome = 0;
    let totalExpense = 0;
    const dailyData: Record<string, { income: number, expense: number }> = {};

    transactionsThisMonth.forEach((t: any) => {
        const amount = Number(t.amount);
        const day = new Date(t.date).getDate().toString();

        if (!dailyData[day]) {
            dailyData[day] = { income: 0, expense: 0 };
        }

        if (t.type === "INCOME") {
            totalIncome += amount;
            dailyData[day].income += amount;
        } else {
            totalExpense += amount;
            dailyData[day].expense += amount;
        }
    });

    // Format chartData
    const chartData = [];
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = i.toString();
        chartData.push({
            date: `${i}/${now.getMonth() + 1}`,
            Pemasukan: dailyData[dayStr]?.income || 0,
            Pengeluaran: dailyData[dayStr]?.expense || 0,
        });
    }

    // 3. Ambil 5 transaksi terakhir untuk ditampilkan di layar depan
    const recentTransactionsRaw = await db.transaction.findMany({
        where: { userId },
        include: {
            category: { select: { name: true, color: true } }
        },
        orderBy: { date: 'desc' },
        take: 5
    });

    const recentTransactions = recentTransactionsRaw.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
    }));

    return {
        balance: totalBalance,
        income: totalIncome,
        expense: totalExpense,
        recentTransactions,
        chartData
    };
}
