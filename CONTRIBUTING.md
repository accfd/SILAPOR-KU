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
Buka file `.env` dan sesuaikan connection string Neon PostgreSQL:
```env
DATABASE_URL="postgresql://[user]:[password]@[neon_host]/[dbname]?sslmode=require"
```

### 4. Sinkronisasi Skema Database (Prisma)
Generate Prisma Client dan dorong skema awal ke database Neon:
```bash
npx prisma generate
npm run db:push
```
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
* Setup & relasi database Neon PostgreSQL di `prisma/schema.prisma`
* Logika Server Actions (`src/actions/ticket.ts` & `src/actions/auth.ts`)
* Hashing password kredensial staf & otentikasi sesi/cookie
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
├── prisma/               # Konfigurasi ORM & Skema Database Neon
│   └── schema.prisma     # Model User & Ticket
├── public/               # Asset statis publik (favicon, icon, dsb)
├── src/
│   ├── actions/          # Next.js Server Actions (ticket.ts, auth.ts)
│   ├── app/              # Next.js App Router (Routing halaman)
│   │   ├── admin/        # /admin/login & /admin/dashboard
│   │   ├── cek-tiket/    # /cek-tiket (Lacak laporan mandiri)
│   │   ├── lapor/        # /lapor (Formulir pelaporan warga)
│   │   ├── wali-nagari/  # /wali-nagari/dashboard (Dasbor eksekutif)
│   │   ├── layout.tsx    # Layout induk aplikasi (Navbar & Footer)
│   │   └── page.tsx      # Beranda utama
│   ├── components/       # Komponen reusable UI (Navbar, Footer, Modal, StatusBadge, Card)
│   ├── lib/              # Prisma client singleton, utils & formatters
│   └── types/            # Tipe antarmuka TypeScript
├── .env.example          # Panduan variabel lingkungan
├── CONTRIBUTING.md       # Pedoman Git dan alur kolaborasi tim (file ini)
├── package.json          # Manajemen dependensi dan skrip proyek
└── tsconfig.json         # Konfigurasi TypeScript
```
