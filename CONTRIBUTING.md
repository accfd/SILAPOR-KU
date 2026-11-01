# Panduan Kolaborasi Tim & Alur Git (Git Workflow)
## Proyek SILAPOR-KU — Milestone 3 (Executing & Coding)

Dokumen ini merupakan pedoman teknis wajib bagi seluruh anggota tim pengembang sistem (IS-SIA) agar proses penulisan kode terstruktur, rapi, dan tidak terjadi konflik (*merge conflict*) di repositori utama.

---

## ⚠️ Aturan Utama (Golden Rules)
1. **DILARANG KERAS melakukan commit atau push langsung ke branch `main`.** Branch `main` hanya diperuntukkan bagi kode yang sudah stabil dan lolos verifikasi.
2. Seluruh pengerjaan fitur wajib dilakukan pada **branch fitur masing-masing** sesuai peran/jobdesk:
   - Tim Frontend (Akbar & Ashyra): `feat/frontend-ui`
   - Tim Backend (Lutfi & Dea): `feat/backend-logic`
3. Sebelum membuat branch atau mulai koding, pastikan selalu menarik perubahan terbaru dari `main` (`git pull origin main`).
4. Gunakan pesan commit yang jelas dan deskriptif (mengikuti konvensi *Conventional Commits*).

---

## 🚀 Panduan Setup Awal di Komputer Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/accfd/SILAPOR-KU.git
cd SILAPOR-KU
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file template `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Buka file `.env` dan sesuaikan connection string Neon PostgreSQL serta kunci sesi:
```env
DATABASE_URL="postgresql://[user]:[password]@[neon_host]/[dbname]?sslmode=require"
SESSION_SECRET="string-acak-minimal-32-karakter"   # openssl rand -base64 32
```

### 4. Sinkronisasi Skema Database (Drizzle)
Dorong skema (`src/db/schema.ts`) ke database Neon, lalu isi data awal (jorong, kategori, akun aparatur):
```bash
npm run db:push
npm run db:seed
```
`db:seed` mencetak kata sandi sementara akun `admin` dan `walinagari` **sekali saja** (atau pakai
`SEED_ADMIN_PASSWORD` / `SEED_WALI_PASSWORD` di `.env`). Setelah mengubah skema, buat berkas migrasi dengan
`npm run db:generate` dan commit folder `drizzle/`.

*(Opsional) Untuk melihat data tabel secara visual di browser:*
```bash
npm run db:studio
```

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 🌿 Alur Kerja Git Sesuai Role

### A. Alur Kerja Tim Frontend (Akbar & Ashyra)
Fokus pengerjaan antarmuka pengguna:
* Formulir Pengaduan Warga (`/lapor`)
* Pelacakan Tiket Mandiri (`/cek-tiket`)
* UI Dasbor Admin Nagari (`/admin/dashboard`)
* UI Dasbor Eksekutif Wali Nagari (`/wali-nagari/dashboard`)

```bash
# 1. Pastikan berada di main dan update terbaru
git checkout main
git pull origin main

# 2. Buat atau pindah ke branch frontend
git checkout -b feat/frontend-ui
# (atau jika branch sudah ada: git checkout feat/frontend-ui)

# 3. Lakukan pengkodean komponen UI...

# 4. Commit dan push ke remote branch
git add .
git commit -m "feat(ui): perbaiki tata letak formulir pengaduan warga"
git push -u origin feat/frontend-ui
```

---

### B. Alur Kerja Tim Backend (Lutfi & Dea)
Fokus pengerjaan backend, integrasi database, dan pengujian:
* Setup & relasi database Neon PostgreSQL di `src/db/schema.ts` (Drizzle ORM)
* Logika Server Actions di `src/lib/actions/` (`laporan.ts`, `tindak-lanjut.ts`, `auth.ts`)
* Hashing password kredensial staf (bcrypt) & otentikasi sesi/cookie (`src/lib/auth.ts`, `src/lib/session.ts`)
* Verifikasi fungsi & pengujian sistem (Quality Assurance)

```bash
# 1. Pastikan berada di main dan update terbaru
git checkout main
git pull origin main

# 2. Buat atau pindah ke branch backend
git checkout -b feat/backend-logic
# (atau jika branch sudah ada: git checkout feat/backend-logic)

# 3. Lakukan pengkodean logika server / DB...

# 4. Commit dan push ke remote branch
git add .
git commit -m "feat(api): lengkapi server action otentikasi staf nagari"
git push -u origin feat/backend-logic
```

---

## 🔀 Alur Penggabungan Kode (Pull Request / PR)

1. Ketika modul pada branch fitur telah selesai dan diuji di lokal:
   * Buka repositori di GitHub: [https://github.com/accfd/SILAPOR-KU](https://github.com/accfd/SILAPOR-KU)
   * Klik tombol **Compare & pull request**.
   * Pastikan target branch adalah `base: main` $\leftarrow$ `compare: feat/frontend-ui` (atau `feat/backend-logic`).
   * Berikan judul dan deskripsi perubahan secara ringkas.
2. Koordinasikan dengan Fuad (PM) atau rekan tim untuk *Code Review*.
3. Setelah disetujui, branch dapat di-*merge* ke `main`.

---

## 📁 Struktur Direktori Standar Proyek
```text
SILAPOR-KU/
├── docs/                 # Dokumen PRD, BPMN, dan spesifikasi perancangan
├── drizzle/              # Migrasi SQL hasil drizzle-kit (di-commit)
├── drizzle.config.ts     # Konfigurasi Drizzle Kit
├── public/               # Asset statis publik (favicon, icon, dsb)
├── src/
│   ├── db/               # Koneksi Neon (index.ts), skema 7 tabel (schema.ts), seed.ts
│   ├── app/              # Next.js App Router (Routing halaman)
│   │   ├── admin/        # /admin/login & /admin/dashboard
│   │   ├── cek-tiket/    # /cek-tiket (Lacak laporan mandiri)
│   │   ├── lapor/        # /lapor (Formulir pelaporan warga)
│   │   ├── wali-nagari/  # /wali-nagari/dashboard (Dasbor eksekutif)
│   │   ├── layout.tsx    # Layout induk aplikasi (Navbar & Footer)
│   │   └── page.tsx      # Beranda utama
│   ├── components/       # Komponen reusable UI (Navbar, Footer, Modal, StatusBadge, Card)
│   ├── lib/              # actions/ (Server Actions), auth.ts, session.ts, validations.ts (Zod), utils.ts
│   ├── proxy.ts          # Pengarah akses halaman aparatur (cek cookie sesi)
│   └── types/            # Tipe antarmuka & kontrak DTO TypeScript
├── .env.example          # Panduan variabel lingkungan
├── CONTRIBUTING.md       # Pedoman Git dan alur kolaborasi tim (file ini)
├── package.json          # Manajemen dependensi dan skrip proyek
└── tsconfig.json         # Konfigurasi TypeScript
```
