# SILAPOR-KU 🏛️
### Sistem Informasi Layanan Pengaduan & Aspirasi Nagari Kambang Utara

[![Next.js](https://img.shields.io/badge/Next.js-16%20App%20Router-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Drizzle ORM](https://img.shields.io/badge/ORM-Drizzle-C5F74F?logo=drizzle)](https://orm.drizzle.team/)
[![Database](https://img.shields.io/badge/Database-Neon%20Serverless%20PostgreSQL-00E599?logo=postgresql)](https://neon.tech/)
[![Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-Academic%20Project-orange)](#)

> **SILAPOR-KU** adalah platform web responsif yang dirancang untuk memfasilitasi penyampaian pengaduan dan aspirasi masyarakat, pelacakan status penanganan secara transparan menggunakan **kode tiket unik**, serta pengelolaan dan pemantauan laporan secara terintegrasi oleh aparatur Pemerintah **Nagari Kambang Utara**.

---

## 📑 Daftar Isi

- [Latar Belakang & Masalah](#-latar-belakang--masalah)
- [Fitur Utama](#-fitur-utama)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Diagram Alur & Arsitektur](#-diagram-alur--arsitektur)
- [Teknologi yang Digunakan (Tech Stack)](#-teknologi-yang-digunakan-tech-stack)
- [Skema Basis Data](#-skema-basis-data)
- [Struktur Folder](#-struktur-folder)
- [Panduan Memulai (Instalasi & Menjalankan)](#-panduan-memulai-instalasi--menjalankan)
  - [Prasyarat](#prasyarat)
  - [Langkah Instalasi](#langkah-instalasi)
  - [Konfigurasi Environment Variables](#konfigurasi-environment-variables)
  - [Migrasi & Sinkronisasi Database](#migrasi--sinkronisasi-database)
- [Daftar Perintah (Scripts)](#-daftar-perintah-scripts)
- [Matriks Hak Akses Pengguna](#-matriks-hak-akses-pengguna)
- [Panduan Deployment (Vercel + Neon)](#-panduan-deployment-vercel--neon)
- [Informasi Proyek & Tim](#-informasi-proyek--tim)

---

## 📌 Latar Belakang & Masalah

Pengelolaan aspirasi masyarakat dan penanganan keluhan fasilitas publik di Nagari Kambang Utara sebelumnya menghadapi sejumlah kendala:
1. **Penyampaian Terfragmentasi**: Laporan disampaikan melalui obrolan perorangan, pesan singkat, atau surat fisik yang rentan hilang.
2. **Ketiadaan Bukti & Lokasi yang Jelas**: Kurangnya standardisasi lampiran foto bukti dan koordinat lokasi kejadian menyulitkan verifikasi di lapangan.
3. **Ketiadaan Pelacakan Transparan**: Warga tidak memperoleh kepastian sejauh mana laporannya telah ditindaklanjuti.
4. **Ketiadaan Dashboard Pengambil Kebijakan**: Wali Nagari kesulitan melihat rekapitulasi data keluhan per jorong dan kategori untuk bahan evaluasi pelayanan nagari.

**SILAPOR-KU** hadir menyelesaikan tantangan tersebut dengan sistem pelaporan digital yang aman, transparan, terstruktur, dan akuntabel.

---

## ✨ Fitur Utama

### 1. Modul Pelaporan Warga
- **Formulir Terstandar**: Pengisian judul, kategori aduan (infrastruktur, lingkungan, administrasi, sosial), deskripsi lengkap, dan pilihan wilayah **Jorong**.
- **Wajib Foto Bukti Presisi**: **Wajib melampirkan minimal 1 foto bukti kejadian** (format: JPG, JPEG, PNG, WebP; maksimal 5 MB/foto; mendukung pengunggahan lebih dari 1 foto). Dokumen selain gambar (.docx, .pdf, dll.) tidak diizinkan.
- **Lokasi Kejadian**: Penentuan patokan alamat kejadian serta integrasi titik koordinat GPS.
- **Opsi Anonim**: Warga dapat memilih melapor menggunakan identitas pribadi atau secara anonim guna melindungi privasi pelapor.
- **Kode Tiket Otomatis**: Setiap laporan yang berhasil dikirim langsung memperoleh kode tiket unik (misal: `SLP-202610-A9B2`) untuk disimpan oleh warga.

### 2. Modul Pelacakan Mandiri (Public Tracking)
- **Pelacakan Cepat Berbasis Kode Tiket**: Warga dapat mengecek progres laporan kapan saja tanpa harus login.
- **Status Penanganan Real-Time**:
  - `Menunggu Pemeriksaan`: Laporan baru masuk dan menunggu validasi aparatur.
  - `Diproses`: Laporan sedang ditindaklanjuti oleh unit kerja terkait.
  - `Selesai`: Penanganan telah tuntas dilaksanakan.
  - `Ditolak`: Laporan tidak valid atau tidak memenuhi syarat (disertai alasan penolakan).
- **Lini Masa (Audit Trail)**: Menampilkan catatan resmi petugas nagari terkait perkembangan penanganan.

### 3. Modul Pengelolaan Aparatur (Admin Nagari)
- **Otentikasi Aman**: Login berbasis hak akses khusus aparatur nagari.
- **Dashboard Operasional**: Antrean kerja harian untuk memantau laporan baru yang butuh verifikasi dan tindakan cepat.
- **Pemeriksaan Berkas & Lokasi**: Meninjau foto bukti resolusi penuh serta titik lokasi pada peta.
- **Pembaruan Status & Riwayat (CRUD)**: Memperbarui tahapan status penanganan dan menuliskan catatan tindak lanjut yang tersimpan otomatis pada riwayat laporan.
- **Pencetakan Rekap**: Fitur cetak rekapitulasi laporan masuk untuk kebutuhan arsip dan administrasi nagari.

### 4. Modul Pemantauan Pimpinan (Wali Nagari)
- **Dashboard Eksekutif (Makro)**: Ringkasan indikator kunci (KPI), total laporan masuk, jumlah diselesaikan, laporan sedang diproses, serta persentase penyelesaian.
- **Grafik Distribusi**: Visualisasi statistik keluhan berdasarkan kategori aduan dan sebaran wilayah jorong di Nagari Kambang Utara.
- **Akses Detail Laporan (Read-Only)**: Wali Nagari dapat membuka rincian detail laporan, foto bukti, dan riwayat penanganan secara langsung untuk evaluasi mendalam tanpa wewenang mengubah data teknis.

---

## 🏗️ Arsitektur Sistem

Sistem SILAPOR-KU dibangun menggunakan arsitektur modern berbasis *serverless* dan *end-to-end type safety*:

1. **Frontend Layer (UI/Client)**:
   - **Next.js 16 (App Router)** & **React 19** untuk arsitektur antarmuka modern yang modular.
   - **TypeScript** untuk stabilitas kode dan pendeteksian galat sejak proses penulisan.
   - **Tailwind CSS** untuk tata letak antarmuka yang responsif, adaptif pada resolusi desktop maupun ponsel (*mobile-friendly*), serta mendukung komponen modular di `src/components`.
2. **Routing & State Management**:
   - Sistem perutean berbasis berkas (*file-system based*) di direktori `src/app` (seperti `/`, `/lapor`, `/lacak`, `/login`, `/dashboard`, `/laporan`).
   - Pemanfaatan **React Server Components (RSC)** untuk *data fetching* cepat di sisi server dan **Client Components** untuk interaksi dinamis (form multi-step, modal, picker lokasi).
3. **Application & API Layer (Backend/Serverless)**:
   - **Next.js Server Actions** dan **Route Handlers** yang memproses logika bisnis langsung (validasi data Zod, autentikasi sesi peran, pemrosesan kode tiket, dan pencatatan audit trail) tanpa membutuhkan server backend monolitik terpisah.
4. **Data Access Layer (ORM)**:
   - **Drizzle ORM** (`drizzle-orm` & `drizzle-kit`) sebagai penghubung kode dengan database.
   - Mengelola skema relasional di `src/db/schema.ts`, migrasi skema yang aman, serta query yang 100% *type-safe*.
5. **Database Layer (Storage)**:
   - **Neon Serverless PostgreSQL** (`@neondatabase/serverless`) untuk persistensi data berkecepatan tinggi, auto-scaling, dan efisiensi biaya.
6. **Security & Environment Config**:
   - Pengamanan kredensial sensitif (`DATABASE_URL`, session secrets) melalui `.env.local` saat development dan Environment Variables terenkripsi saat produksi.
   - Validasi hak akses (*Role-Based Access Control*) pada setiap Server Action dan Route.
7. **Build & Quality Assurance**:
   - Pengecekan statis menggunakan **ESLint** (`npm run lint`) dan pengecekan tipe data TypeScript (`npm run build`) sebelum proses deployment.
8. **Deployment & Hosting Layer**:
   - Integrasi repositori **GitHub / GitLab** langsung ke **Vercel** untuk hosting aplikasi (otomasi CI/CD: *auto-build* dan *deploy* pada branch `main`), terhubung langsung ke cluster database Neon Serverless.

---

## 📊 Diagram Alur & Arsitektur

### 1. Arsitektur Teknis Lengkap

```mermaid
graph TD
    subgraph Client_Layer ["Client Layer (Browser)"]
        UserDevice["Perangkat Warga & Aparatur\n(Mobile / Desktop Browser)"]
    end

    subgraph Hosting_Vercel ["Vercel Serverless Edge / Node Runtime"]
        NextApp["Next.js 16 (App Router)"]
        subgraph Internal_Next ["Lapisan Aplikasi & UI"]
            RSC["Server Components\n(SSR / Fast Render)"]
            CC["Client Components\n(Form, Map, Modal)"]
            SA["Server Actions & Route Handlers\n(Business Logic & RBAC)"]
        end
        Drizzle["Drizzle ORM\n(src/db/schema.ts)"]
    end

    subgraph Storage_Layer ["Database Layer (Neon Serverless)"]
        NeonDB[("Neon Serverless PostgreSQL\n- jorong\n- kategori\n- aparatur\n- pelapor\n- laporan\n- lampiran\n- tindak_lanjut")]
    end

    UserDevice <-->|HTTPS / HTTP-only Cookies| NextApp
    NextApp --> RSC
    NextApp --> CC
    CC -->|Mutations| SA
    RSC --> SA
    SA <-->|Type-Safe Queries| Drizzle
    Drizzle <-->|Connection Pooling / WebSocket| NeonDB
```

### 2. Alur Proses Pelaporan & Tindak Lanjut

```mermaid
flowchart TD
    Start([Mulai: Warga Buka SILAPOR-KU]) --> Form[Isi Form Aduan / Aspirasi]
    Form --> Upload[Unggah Foto & Koordinat Lokasi]
    Upload --> AnonCheck{Pilih Anonim?}
    AnonCheck -- Ya --> MarkAnon[Set is_anonim = true]
    AnonCheck -- Tidak --> FillIdentity[Input Nama & Kontak]
    MarkAnon --> Submit[Kirim Laporan]
    FillIdentity --> Submit
    
    Submit --> Val{Validasi Server Action}
    Val -- Gagal --> ShowErr[Tampilkan Pesan Error]
    ShowErr --> Form
    Val -- Sukses --> GenTicket[Generate Kode Tiket Unik]
    GenTicket --> SaveDB[(Simpan ke Neon PostgreSQL)]
    SaveDB --> ShowTicket[Tampilkan Halaman Sukses & Kode Tiket]
    
    ShowTicket --> WargaTrack[Warga Dapat Lacak Kapan Saja]
    
    SaveDB --> NotifAdmin[Laporan Masuk di Dashboard Aparatur]
    NotifAdmin --> AdminReview[Admin Nagari Verifikasi Berkas]
    AdminReview --> StatusAction{Keputusan Admin}
    StatusAction -- Tolak --> SetDitolak[Status: Ditolak + Alasan]
    StatusAction -- Valid --> SetProses[Status: Diproses]
    SetProses --> TindakLanjut[Penanganan Lapangan]
    TindakLanjut --> SetSelesai[Status: Selesai + Catatan Hasil]
    
    SetDitolak --> UpdateHistory[(Simpan Riwayat Tindak Lanjut)]
    SetSelesai --> UpdateHistory
    UpdateHistory --> ExecutiveDash[Update Real-time di Dashboard Wali Nagari]
```

---

## 🛠️ Teknologi yang Digunakan (Tech Stack)

| Bagian | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Framework UI** | [Next.js 16](https://nextjs.org/) | App Router, Server Components & Server Actions |
| **Library UI** | [React 19](https://react.dev/) | Primitif antarmuka modern & hook performa tinggi |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) | Static typing ketat untuk keandalan kode |
| **Styling CSS** | [Tailwind CSS](https://tailwindcss.com/) | Utilitas CSS modern dan responsif |
| **Komponen & Ikon** | Lucide React | Ikon modern dan ringan |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team/) | Object-Relational Mapping ringan & type-safe |
| **Database Kit** | Drizzle Kit | Migrasi skema database & Drizzle Studio |
| **Database** | [Neon Serverless](https://neon.tech/) | Serverless PostgreSQL dengan latensi rendah |
| **Validasi Skema** | Zod | Validasi data formulir dan input server actions |
| **Deployment** | [Vercel](https://vercel.com/) | Platform hosting cloud teroptimasi untuk Next.js |

---

## 🗄️ Skema Basis Data

Sistem menggunakan 7 tabel relasional utama sesuai spesifikasi kebutuhan data:

```mermaid
erDiagram
    JORONG ||--o{ LAPORAN : "lokasi"
    KATEGORI ||--o{ LAPORAN : "kategori"
    PELAPOR ||--o{ LAPORAN : "pengirim"
    LAPORAN ||--o{ LAMPIRAN : "bukti"
    LAPORAN ||--o{ TINDAK_LANJUT : "riwayat"
    APARATUR ||--o{ TINDAK_LANJUT : "petugas"

    JORONG {
        varchar id_jorong PK
        varchar nama_jorong
    }
    KATEGORI {
        varchar id_kategori PK
        varchar nama_kategori
        text deskripsi_kategori
    }
    APARATUR {
        varchar id_aparatur PK
        varchar username UK
        varchar password_hash
        varchar nama_lengkap
        varchar peran "admin / wali_nagari"
    }
    PELAPOR {
        varchar id_pelapor PK
        varchar nama_pelapor
        varchar nomor_kontak
        boolean is_anonim
    }
    LAPORAN {
        varchar id_laporan PK
        varchar kode_tiket UK
        varchar id_pelapor FK
        varchar id_jorong FK
        varchar id_kategori FK
        varchar jenis_laporan
        varchar judul_laporan
        text deskripsi_laporan
        numeric koordinat_lintang
        numeric koordinat_bujur
        text patokan_lokasi
        varchar status_laporan
        timestamp waktu_dibuat
        timestamp waktu_selesai
    }
    LAMPIRAN {
        varchar id_lampiran PK
        varchar id_laporan FK
        varchar nama_berkas
        varchar jalur_berkas
        varchar tipe_berkas
        integer ukuran_berkas
        timestamp waktu_unggah
    }
    TINDAK_LANJUT {
        varchar id_tindak_lanjut PK
        varchar id_laporan FK
        varchar id_aparatur FK
        varchar status_tahapan
        text catatan_petugas
        timestamp waktu_pembaruan
    }
```

---

## 📁 Struktur Folder

Struktur proyek disusun rapi mengikuti konvensi Next.js App Router:

```text
SILAPOR-KU/
├── public/                 # Aset statis (logo nagari, ikon, gambar publik)
├── src/
│   ├── app/                # Next.js App Router (Halaman & Perutean)
│   │   ├── (auth)/         # Rute otentikasi
│   │   │   └── login/      # Halaman login aparatur
│   │   ├── (dashboard)/    # Rute khusus aparatur (terproteksi sesi)
│   │   │   ├── dashboard/  # Dashboard analitik Wali Nagari & Admin
│   │   │   ├── laporan/    # Daftar laporan masuk & filter
│   │   │   │   └── [id]/   # Detail penanganan laporan & input tindak lanjut
│   │   │   └── statistik/  # Rekap laporan & cetak laporan
│   │   ├── buat-laporan/   # Formulir publik pembuatan aduan/aspirasi
│   │   ├── lacak/          # Halaman publik pelacakan kode tiket
│   │   ├── api/            # Route handlers untuk integrasi eksternal
│   │   ├── layout.tsx      # Root layout & navigasi umum
│   │   └── page.tsx        # Beranda (Landing page) SILAPOR-KU
│   ├── components/         # Komponen UI Reusable
│   │   ├── ui/             # Tombol, input, kartu, badge status, modal
│   │   ├── form/           # Komponen form aduan, upload foto, map picker
│   │   ├── dashboard/      # Widget ringkasan, chart statistik
│   │   └── layout/         # Header publik, sidebar aparatur, footer
│   ├── db/                 # Konfigurasi Database & ORM
│   │   ├── index.ts        # Inisialisasi koneksi Neon Serverless
│   │   └── schema.ts       # Definisi skema tabel Drizzle
│   ├── lib/                # Modul pembantu (utilities)
│   │   ├── actions/        # Server Actions (laporan, auth, tindak lanjut)
│   │   ├── auth.ts         # Verifikasi sesi & proteksi hak akses
│   │   └── utils.ts        # Helper formatting tanggal, tiket generator
│   └── types/              # Definisi TypeScript interface & tipe data
├── drizzle/                # Berkas SQL hasil migrasi drizzle-kit
├── drizzle.config.ts       # Konfigurasi Drizzle ORM
├── next.config.ts          # Konfigurasi Next.js
├── tailwind.config.ts      # Konfigurasi tema & styling Tailwind CSS
├── tsconfig.json           # Konfigurasi TypeScript
├── docs/                   # Dokumentasi proyek
│   └── PRD.md              # Dokumen Product Requirements resmi (v1.1)
├── package.json            # Daftar dependensi & scripts proyek
└── README.md               # Dokumentasi utama proyek
```

---

## 🚀 Panduan Memulai (Instalasi & Menjalankan)

### Prasyarat
Pastikan komputer Anda telah terinstal:
- [Node.js](https://nodejs.org/) versi 18.18 atau lebih baru (direkomendasikan Node.js LTS).
- Pengelola paket `npm` (atau `pnpm` / `yarn`).
- Akun dan database PostgreSQL di [Neon Console](https://console.neon.tech/).

### Langkah Instalasi

1. **Clone Repositori**:
   ```bash
   git clone https://github.com/username/SILAPOR-KU.git
   cd SILAPOR-KU
   ```

2. **Pasang Dependensi**:
   ```bash
   npm install
   ```

### Konfigurasi Environment Variables

Buat berkas `.env.local` di direktori utama (*root*) proyek dan sesuaikan nilainya:

```env
# Koneksi Database Neon PostgreSQL
DATABASE_URL="postgresql://user:password@ep-sample-123456.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

# Pengaturan Sesi & Keamanan
SESSION_SECRET="ganti_dengan_string_acak_panjang_minimal_32_karakter"

# Konfigurasi Aplikasi
NEXT_PUBLIC_APP_NAME="SILAPOR-KU Nagari Kambang Utara"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Migrasi & Sinkronisasi Database

Gunakan Drizzle Kit untuk menyinkronkan skema kode ke Neon Database:

```bash
# Opsi 1: Sinkronisasi langsung skema ke database (Development)
npx drizzle-kit push

# Opsi 2: Buka Drizzle Studio (GUI Browser untuk melihat data)
npx drizzle-kit studio
```

### Menjalankan Server Pengembangan

Jalankan aplikasi di lingkungan lokal:

```bash
npm run dev
```

Buka peramban Anda di [http://localhost:3000](http://localhost:3000) untuk mengakses website SILAPOR-KU.

---

## 💻 Daftar Perintah (Scripts)

| Perintah | Deskripsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan lokal (Next.js Dev Server). |
| `npm run build` | Melakukan kompilasi bundle produksi dan verifikasi tipe data TypeScript. |
| `npm run start` | Menjalankan build produksi secara lokal. |
| `npm run lint` | Menjalankan pengecekan gaya kode dan sintaks dengan ESLint. |
| `npx drizzle-kit push` | Menerapkan perubahan skema `schema.ts` langsung ke database Neon. |
| `npx drizzle-kit generate` | Menghasilkan berkas migrasi SQL statis di folder `drizzle/`. |
| `npx drizzle-kit studio` | Membuka antarmuka web visual untuk mengelola database lokal/cloud. |

---

## 👥 Matriks Hak Akses Pengguna

| Fitur / Aksi | Warga (Publik) | Admin Nagari | Wali Nagari |
| :--- | :---: | :---: | :---: |
| Mengisi Formulir Pengaduan/Aspirasi | ✅ | ✅ | ✅ |
| Melampirkan Foto Bukti Kejadian (**Wajib, min 1 foto**) | ✅ | ✅ | ✅ |
| Opsi Pengiriman Anonim | ✅ | ❌ | ❌ |
| Melacak Progres via Kode Tiket | ✅ | ✅ | ✅ |
| Mengakses Dashboard Operasional (Antrean Laporan & Aksi Cepat) | ❌ | ✅ | ❌ |
| Mengakses Dashboard Eksekutif (Statistik Makro & Analitik) | ❌ | ❌ | ✅ |
| Melihat Daftar Semua Laporan Masuk | ❌ | ✅ | ✅ |
| Melihat Rincian Lengkap & Foto Resolusi Penuh | ❌ (Hanya via Tiket) | ✅ (Akses CRUD) | ✅ (**Read-Only**) |
| Mengubah Status (*Menunggu $\rightarrow$ Diproses $\rightarrow$ Selesai/Tolak*) | ❌ | ✅ | ❌ |
| Menambahkan Catatan Resmi Tindak Lanjut | ❌ | ✅ | ❌ |
| Mencetak Rekapitulasi Laporan Nagari | ❌ | ✅ | ✅ |

---

## ☁️ Panduan Deployment (Vercel + Neon)

Proyek ini telah dikonfigurasi untuk integrasi otomatis (*Continuous Deployment*) ke **Vercel**:

1. **Persiapkan Database Neon**:
   - Buat proyek baru di [Neon Console](https://console.neon.tech/).
   - Salin string koneksi pooled `DATABASE_URL` (dengan parameter `?sslmode=require`).
2. **Sambungkan Repositori ke Vercel**:
   - Buka [Vercel Dashboard](https://vercel.com/new).
   - Impor repositori GitHub `SILAPOR-KU`.
   - Pilih preset **Next.js**.
3. **Konfigurasi Environment Variables di Vercel**:
   - Masukkan `DATABASE_URL` dan `SESSION_SECRET` pada tab **Environment Variables**.
4. **Deploy**:
   - Klik **Deploy**. Vercel akan secara otomatis menjalankan `npm run build` dan mendistribusikan aplikasi secara global melalui jaringan serverless/edge.
   - Setiap *commit* atau *pull request* baru ke branch `main` akan memicu *auto-build* dan pembaruan deployment secara instan.

---

## 👥 Informasi Proyek & Tim

- **Mata Kuliah**: Proyek Sistem Informasi (Semester 5)
- **Nama Tim**: **IS-SIA**
- **Mitra / Pemilik Proyek**: **Pemerintah Nagari Kambang Utara**, Kecamatan Lengayang, Kabupaten Pesisir Selatan, Sumatera Barat.
- **Tahun**: 2026

---

<p align="center">
  Dibuat dengan dedikasi untuk transparansi dan kemajuan pelayanan publik Nagari Kambang Utara. 🇮🇩
</p>
