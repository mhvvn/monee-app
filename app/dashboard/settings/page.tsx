"use client";

import React, { useState, useEffect } from "react";
import { User, Lock, Moon, Sun, Monitor, Save, Loader2, Camera, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { useSession, signOut } from "@/lib/auth-client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    const [name, setName] = useState("");
    const [imageUrl, setImageUrl] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [profileSuccess, setProfileSuccess] = useState("");
    const [profileError, setProfileError] = useState("");

    const [pwdSuccess, setPwdSuccess] = useState("");
    const [pwdError, setPwdError] = useState("");

    // Mount theme & user data
    useEffect(() => {
        setMounted(true);
        if (session?.user) {
            setName(session.user.name);
            setImageUrl(session.user.image || "");
        }
    }, [session]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setProfileError("");
        setProfileSuccess("");
        setIsUpdatingProfile(true);

        try {
            const { error } = await authClient.updateUser({
                name: name,
                image: imageUrl || undefined,
            });
            if (error) throw error;
            setProfileSuccess("Profil berhasil diperbarui!");
            setTimeout(() => setProfileSuccess(""), 3000);
        } catch (err: any) {
            setProfileError(err.message || "Gagal memperbarui profil.");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwdError("");
        setPwdSuccess("");

        if (newPassword !== confirmPassword) {
            setPwdError("Konfirmasi sandi batu tidak cocok.");
            return;
        }

        setIsChangingPassword(true);

        try {
            const { error } = await authClient.changePassword({
                newPassword: newPassword,
                currentPassword: currentPassword,
                revokeOtherSessions: true
            });
            if (error) throw error;

            setPwdSuccess("Kata sandi berhasil diganti!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPwdSuccess(""), 3000);
        } catch (err: any) {
            setPwdError(err.message || "Gagal mengganti kata sandi.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login"); // arahkan ke login
                },
            },
        });
    };

    if (!mounted || isPending) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6 pb-12">
            <div>
                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Pengaturan</h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Kelola preferensi akun dan tampilan aplikasi secara ringkas.</p>
            </div>

            <div className="space-y-4">

                {/* 1. THEME TABS */}
                <section className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Mode Tampilan</h3>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Pilih tema terang, gelap, atau sesuaikan sistem.</p>
                        </div>
                        <div className="flex p-1 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg shrink-0">
                            <button
                                onClick={() => setTheme('light')}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'light' ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
                            >
                                <Sun className="h-4 w-4" />
                                <span>Terang</span>
                            </button>
                            <button
                                onClick={() => setTheme('dark')}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'dark' ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
                            >
                                <Moon className="h-4 w-4" />
                                <span>Gelap</span>
                            </button>
                            <button
                                onClick={() => setTheme('system')}
                                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${theme === 'system' ? 'bg-white dark:bg-neutral-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'}`}
                            >
                                <Monitor className="h-4 w-4" />
                                <span className="hidden sm:inline">Sistem</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* 2. PROFILE EDIT */}
                <section className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">Profil Pengguna</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Perbarui nama lengkap dan URL foto profil Anda.
                        </p>
                    </div>

                    <form onSubmit={handleUpdateProfile} className="md:w-2/3 space-y-3">
                        {profileError && <div className="p-2 text-xs text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-lg">{profileError}</div>}
                        {profileSuccess && <div className="p-2 text-xs text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/50 rounded-lg">{profileSuccess}</div>}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Nama Lengkap</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">URL Foto (Opsional)</label>
                            <input
                                type="url"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                            />
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                disabled={isUpdatingProfile}
                                className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {isUpdatingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                <span>Simpan Profil</span>
                            </button>
                        </div>
                    </form>
                </section>

                {/* 3. CHANGE PASSWORD */}
                <section className="bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/3">
                        <h3 className="text-base font-semibold text-neutral-900 dark:text-white mb-1">Keamanan Sandi</h3>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pastikan Anda menggunakan kata sandi unik yang kuat.
                        </p>
                    </div>

                    <form onSubmit={handleChangePassword} className="md:w-2/3 space-y-3">
                        {pwdError && <div className="p-2 text-xs text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-lg">{pwdError}</div>}
                        {pwdSuccess && <div className="p-2 text-xs text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/50 rounded-lg">{pwdSuccess}</div>}

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Sandi Saat Ini</label>
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Sandi Baru</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    minLength={8}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Ulangi Sandi Baru</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    minLength={8}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-1">
                            <button
                                type="submit"
                                disabled={isChangingPassword}
                                className="flex items-center space-x-2 bg-neutral-800 dark:bg-neutral-100 hover:bg-neutral-900 dark:hover:bg-white text-white dark:text-neutral-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                                {isChangingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                <span>Ganti Sandi</span>
                            </button>
                        </div>
                    </form>
                </section>

                {/* 4. DANGER ZONE */}
                <section className="bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-red-700 dark:text-red-400">Keluar dari Perangkat</h3>
                        <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-0.5">Sesi Anda akan dihapus dari peramban ini sepenuhnya.</p>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center justify-center space-x-2 px-5 py-2 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-500/30 text-sm font-medium rounded-lg transition-colors shrink-0"
                    >
                        <LogOut className="h-4 w-4" />
                        <span>Keluar Akun</span>
                    </button>
                </section>

            </div>
        </div>
    );
}
