# Product Requirements Document (PRD)
## SILAPOR-KU (Sistem Informasi Layanan Pengaduan Nagari Kambang Utara)

---

| Informasi Dokumen | Detail |
| :--- | :--- |
| **Nama Proyek** | SILAPOR-KU |
| **Pemilik Proyek (Project Owner)** | Pemerintahan Nagari Kambang Utara |
| **Tim Pengembang** | IS-SIA |
| **Versi Dokumen** | 1.1 (Revisi Hasil Klarifikasi Kebutuhan Tim & Stakeholder) |
| **Tanggal Terbit** | 24 Oktober 2026 |
| **Status** | Disetujui (Approved) |

---

## 1. Pendahuluan & Latar Belakang

### 1.1 Problem Statement
Pengelolaan pengaduan dan aspirasi masyarakat merupakan pilar penting dalam pelayanan publik di Nagari Kambang Utara. Saat ini, warga membutuhkan sarana yang mudah dan cepat untuk menyampaikan keluhan serta aspirasi, sementara aparatur nagari membutuhkan mekanisme yang terstruktur untuk menerima, memvalidasi, menindaklanjuti, dan memantau status penanganan laporan.

Tantangan yang dihadapi:
- Belum tersedianya sarana pelaporan terpadu yang dapat diakses secara fleksibel dari peramban ponsel pintar maupun komputer.
- Ketiadaan nomor rujukan/tiket unik yang transparan bagi warga untuk memantau sejauh mana laporannya telah diproses.
- Ketiadaan dashboard pemantauan terpusat bagi Wali Nagari dan aparatur nagari untuk mengevaluasi volume keluhan per wilayah jorong dan kategori isu pelayanan publik.

Oleh karena itu, **SILAPOR-KU** dikembangkan sebagai platform berbasis web responsif untuk menjembatani komunikasi publik antara warga dan Pemerintah Nagari Kambang Utara melalui pelaporan transparan, kode tiket unik, dan pemantauan real-time.

### 1.2 Target Pengguna (User Persona)

Sistem melayani tiga aktor utama dengan karakteristik dan wewenang yang berbeda:

```mermaid
graph TD
    A[Pengguna SILAPOR-KU] --> B[Warga Nagari Kambang Utara]
    A --> C[Admin Nagari]
    A --> D[Wali Nagari]

    B -->|Aksi| B1[Kirim Laporan Wajib Foto Bukti]
    B -->|Aksi| B2[Lacak Status via Tiket]
    
    C -->|Aksi| C1[Akses Dashboard Operasional & Antrean Kerja]
    C -->|Aksi| C2[Verifikasi Laporan & Buka Detail]
    C -->|Aksi| C3[Ubah Status & Beri Catatan Tindak Lanjut - CRUD]
    
    D -->|Aksi| D1[Akses Dashboard Eksekutif Makro]
    D -->|Aksi| D2[Buka Detail Laporan & Riwayat - Read Only]
    D -->|Aksi| D3[Evaluasi Statistik & Tren Kebijakan]
```

#### 1. Warga Nagari Kambang Utara
* **Peran**: Penyampai pengaduan atau aspirasi publik.
* **Karakteristik & Kebutuhan**:
  - Membutuhkan formulir yang simpel tanpa perlu mengunduh aplikasi terpisah (berbasis web).
  - Mengunggah detail aduan: judul, deskripsi, kategori, wilayah jorong, koordinat/patokan lokasi, dan **wajib melampirkan foto bukti kejadian**.
  - Opsi menyampaikan laporan dengan identitas jelas atau secara **anonim**.
  - Memperoleh **kode tiket unik** untuk melacak perkembangan status penanganan laporan secara mandiri.

#### 2. Admin Nagari
* **Peran**: Pengelola operasional harian laporan yang masuk.
* **Karakteristik & Kebutuhan**:
  - Memiliki akun kredensial terotentikasi.
  - Memiliki akses ke **Dashboard Operasional** untuk memantau antrean laporan baru yang masuk dan status penanganannya.
  - Memeriksa keabsahan laporan, lampiran bukti foto resolusi penuh, dan detail lokasi kejadian.
  - Mengelola siklus hidup laporan (CRUD): memperbarui status (*Menunggu Pemeriksaan*, *Diproses*, *Selesai*, *Ditolak*).
  - Memberikan catatan progres penanganan resmi (*progress notes* / audit trail).

#### 3. Wali Nagari Kambang Utara
* **Peran**: Pimpinan eksekutif nagari untuk monitoring, evaluasi, dan pengambilan kebijakan pelayanan publik.
* **Karakteristik & Kebutuhan**:
  - Akses utama berfokus pada **Dashboard Eksekutif** (analitik makro) secara real-time.
  - Memiliki wewenang untuk **membuka dan melihat rincian detail laporan secara langsung** (*Read-Only*) guna meninjau bukti foto dan kronologi penanganan secara transparan, tanpa wewenang mengubah data operasional/CRUD.
  - Mengetahui volume total pengaduan, sebaran per jorong, kategori terbanyak, serta tingkat penyelesaian (*completion rate*).
  - Menjadikan data statistik sebagai landasan evaluasi kinerja aparatur nagari.

### 1.3 User Needs & Pain Points
| Pain Point Terdahulu | Kebutuhan Pengguna | Solusi SILAPOR-KU |
| :--- | :--- | :--- |
| Laporan tanpa bukti fisik sulit diverifikasi | Validitas fakta di lapangan terjamin | **Wajib menyertakan minimal 1 foto bukti** (maks 5MB/foto, multi-upload) |
| Warga tidak tahu nasib laporannya setelah disampaikan | Kepastian dan transparansi proses | Pelacakan publik instan berbasis Kode Tiket unik |
| Rekapitulasi laporan tercecer dan lambat | Pengelolaan arsip keluhan yang tertata | Dashboard Operasional Admin & manajemen riwayat tindak lanjut |
| Pimpinan kesulitan memetakan masalah krusial di tiap jorong | Visualisasi data untuk bahan evaluasi | Dashboard Eksekutif Wali Nagari + Akses Detail Laporan (Read-Only) |
| Ketakutan warga akan intimidasi identitas saat melapor | Jaminan privasi dan kerahasiaan | Opsi pelaporan anonim dengan proteksi data pelapor |

### 1.4 Tujuan Proyek (Project Goal)
Mengembangkan website SILAPOR-KU sebagai sarana digital yang memudahkan masyarakat Nagari Kambang Utara dalam menyampaikan pengaduan dan aspirasi serta memantau status penanganan laporan melalui kode tiket. Sistem ini juga bertujuan membantu aparatur nagari mengelola laporan secara terstruktur melalui Dashboard Operasional dan mendukung pemantauan eksekutif pimpinan nagari melalui Dashboard Eksekutif terintegrasi.

---

## 2. Kebutuhan Produk (Product Requirements)

### 2.1 Kebutuhan Fungsional (Functional Requirements)

#### Modul A: Pelaporan Pengaduan dan Aspirasi
| ID | Kebutuhan Fungsional |
| :--- | :--- |
| **FR-01** | Sistem menyediakan formulir bagi warga untuk menyampaikan pengaduan atau aspirasi. |
| **FR-02** | Sistem memungkinkan warga mengisi informasi laporan: judul, kategori, deskripsi, dan wilayah jorong. |
| **FR-03** | **Sistem mewajibkan warga melampirkan foto bukti kejadian (minimal 1 foto, dapat mengunggah lebih dari 1 foto)** serta informasi koordinat (GPS) dan patokan lokasi kejadian. |
| **FR-04** | Sistem menyediakan pilihan pelaporan menggunakan identitas pelapor atau secara anonim. |
| **FR-05** | **Sistem memvalidasi kelengkapan data wajib dan berkas lampiran** (memastikan minimal terdapat 1 foto bukti valid berformat gambar dengan ukuran $\le 5$ MB per foto) sebelum formulir dapat dikirimkan. |
| **FR-06** | Sistem menyimpan laporan yang valid dan mengenerate **kode tiket unik** otomatis sebagai tanda pengenal. |
| **FR-07** | Sistem menampilkan halaman konfirmasi pengiriman yang memuat kode tiket dan tautan pelacakan. |
| **FR-08** | Sistem menampilkan notifikasi kesalahan informatif jika pengiriman gagal atau data tidak valid (misal: belum melampirkan foto atau ukuran melebihi batas). |

#### Modul B: Pelacakan Status Laporan
| ID | Kebutuhan Fungsional |
| :--- | :--- |
| **FR-09** | Sistem menyediakan fitur pelacakan laporan berbasis pencarian kode tiket unik. |
| **FR-10** | Sistem menampilkan rincian laporan yang sesuai dengan kode tiket valid tanpa membocorkan identitas privat publik. |
| **FR-11** | Sistem menampilkan status penanganan laporan: `Menunggu Pemeriksaan`, `Diproses`, `Selesai`, atau `Ditolak`. |
| **FR-12** | Sistem menyajikan lini masa (*timeline*) pembaruan status dan catatan penanganan terkini dari aparatur. |

#### Modul C: Autentikasi dan Akses Aparatur
| ID | Kebutuhan Fungsional |
| :--- | :--- |
| **FR-13** | Sistem menyediakan mekanisme login aman untuk aparatur nagari menggunakan username dan kata sandi terenkripsi. |
| **FR-14** | Sistem membatasi hak akses halaman dan tindakan (*Role-Based Access Control*) antara Admin Nagari dan Wali Nagari. |
| **FR-15** | Sistem menyediakan fungsi logout untuk mengakhiri sesi autentikasi dengan aman. |

#### Modul D: Pengelolaan Laporan oleh Aparatur
| ID | Kebutuhan Fungsional |
| :--- | :--- |
| **FR-16** | Sistem menampilkan daftar seluruh laporan masyarakat dengan filter status, kategori, jorong, dan rentang tanggal. |
| **FR-17** | **Sistem menyediakan halaman detail laporan yang dapat diakses oleh Admin Nagari (akses penuh/CRUD) dan Wali Nagari (akses peninjauan menyeluruh/Read-Only)**, memuat seluruh foto bukti resolusi penuh, lokasi peta/koordinat, riwayat tindak lanjut, dan data pelapor (jika non-anonim). |
| **FR-18** | Sistem memungkinkan Admin Nagari memperbarui status penanganan laporan (`Menunggu Pemeriksaan` $\rightarrow$ `Diproses` $\rightarrow$ `Selesai` / `Ditolak`). |
| **FR-19** | Sistem memungkinkan Admin Nagari mencantumkan catatan penanganan resmi untuk setiap tahapan tindak lanjut. |
| **FR-20** | Sistem mencatat riwayat perubahan status, aparatur yang menangani, serta stempel waktu (*audit trail*). |

#### Modul E: Dashboard Pemantauan & Analitik
| ID | Kebutuhan Fungsional |
| :--- | :--- |
| **FR-21** | **Sistem menyediakan dashboard berbasis peran untuk aparatur nagari (Admin Nagari dan Wali Nagari) dengan tampilan yang disesuaikan**: <br>• **Dashboard Wali Nagari**: Fokus pada ringkasan analitik makro, tren kategori keluhan, sebaran jorong, dan evaluasi persentase penyelesaian.<br>• **Dashboard Admin Nagari**: Fokus pada antrean operasional kerja harian (*actionable*), daftar laporan baru yang perlu diverifikasi segera, dan pintasan tindak lanjut cepat. |
| **FR-22** | Sistem menampilkan metrik total laporan masuk, laporan selesai, laporan diproses, dan laporan ditolak. |
| **FR-23** | Sistem menampilkan grafik ringkasan distribusi laporan berdasarkan kategori keluhan/aspirasi. |
| **FR-24** | Sistem menampilkan grafik sebaran laporan berdasarkan wilayah jorong di Nagari Kambang Utara. |
| **FR-25** | Sistem memperbarui metrik visual dashboard secara dinamis berdasarkan data terkini database. |

#### Modul F: Penanganan Kondisi Kesalahan & Validasi
| ID | Kebutuhan Fungsional |
| :--- | :--- |
| **FR-26** | Sistem menampilkan peringatan jika kode tiket pelacakan tidak ditemukan atau salah format. |
| **FR-27** | Sistem mengalihkan pengguna dan memunculkan notifikasi akses ditolak jika mencoba mengakses halaman tanpa otorisasi. |
| **FR-28** | Sistem memberikan umpan balik langsung jika berkas lampiran tidak disertakan, melebihi batas ukuran 5 MB per foto, atau format berkas bukan gambar. |

---

### 2.2 Kebutuhan Non-Fungsional (Non-Functional Requirements)

| ID | Parameter | Spesifikasi & Batasan |
| :--- | :--- | :--- |
| **NFR-01** | **Kinerja (Performance)** | Waktu muat halaman utama dan pelacakan ditargetkan $\le 3$ detik pada koneksi internet seluler standar (4G). |
| **NFR-02** | **Kemudahan Penggunaan (Usability)** | Seluruh antarmuka menggunakan Bahasa Indonesia formal & komunikatif, tata letak intuitif, dan tombol aksi yang jelas. |
| **NFR-03** | **Kompatibilitas** | Berjalan mulus di seluruh peramban modern (Chrome, Safari, Firefox, Edge) pada desktop, tablet, dan smartphone. |
| **NFR-04** | **Responsivitas UI** | Desain sepenuhnya *mobile-responsive* menggunakan Tailwind CSS flex/grid layout tanpa kerusakan komponen pada resolusi kecil ($\ge 360px$). |
| **NFR-05** | **Keamanan Data** | Kredensial akun aparatur di-hash dengan algoritma aman (misal: bcrypt/argon2), tidak disimpan dalam teks polos (*plain text*). |
| **NFR-06** | **Kontrol Akses** | Proteksi endpoint dan *Server Actions* dengan validasi sesi role pengguna (Wali Nagari *read-only* pada mutasi status, Admin Nagari berhak CRUD). |
| **NFR-07** | **Privasi & Kerahasiaan** | Identitas pelapor yang memilih opsi *anonim* disamarkan dari publik dan hanya metadata laporan esensial yang diekspos di fitur pelacakan. |
| **NFR-08** | **Keandalan (Reliability)** | Penyimpanan data persisten di PostgreSQL dengan ketersediaan tinggi (*high-availability*) via Neon Serverless. |
| **NFR-09** | **Integritas Data** | Penggunaan *foreign key constraints*, schema validation (Zod), dan *type-safe query* (Drizzle ORM) untuk mencegah data *corrupt*. |
| **NFR-10** | **Error Handling** | Pesan galat user-friendly yang tidak membocorkan stack trace, struktur database, atau rahasia server ke sisi klien. |
| **NFR-11** | **Maintainability** | Struktur kode modular Next.js App Router (`src/app`, `src/components`, `src/db`, `src/lib`) dengan panduan TypeScript ketat. |
| **NFR-12** | **Resiliensi Jaringan** | Penanganan *network error* yang anggun (*graceful fallback*) saat perangkat pengguna mengalami gangguan sinyal. |
| **NFR-13** | **Manajemen Lampiran (Foto Bukti)** | **Ketentuan Lampiran:** <br>1. **Sifat**: **Wajib** melampirkan minimal 1 foto bukti kejadian. Pengguna dapat melampirkan lebih dari 1 foto (*multiple uploads*).<br>2. **Format**: **Hanya format gambar/foto** yang diizinkan (`JPG`, `JPEG`, `PNG`, `WebP`). Format dokumen (.docx, .xlsx, .pdf, dll.) tidak diizinkan.<br>3. **Ukuran**: Maksimal **5 MB per berkas foto**.<br>4. **Validasi**: Sistem menolak submit formulir jika tidak ada foto bukti yang dilampirkan. |
| **NFR-14** | **Pencadangan (Backup)** | Mengandalkan fitur point-in-time recovery dan branch snapshot dari infrastruktur database serverless Neon. |

---

## 3. Alur Pengguna (User Flows)

```mermaid
sequenceDiagram
    autonumber
    actor Warga
    participant Web as Antarmuka Web
    participant Server as Server Next.js
    participant DB as Neon Database
    actor Admin as Admin Nagari
    actor Wali as Wali Nagari

    Note over Warga, DB: 1. Alur Pembuatan Laporan (Wajib Foto)
    Warga->>Web: Isi formulir (judul, jorong, kategori, upload foto bukti min 1, lokasi)
    Web->>Server: Kirim formulir via Server Action
    Server->>Server: Validasi input & verifikasi keberadaan foto bukti (<= 5MB)
    Server->>Server: Generate Kode Tiket unik
    Server->>DB: Simpan data (pelapor, laporan, lampiran foto)
    DB-->>Server: Konfirmasi sukses simpan
    Server-->>Web: Tampilkan Kode Tiket (mis: SLP-202610-ABCD)
    Web-->>Warga: Tampilkan layar sukses & simpan kode tiket

    Note over Warga, DB: 2. Alur Pelacakan Laporan Publik
    Warga->>Web: Masukkan Kode Tiket pada menu Lacak
    Web->>Server: Query detail laporan berdasarkan kode
    Server->>DB: Cari laporan & riwayat tindak lanjut
    DB-->>Server: Kembalikan data laporan & timeline
    Server-->>Web: Render data laporan & status
    Web-->>Warga: Tampilkan status (Menunggu/Diproses/Selesai/Ditolak)

    Note over Admin, DB: 3. Alur Kerja Admin Nagari (Operasional / CRUD)
    Admin->>Web: Login menggunakan akun admin
    Web->>Admin: Tampilkan Dashboard Operasional (Antrean Laporan Baru)
    Admin->>Web: Buka detail laporan & periksa foto bukti
    Admin->>Web: Ubah status menjadi "Diproses" / "Selesai" + Tambah Catatan
    Web->>Server: Submit pembaruan status
    Server->>DB: Simpan pembaruan status & tabel tindak_lanjut
    DB-->>Server: Sukses disimpan
    Server-->>Web: Perbarui status laporan

    Note over Wali, DB: 4. Alur Kerja Wali Nagari (Eksekutif / Read-Only)
    Wali->>Web: Login menggunakan akun wali nagari
    Web->>Wali: Tampilkan Dashboard Eksekutif (Statistik, Tren Jorong, KPI)
    Wali->>Web: Klik salah satu laporan untuk melihat Detail Lengkap (Read-Only)
    Web->>Server: Query detail laporan & riwayat tindak lanjut
    Server-->>Web: Tampilkan detail lengkap & foto bukti tanpa tombol edit/ubah status
```

---

## 4. Kebutuhan Data & Skema Relasional (Data Requirements)

Data disimpan secara relasional pada database PostgreSQL dengan relasi sebagai berikut:
- **1 Laporan** wajib memiliki **$\ge 1$ Lampiran** foto bukti kejadian (*one-to-many*).

```mermaid
erDiagram
    JORONG ||--o{ LAPORAN : "menjadi lokasi"
    KATEGORI ||--o{ LAPORAN : "mengelompokkan"
    PELAPOR ||--o{ LAPORAN : "menyampaikan"
    LAPORAN ||--|{ LAMPIRAN : "wajib memiliki bukti foto (min 1)"
    LAPORAN ||--o{ TINDAK_LANJUT : "memiliki riwayat"
    APARATUR ||--o{ TINDAK_LANJUT : "menangani"

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
        varchar peran "admin | wali_nagari"
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
        varchar jenis_laporan "pengaduan | aspirasi"
        varchar judul_laporan
        text deskripsi_laporan
        numeric koordinat_lintang
        numeric koordinat_bujur
        text patokan_lokasi
        varchar status_laporan "menunggu | diproses | selesai | ditolak"
        timestamp waktu_dibuat
        timestamp waktu_selesai
    }

    LAMPIRAN {
        varchar id_lampiran PK
        varchar id_laporan FK
        varchar nama_berkas
        varchar jalur_berkas
        varchar tipe_berkas "image/jpeg, image/png, image/webp"
        integer ukuran_berkas "maksimal 5242880 byte (5MB)"
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

## 5. Batasan & Asumsi (Constraints & Assumptions)

### 5.1 Batasan (Constraints)
1. **Platform**: Berbasis web responsif. Tidak dikembangkan menjadi aplikasi *native* Android (APK) atau iOS pada rilis 1.0.
2. **Konektivitas**: Membutuhkan sambungan internet aktif untuk pengiriman laporan, pelacakan, dan pembaruan data.
3. **Format Lampiran**: Hanya menerima berkas gambar/foto (JPG, JPEG, PNG, WebP) dengan batas ukuran maksimal 5 MB per berkas.
4. **Waktu Pengerjaan**: Terikat oleh batas waktu proyek perkuliahan Semester 5.

### 5.2 Asumsi (Assumptions)
1. Mayoritas warga memiliki akses smartphone atau komputer dengan peramban modern dan kamera.
2. Aparatur nagari aktif memeriksa laporan masuk secara berkala setiap hari kerja.
3. Seluruh jorong di Nagari Kambang Utara telah teridentifikasi sebagai referensi baku sistem.

---

## 6. Ruang Lingkup (Scope of Work)

### 6.1 Dalam Ruang Lingkup (In-Scope)
- Antarmuka publik responsif untuk penyampaian pengaduan dan aspirasi.
- **Formulir pengaduan dengan validasi wajib melampirkan minimal 1 foto bukti** (format gambar, maks 5 MB per berkas, mendukung multi-upload).
- Input koordinat GPS dan patokan lokasi kejadian.
- Mode pelaporan beridentitas maupun secara anonim.
- Modul pelacakan real-time menggunakan kode tiket unik.
- Sistem autentikasi aparatur dengan kontrol peran (Admin Nagari & Wali Nagari).
- **Dashboard berbasis peran**:
  - **Dashboard Operasional untuk Admin Nagari** (antrean verifikasi laporan dan pintasan tindak lanjut).
  - **Dashboard Eksekutif untuk Wali Nagari** (rekapitulasi analitik makro, tren kategori, dan sebaran jorong).
- **Halaman Detail Laporan**:
  - Akses penuh (CRUD) bagi Admin Nagari untuk pembaruan status dan penambahan catatan penanganan.
  - Akses peninjauan menyeluruh (*Read-Only*) bagi Wali Nagari untuk menelaah bukti dan kronologi laporan.

### 6.2 Di Luar Ruang Lingkup (Out-of-Scope)
- Eksekusi teknis perbaikan fisik di lapangan dan pencairan anggaran APB-Nagari.
- Integrasi langsung dengan API Kependudukan Nasional (Dukcapil) untuk validasi NIK.
- Portal berita atau fitur promosi pariwisata nagari.
- Pengunggahan dokumen non-foto (.docx, .xlsx, .pdf).
- Pembuatan aplikasi native mobile di Google Play Store atau Apple App Store.

---

## 7. Kriteria Keberhasilan (Success Criteria)

1. **Kelengkapan Laporan**: **100% laporan yang berhasil dikirimkan telah dilengkapi foto bukti yang valid**, karena berkas foto bukti merupakan validasi wajib (*mandatory*) di sisi sistem sebelum formulir dapat diproses.
2. **Kemudahan Penggunaan (Usability)**: Warga dapat menyelesaikan pengisian dan submit formulir laporan dalam waktu $\le 3$ menit.
3. **Transparansi Sistem**: 100% laporan tersimpan berhasil memperoleh kode tiket unik dan statusnya dapat diverifikasi di halaman pelacakan.
4. **Kesiapan Informasi Pimpinan**: Dashboard Wali Nagari menyajikan visualisasi data yang akurat dan *real-time*, serta pimpinan dapat membuka detail laporan secara langsung untuk memverifikasi laporan di lapangan.
