import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";

function extractAmountFromText(text: string): number {
    const lines = text.split('\n');
    let predictedAmount = 0;

    // Keyword pattern yang biasanya menjadi penanda "Total" pada struk
    // misalnya: TOTAL, JML, JUMLAH, AMOUNT, BAYAR
    const totalKeywords = /total|jml|jumlah|amount|bayar/i;

    for (const line of lines) {
        if (totalKeywords.test(line)) {
            // Cari semua kombinasi angka yang mungkin adalah harga uang, contoh 100.000 atau 50,000.00
            const matches = line.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?/g);

            if (matches && matches.length > 0) {
                // Ambil bilangan terakhir di garis tersebut yang paling mungkin sebagai total akhir
                const lastNumberRaw = matches[matches.length - 1];

                // Bersihkan tanda titik atau koma di akhir & convert ribuan
                const cleanNumberRaw = lastNumberRaw.replace(/[^0-9]/g, '');
                const parsed = parseInt(cleanNumberRaw, 10);

                // Filter out if value is suspiciously low or it has decimals, usually trailing 00 are cents
                // Struk Indonesia jarang punya sen, tapi kalau ada, kita asumsikan 2 digit akhir mungkin ribuan atau sen (misal 50.000)
                // Jika format aslinya 50.000,00 -> jadi 5000000 kalau dicabut non-angka. 
                // Logic Sederhana: jika parsed val > 1_000_000 dan ujungnya 00, bagi 100. (Bisa disesuaikan).
                let finalVal = parsed;
                if (cleanNumberRaw.endsWith('00') && Number(lastNumberRaw.replace(/[^0-9]/g, '')) > 2000000) {
                    // Contoh kemungkinan harga ribuan terekam berlebih
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

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("receipt") as File | null;

        if (!file) {
            return NextResponse.json({ success: false, error: "Tidak ada gambar yang diunggah" }, { status: 400 });
        }

        // Convert to ArrayBuffer then Buffer for Tesseract
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Proses OCR dengan bahasa Indonesia dan Inggris (ind+eng)
        const { data } = await Tesseract.recognize(buffer, "ind+eng", {
            logger: m => console.log(m),
        });

        const amount = extractAmountFromText(data.text);

        return NextResponse.json({
            success: true,
            text: data.text,
            predictedAmount: amount
        });
    } catch (error: any) {
        console.error("OCR Error:", error);
        return NextResponse.json({ success: false, error: error.message || "Gagal memproses struk." }, { status: 500 });
    }
}
