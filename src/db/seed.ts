/**
 * Seed data referensi & akun aparatur awal. Jalankan: npm run db:seed
 *
 * Idempoten: aman dijalankan berulang (jorong/kategori/aparatur yang sudah ada dilewati).
 * Kata sandi akun diambil dari SEED_ADMIN_PASSWORD / SEED_WALI_PASSWORD; bila kosong dibuat acak
 * dan dicetak sekali di terminal. Tidak ada kata sandi bawaan yang tertulis di repositori.
 *
 * Tidak mengimpor src/db/index.ts karena modul itu bertanda `server-only` dan tidak dapat dijalankan di luar Next.js.
 */
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { aparatur, jorong, kategori } from "./schema";

config({ path: [".env.local", ".env"] });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diatur di .env.local / .env");
}

const db = drizzle(neon(process.env.DATABASE_URL));

// TODO: ganti dengan daftar jorong resmi Nagari Kambang Utara dari pihak nagari (PRD asumsi 5.2 poin 3).
// Daftar ini disalin dari placeholder di formulir frontend.
const DAFTAR_JORONG = [
  "Jorong Pasar Gompong",
  "Jorong Kambang Barat",
  "Jorong Kambang Timur",
  "Jorong Muara Air",
  "Jorong Koto Berapak",
];

const DAFTAR_KATEGORI = [
  { nama_kategori: "Infrastruktur Jalan & Jembatan", deskripsi_kategori: "Jalan rusak, jembatan, drainase, dan sarana transportasi nagari." },
  { nama_kategori: "Fasilitas Umum & Penerangan Jalan", deskripsi_kategori: "Lampu jalan, fasilitas umum, dan sarana publik lainnya." },
  { nama_kategori: "Kebersihan Lingkungan & Sampah", deskripsi_kategori: "Pengelolaan sampah dan kebersihan lingkungan." },
  { nama_kategori: "Pelayanan Administrasi Nagari", deskripsi_kategori: "Layanan surat-menyurat dan administrasi kependudukan nagari." },
  { nama_kategori: "Bantuan Sosial & Kemasyarakatan", deskripsi_kategori: "Penyaluran bantuan sosial dan kegiatan kemasyarakatan." },
  { nama_kategori: "Keamanan & Ketertiban Umum", deskripsi_kategori: "Gangguan keamanan dan ketertiban di lingkungan nagari." },
  { nama_kategori: "Lainnya", deskripsi_kategori: "Aspirasi atau pengaduan di luar kategori di atas." },
];

const AKUN = [
  { username: "admin", nama_lengkap: "Admin Nagari Kambang Utara", peran: "admin" as const, envPassword: "SEED_ADMIN_PASSWORD" },
  { username: "walinagari", nama_lengkap: "Wali Nagari Kambang Utara", peran: "wali_nagari" as const, envPassword: "SEED_WALI_PASSWORD" },
];

async function main() {
  await db.insert(jorong).values(DAFTAR_JORONG.map((nama_jorong) => ({ nama_jorong }))).onConflictDoNothing();
  await db.insert(kategori).values(DAFTAR_KATEGORI).onConflictDoNothing();
  console.log(`Jorong & kategori siap (${DAFTAR_JORONG.length} jorong, ${DAFTAR_KATEGORI.length} kategori).`);

  for (const akun of AKUN) {
    const diberikan = process.env[akun.envPassword];
    if (diberikan !== undefined && diberikan.length < 8) {
      throw new Error(`${akun.envPassword} minimal 8 karakter.`);
    }
    const password = diberikan ?? randomBytes(9).toString("base64url");

    const dibuat = await db
      .insert(aparatur)
      .values({
        username: akun.username,
        nama_lengkap: akun.nama_lengkap,
        peran: akun.peran,
        password_hash: await bcrypt.hash(password, 12),
      })
      .onConflictDoNothing()
      .returning({ username: aparatur.username });

    if (dibuat.length === 0) {
      console.log(`Akun "${akun.username}" sudah ada, dilewati (kata sandi tidak diubah).`);
    } else if (diberikan === undefined) {
      console.log(`Akun "${akun.username}" dibuat. Kata sandi sementara (catat sekarang, tidak ditampilkan lagi): ${password}`);
    } else {
      console.log(`Akun "${akun.username}" dibuat dengan kata sandi dari ${akun.envPassword}.`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
