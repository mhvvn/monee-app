"use client";

import React, { useState } from "react";
import { signUp } from "@/lib/auth-client";
import { Loader2, Mail, Lock, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signUp.email({
                name,
                email,
                password,
                fetchOptions: {
                    onSuccess: () => {
                        router.push("/dashboard");
                    },
                    onError: (ctx) => {
                        setError(ctx.error.message);
                    }
                }
            });
        } catch (err) {
            setError("Gagal mendaftar. Pastikan email belum terdaftar.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Buat Akun Baru</h2>
                <p className="text-neutral-400 text-sm mt-1">Mulai perjalanan cerdas kelola uang Anda.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-300 ml-1">Nama Lengkap</label>
                    <div className="relative">
                        <User className="absolute left-3 top-2.5 h-5 w-5 text-neutral-500" />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl px-10 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="Budi Santoso"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-300 ml-1">Email</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-neutral-500" />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl px-10 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="nama@email.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-medium text-neutral-300 ml-1">Kata Sandi</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-neutral-500" />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl px-10 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="Minimal 8 karakter"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-xl py-3 font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Daftar"}
                </button>
            </form>

            <p className="text-center text-sm text-neutral-400 mt-4">
                Sudah memiliki akun?{" "}
                <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Masuk di sini
                </Link>
            </p>
        </div>
    );
}
