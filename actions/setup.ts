"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { TransactionType } from "@prisma/client";

export async function checkAndSetupUser() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        // Check if user has any wallet
        const existingWallet = await db.wallet.findFirst({
            where: { userId }
        });

        if (!existingWallet) {
            // Create default wallet
            await db.wallet.create({
                data: {
                    name: "Dompet Utama",
                    balance: 0,
                    currency: "IDR",
                    userId
                }
            });

            // Create default categories
            const defaultCategories = [
                { name: "Gaji", type: TransactionType.INCOME, icon: "briefcase", color: "#10b981" },
                { name: "Sampingan", type: TransactionType.INCOME, icon: "trending-up", color: "#06b6d4" },
                { name: "Makanan", type: TransactionType.EXPENSE, icon: "coffee", color: "#f43f5e" },
                { name: "Transportasi", type: TransactionType.EXPENSE, icon: "car", color: "#f59e0b" },
                { name: "Hiburan", type: TransactionType.EXPENSE, icon: "film", color: "#8b5cf6" },
                { name: "Belanja", type: TransactionType.EXPENSE, icon: "shopping-bag", color: "#ec4899" },
            ];

            await db.category.createMany({
                data: defaultCategories.map(cat => ({
                    ...cat,
                    userId
                }))
            });

            return { success: true, message: "Default data created" };
        }

        return { success: true, message: "Data already exists" };
    } catch (error) {
        console.error("Setup error:", error);
        return { success: false, message: "Failed to setup user" };
    }
}
