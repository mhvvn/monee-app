"use client";

import React, { useState } from "react";
import { signIn } from "@/lib/auth-client";
import { Loader2, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await signIn.email({
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
            setError("Terjadi kesalahan. Coba lagi nanti.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-white">Selamat Datang Kembali</h2>
                <p className="text-neutral-400 text-sm mt-1">Masuk untuk melihat laporan keuangan terkinimu.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
                        {error}
                    </div>
                )}

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
                            className="w-full bg-neutral-800/50 border border-neutral-700 rounded-xl px-10 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white rounded-xl py-3 font-semibold shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex justify-center items-center"
                >
                    {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Masuk"}
                </button>
            </form>

            <p className="text-center text-sm text-neutral-400 mt-4">
                Belum punya akun?{" "}
                <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors">
                    Daftar sekarang
                </Link>
            </p>
        </div>
    );
}
