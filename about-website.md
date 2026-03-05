# Finance Tracker (Monee) - Arsitektur & Teknologi

*Dokumentasi Sistem untuk Kebutuhan Pembuatan Dashboard Monitor*

Aplikasi "Monee" (Finance Tracker) mengadopsi pendekatan **Fullstack berbasis Serverless dan Edge-friendly** menggunakan arsitektur monolit modern (frontend dan backend tergabung dalam satu repositori yang sama) dengan memanfaatkan kemampuan Next.js App Router (Reac Server Components).

---

## 🛠️ Stack Teknologi (Tech Stack)

### **A. Framework & Inti (Core)**
1. **[Next.js 16.1.6](https://nextjs.org/)**: Framework full-stack utama. Memanfaatkan *App Router* (`/app`) dengan *React Server Components (RSC)* dan Server Actions untuk mengelola logika data secara *backend-less* namun aman.
2. **[React 19.2.3](https://react.dev/)**: *Library* interaktif antarmuka utama.

### **B. Tampilan Visual & Desain UI**
1. **[Tailwind CSS v4](https://tailwindcss.com/)**: Sistem desain utilitas *utility-first* berbasis PostCSS. Dioptimalkan untuk implementasi *Dark/Light Mode*.
2. **[Framer Motion v12](https://www.framer.com/motion/)**: Menangani segala animasi transisi halaman, efek mikro-interaksi, dan *layouting* dinamis (seperti grafik/tabel interaktif).
3. **[Lucide React](https://lucide.dev/)**: Kumpulan ikon SVGs minimalis nan elegan yang digunakan secara global dalam proyek.
4. **[next-themes](https://github.com/pacocoursey/next-themes)**: Bertugas mengelola perpindahan tema sistem Dark/Light mode secara *persistent* (tersimpan di peramban pengguna).

### **C. Autentikasi & Keamanan (Auth)**
1. **[Better Auth v1.5](https://better-auth.com/)**: Sistem pengelolaan *session*, registrasi (termasuk fitur *username* dan otentikasi kata sandi), serta *hashing* keamanan pengguna. Kelebihan Better Auth ada pada ukuran dan keandalannya di *Serverless*.

### **D. Database & ORM**
1. **[Prisma ORM v6.4](https://www.prisma.io/)**: Menjembatani kode Node.js dengan sistem Basis Data (PostgreSQL) menggunakan fitur tipe keamanan ketat *(strict type-safety)*.
2. **PostgreSQL**: Mesin basis data relasional. (Terkoneksi lewat `DATABASE_URL` di *environment variables*, seringkali disediakan via Supabase/Neon).

### **E. Fungsionalitas Ekstra (Libraries)**
1. **[Recharts v3.7](https://recharts.org/)**: Bertanggung jawab merender grafik keuangan canggih dan interaktif di halaman dasbor.
2. **[Tesseract.js v7](https://tesseract.projectnaptha.com/)**: Modul *Optical Character Recognition (OCR)* pemindai murni berbasis *web browser/Client-side* (tanpa *server API*) yang sanggup membaca total tagihan dari foto struk setruk belanja.
3. **jsPDF & jsPDF-AutoTable**: Memungkinkan aplikasi membuat laporan berformat PDF dan mendongkrak unduhan laporan bulanan secara dinamis di klien.
4. **Zod**: Untuk validasi struktur data input form *backend/frontend* sebelum terkirim ke *database*.

---

## 🏗️ Struktur Arsitektur Skema Database

Sistem memecah blok tabel *(schema)* menjadi dua area: Tabel Otentikasi bawaan sistem (*Better Auth*) dan Tabel Transaksional/Fitur Pengguna (*Finance Tracker Schema*). Semua tabel saling berelasi melalui entitas induk bernama **`User`**.

### 1. Entitas Autentikasi Keamanan (Better Auth Managed)

*   **`User`** (`map: "user"`)
    *   Tabel Induk *(master)* dari setiap pengguna aplikasi.
    *   *Kolom Utama*: `id` (PK), `name`, `email` (Unique), `username` (Unique), `displayUsername`, `emailVerified`, `image`, `createdAt`, `updatedAt`.
    *   *Relasi*: Memiliki banyak (`1:N`) `Session`, `Account`, `Wallet`, `Category`, dan `Transaction`.

*   **`Session`** (`map: "session"`)
    *   Menyimpan sesi login aktif untuk diuji kedaluwarsanya.
    *   *Kolom Utama*: `id` (PK), `token` (Unique), `expiresAt`, `ipAddress`, `userAgent`, `userId` (FK).

*   **`Account`** (`map: "account"`)
    *   Menangani pertautan dengan penyedia otentikasi (*Oauth/Provider*).
    *   *Kolom Utama*: `id` (PK), `providerId`, `userId` (FK), `password` (terenkripsi tipe kredensial).

*   **`Verification`** (`map: "verification"`)
    *   Tabel sementara untuk token/OTP validasi surel maupun kelupaan kata sandi.

### 2. Entitas Pelacak Finansial (Sistem Bisnis Inti)

*   **`Wallet`** (`map: "wallet"`)
    *   Entitas yang mendeskripsikan dompet, rekening fisik, maupun uang tunai.
    *   *Kolom Utama*: 
        *   `id` (PK - Sistem CUID)
        *   `userId` (FK - ke tabel User, onDelete Cascade/Hapus user = Hapus dompet otomatis)
        *   `name` (Misal: Rekening BCA, Dompet Biru)
        *   `balance` (Tipe `Decimal` untuk presisi akurasi mata uang tinggi tanpa kehilangan fraksi `0.00`)
        *   `currency` (String, default `IDR`)

*   **`Category`** (`map: "category"`)
    *   Kategori pengeluaran/Pemasukan.
    *   *Kolom Utama*: 
        *   `id` (PK - CUID)
        *   `userId` (FK)
        *   `name` (Misal: Uang Makan, Tiket Transport)
        *   `type` (Tipe data Enum `TransactionType` yaitu `INCOME` atau `EXPENSE`)
        *   `icon`, `color`(Preferensi UI Kategori)

*   **`Transaction`** (`map: "transaction"`)
    *   **Tabel paling aktif (Log Finansial) dan akan bertambah setiap saat**.
    *   *Kolom Utama*:
        *   `id` (PK - CUID)
        *   `userId` (FK)
        *   `walletId` (FK)
        *   `categoryId` (FK)
        *   `amount` (Tipe `Decimal`)
        *   `type` (Tipe `Enum`, membedakan + atau - )
        *   `date` (DateTime transaksi terjadi)
        *   `description` (Catatan singkat Opsional)
        *   `receiptImageUrl` (Opsional, untuk mencatat tautan foto unggahan struk belanja asli di masa mendatang).

### ✅ Flow (Alur Arsitektur Ringkas)
1. Peramban (*Frontend*) membuat Form Transaksi -> 2. *Server Action* di Next.js merespon dan memvalidasi tipe *(Zod)* -> 3. Prisma ORM menjatuhkan query Insert/Update dengan merelasikan `categoryId`, `walletId`, dan secara otomatis memperbarui `balance` dari `Wallet` yang terkait -> 4. *Router* mereload data ke Dasbor baru yang sudah dirender ulang dari server (*Server-side rendered*).
