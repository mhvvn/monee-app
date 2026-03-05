"use client";

import { useState } from "react";
import { Camera, UploadCloud, Loader2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Tesseract from "tesseract.js";

export default function ScanReceiptPage() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selected = e.target.files[0];
            setFile(selected);
            setPreview(URL.createObjectURL(selected));
        }
    };

    function extractAmountFromText(text: string): number {
        const lines = text.split('\n');
        let predictedAmount = 0;

        const totalKeywords = /total|jml|jumlah|amount|bayar/i;

        for (const line of lines) {
            if (totalKeywords.test(line)) {
                const matches = line.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?/g);

                if (matches && matches.length > 0) {
                    const lastNumberRaw = matches[matches.length - 1];
                    const cleanNumberRaw = lastNumberRaw.replace(/[^0-9]/g, '');
                    const parsed = parseInt(cleanNumberRaw, 10);

                    let finalVal = parsed;
                    if (cleanNumberRaw.endsWith('00') && Number(lastNumberRaw.replace(/[^0-9]/g, '')) > 2000000) {
                        finalVal = finalVal / 100;
                    }

                    if (finalVal > predictedAmount) {
                        predictedAmount = finalVal;
                    }
                }
            }
        }
        return predictedAmount;
    }

    const handleScan = async () => {
        if (!file) return;
        setLoading(true);

        try {
            // Memproses OCR sepenuhnya di sisi Client Browser (Lebih handal dan hemat server)
            const result = await Tesseract.recognize(
                file,
                'ind+eng',
                { logger: (m: any) => console.log(m) }
            );

            const amount = extractAmountFromText(result.data.text);

            router.push(`/dashboard/transactions/new?type=expense&amount=${amount}&desc=Dari%20Struk%20Belanja`);
        } catch (err) {
            console.error("OCR Error:", err);
            alert("Gagal membaca struktur struk. Pastikan gambar jelas.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center space-x-4 border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Pindai Struk (OCR)</h2>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Unggah foto struk belanja untuk mengekstrak harga otomatis.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                {preview ? (
                    <div className="w-full space-y-6">
                        <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950">
                            <Image src={preview} alt="Struk Preview" fill className="object-contain" />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                onClick={() => { setFile(null); setPreview(null); }}
                                className="flex-1 py-3 px-4 rounded-xl font-medium border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                            >
                                Ganti Gambar
                            </button>
                            <button
                                onClick={handleScan}
                                disabled={loading}
                                className="flex-1 py-3 px-4 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-emerald-950 flex justify-center items-center transition"
                            >
                                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Camera className="h-5 w-5 mr-2" />}
                                {loading ? "Menganalisa..." : "Pindai Sekarang"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="w-full">
                        <label className="flex flex-col items-center justify-center w-full h-64 md:h-96 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl cursor-pointer bg-neutral-50 dark:bg-neutral-800/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/5 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 rounded-full mb-4 transition-colors">
                                    <UploadCloud className="h-8 w-8 text-neutral-400 dark:text-neutral-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors" />
                                </div>
                                <p className="mb-2 text-sm text-neutral-500 dark:text-neutral-400"><span className="font-semibold text-emerald-600 dark:text-emerald-400">Klik untuk unggah</span> atau seret gambar ke sini</p>
                                <p className="text-xs text-neutral-400 dark:text-neutral-500">Mendukung file PNG, JPG, atau tangkapan kamera langsung</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleFileChange} />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
