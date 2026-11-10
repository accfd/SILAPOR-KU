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
import { randomBytes, randomUUID } from "node:crypto";
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import {
  aparatur,
  jorong,
  kategori,
  lampiran,
  laporan,
  pelapor,
  tindakLanjut,
} from "./schema";

config({ path: [".env.local", ".env"] });

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diatur di .env.local / .env");
}

const db = drizzle(neon(process.env.DATABASE_URL));

// 8 Jorong resmi Pemerintah Nagari Kambang Utara (Kec. Lengayang, Pesisir Selatan)
const DAFTAR_JORONG = [
  "Lubuk Sarik",
  "Padang Panjang I",
  "Padang Panjang II",
  "Kampung Baru",
  "Ganting Kubang",
  "Pasia Laweh",
  "Kambang Harapan",
  "Kampung Akad",
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

const FOTO_DUMMY =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABACAIAAABqVuVZAAABrElEQVR42u3aMU7EMBCF4WS0B6Cj4RKIBtFTwiHQ3gAKjkDDDRYh0dBDg8QZ0BZIFHRIFNBxBIpQQeLY8czYZP+p17by6XnsrNI+f7w21HAJBAABBBBAAAEEEEAUQJsOdLG6BGhER91I5pcdXSOZ5c5SNBL6zpyBAjpacIZAd4/3ZbOjYiSmOnZGkQ+fbyTW2bEwSnrsTKNW9z/pIY7jw6OyXfl8eVo+QYGwaOVochwmD1RLUCRBTpTyG8qEHInzgTU5Stb3HasETXvg1Bwp6qSGSIrcdJIG6mYndTYpdQ+MHG6xs5LmlIK35NFJ7PpO/MzJPUj94tfbj3xackw/kuKvV3/ndDuwYhZKSJD1y2cXJf/jPJyjRSU63RIvb9V9izOeIAeargrqBEIk6IT3dShBRjonB/s5w89ubzxzJMWz09T9B6700mygzpCREJywkaATNhJ0xu9BzjS/TvTl7l7496v1U8HLkZTVqX+jtZ5f2veeo9Um6Odd7Prhymelz/ev/9iDFm4rbe9sOQ9s+HgBIIAAAggggCiAAAIIIIAAAgggCiCAAAKoqvoGswDQGxpiucMAAAAASUVORK5CYII=";
const UKURAN_FOTO_DUMMY = Buffer.byteLength(FOTO_DUMMY.slice(FOTO_DUMMY.indexOf(",") + 1), "base64");

const LAPORAN_DUMMY = [
  {
    kode_tiket: "SLP-202610-A2CD",
    nama_pelapor: "Andi Saputra",
    nomor_kontak: "081234567801",
    is_anonim: false,
    jorong: "Padang Panjang I",
    kategori: "Infrastruktur Jalan & Jembatan",
    jenis_laporan: "pengaduan" as const,
    judul_laporan: "Jalan berlubang di dekat jembatan",
    deskripsi_laporan: "Terdapat beberapa lubang yang cukup dalam di jalan dekat jembatan. Pengendara perlu memperlambat kendaraan, terutama pada malam hari.",
    patokan_lokasi: "Sekitar 100 meter dari jembatan utama ke arah kantor jorong",
    koordinat_lintang: -1.4012,
    koordinat_bujur: 100.6184,
    status_laporan: "menunggu" as const,
    waktu_dibuat: "2026-10-28T08:15:00+07:00",
    jumlah_foto: 2,
    riwayat: [],
  },
  {
    kode_tiket: "SLP-202610-E3FG",
    nama_pelapor: "Siti Rahma",
    nomor_kontak: "081234567802",
    is_anonim: false,
    jorong: "Lubuk Sarik",
    kategori: "Fasilitas Umum & Penerangan Jalan",
    jenis_laporan: "pengaduan" as const,
    judul_laporan: "Lampu penerangan jalan tidak menyala",
    deskripsi_laporan: "Lampu jalan di persimpangan pasar sudah beberapa malam tidak menyala. Kondisi tersebut membuat jalan gelap saat warga pulang.",
    patokan_lokasi: "Persimpangan Pasar Gompong, dekat halte",
    koordinat_lintang: -1.3978,
    koordinat_bujur: 100.6251,
    status_laporan: "diproses" as const,
    waktu_dibuat: "2026-10-26T19:40:00+07:00",
    jumlah_foto: 1,
    riwayat: [
      { status_tahapan: "diproses" as const, catatan_petugas: "Laporan telah diverifikasi. Petugas sedang memeriksa jaringan dan kondisi lampu di lokasi.", waktu_pembaruan: "2026-10-27T09:00:00+07:00" },
    ],
  },
  {
    kode_tiket: "SLP-202610-H4JK",
    nama_pelapor: null,
    nomor_kontak: null,
    is_anonim: true,
    jorong: "Padang Panjang II",
    kategori: "Kebersihan Lingkungan & Sampah",
    jenis_laporan: "pengaduan" as const,
    judul_laporan: "Tumpukan sampah di saluran air",
    deskripsi_laporan: "Sampah rumah tangga menumpuk di saluran air dan menghambat aliran. Mohon dilakukan pemeriksaan dan pembersihan.",
    patokan_lokasi: "Saluran air di belakang lapangan olahraga",
    koordinat_lintang: -1.4145,
    koordinat_bujur: 100.6372,
    status_laporan: "menunggu" as const,
    waktu_dibuat: "2026-10-25T07:25:00+07:00",
    jumlah_foto: 1,
    riwayat: [],
  },
  {
    kode_tiket: "SLP-202610-L5MN",
    nama_pelapor: "Rina Marlina",
    nomor_kontak: "081234567803",
    is_anonim: false,
    jorong: "Kampung Baru",
    kategori: "Pelayanan Administrasi Nagari",
    jenis_laporan: "pengaduan" as const,
    judul_laporan: "Permohonan surat keterangan belum selesai",
    deskripsi_laporan: "Permohonan surat keterangan yang diajukan telah selesai diproses dan dapat diambil di kantor nagari.",
    patokan_lokasi: "Kantor Wali Nagari Kambang Utara",
    koordinat_lintang: -1.4258,
    koordinat_bujur: 100.6056,
    status_laporan: "selesai" as const,
    waktu_dibuat: "2026-10-22T10:10:00+07:00",
    waktu_selesai: "2026-10-24T14:30:00+07:00",
    jumlah_foto: 1,
    riwayat: [
      { status_tahapan: "diproses" as const, catatan_petugas: "Permohonan sedang diperiksa dan dilengkapi.", waktu_pembaruan: "2026-10-23T09:15:00+07:00" },
      { status_tahapan: "selesai" as const, catatan_petugas: "Surat keterangan telah selesai dan dapat diambil di kantor nagari.", waktu_pembaruan: "2026-10-24T14:30:00+07:00" },
    ],
  },
  {
    kode_tiket: "SLP-202610-P6QR",
    nama_pelapor: "Dedi Kurniawan",
    nomor_kontak: "081234567804",
    is_anonim: false,
    jorong: "Ganting Kubang",
    kategori: "Infrastruktur Jalan & Jembatan",
    jenis_laporan: "pengaduan" as const,
    judul_laporan: "Drainase tersumbat setelah hujan",
    deskripsi_laporan: "Air hujan tidak mengalir lancar karena drainase tersumbat. Genangan mulai masuk ke halaman beberapa rumah.",
    patokan_lokasi: "Jalan lingkungan dekat pos ronda",
    koordinat_lintang: -1.3871,
    koordinat_bujur: 100.6482,
    status_laporan: "diproses" as const,
    waktu_dibuat: "2026-10-20T16:50:00+07:00",
    jumlah_foto: 2,
    riwayat: [
      { status_tahapan: "diproses" as const, catatan_petugas: "Lokasi telah dijadwalkan untuk pemeriksaan dan pembersihan drainase.", waktu_pembaruan: "2026-10-21T08:20:00+07:00" },
    ],
  },
  {
    kode_tiket: "SLP-202610-S7TU",
    nama_pelapor: "Maya Putri",
    nomor_kontak: "081234567805",
    is_anonim: false,
    jorong: "Pasia Laweh",
    kategori: "Bantuan Sosial & Kemasyarakatan",
    jenis_laporan: "aspirasi" as const,
    judul_laporan: "Usulan kegiatan pemeriksaan kesehatan warga",
    deskripsi_laporan: "Warga mengusulkan kegiatan pemeriksaan kesehatan berkala di jorong untuk memudahkan lansia dan keluarga memperoleh layanan.",
    patokan_lokasi: "Balai pertemuan Pasia Laweh",
    koordinat_lintang: -1.3942,
    koordinat_bujur: 100.6214,
    status_laporan: "menunggu" as const,
    waktu_dibuat: "2026-10-18T11:05:00+07:00",
    jumlah_foto: 1,
    riwayat: [],
  },
  {
    kode_tiket: "SLP-202610-V8WX",
    nama_pelapor: null,
    nomor_kontak: null,
    is_anonim: true,
    jorong: "Kambang Harapan",
    kategori: "Infrastruktur Jalan & Jembatan",
    jenis_laporan: "pengaduan" as const,
    judul_laporan: "Perbaikan jembatan kecil telah selesai",
    deskripsi_laporan: "Papan pada jembatan kecil yang sebelumnya rusak telah diperbaiki dan jalur dapat digunakan kembali.",
    patokan_lokasi: "Jembatan kecil menuju area persawahan",
    koordinat_lintang: -1.4051,
    koordinat_bujur: 100.6122,
    status_laporan: "selesai" as const,
    waktu_dibuat: "2026-10-15T06:35:00+07:00",
    waktu_selesai: "2026-10-19T13:10:00+07:00",
    jumlah_foto: 2,
    riwayat: [
      { status_tahapan: "diproses" as const, catatan_petugas: "Pemeriksaan lapangan telah dilakukan dan perbaikan dijadwalkan.", waktu_pembaruan: "2026-10-16T10:25:00+07:00" },
      { status_tahapan: "selesai" as const, catatan_petugas: "Perbaikan jembatan selesai. Terima kasih atas laporan warga.", waktu_pembaruan: "2026-10-19T13:10:00+07:00" },
    ],
  },
  {
    kode_tiket: "SLP-202610-Y9ZA",
    nama_pelapor: "Nadia Permata",
    nomor_kontak: "081234567806",
    is_anonim: false,
    jorong: "Kampung Akad",
    kategori: "Lainnya",
    jenis_laporan: "aspirasi" as const,
    judul_laporan: "Usulan tempat sampah di area kegiatan warga",
    deskripsi_laporan: "Mohon dipertimbangkan penambahan tempat sampah di area kegiatan bersama agar kebersihan tetap terjaga.",
    patokan_lokasi: "Lapangan kegiatan warga Kampung Akad",
    koordinat_lintang: -1.4174,
    koordinat_bujur: 100.6321,
    status_laporan: "diproses" as const,
    waktu_dibuat: "2026-10-12T15:00:00+07:00",
    jumlah_foto: 1,
    riwayat: [
      { status_tahapan: "diproses" as const, catatan_petugas: "Usulan diteruskan untuk dibahas dalam perencanaan fasilitas lingkungan.", waktu_pembaruan: "2026-10-14T09:30:00+07:00" },
    ],
  },
  {
    kode_tiket: "SLP-202610-B2DE",
    nama_pelapor: "Budi Santoso",
    nomor_kontak: "081234567807",
    is_anonim: false,
    jorong: "Lubuk Sarik",
    kategori: "Keamanan & Ketertiban Umum",
    jenis_laporan: "pengaduan" as const,
    judul_laporan: "Permintaan pemeriksaan kebisingan malam",
    deskripsi_laporan: "Laporan mengenai kebisingan telah diperiksa. Informasi yang tersedia belum cukup untuk mengidentifikasi waktu dan sumber gangguan sehingga diperlukan rincian tambahan.",
    patokan_lokasi: "Lingkungan permukiman Lubuk Sarik",
    koordinat_lintang: -1.4291,
    koordinat_bujur: 100.6093,
    status_laporan: "ditolak" as const,
    waktu_dibuat: "2026-10-10T21:15:00+07:00",
    jumlah_foto: 1,
    riwayat: [
      { status_tahapan: "ditolak" as const, catatan_petugas: "Laporan belum dapat ditindaklanjuti karena bukti dan rincian waktu kejadian belum memadai.", waktu_pembaruan: "2026-10-11T11:00:00+07:00" },
    ],
  },
] as const;

async function main() {
  await db.insert(jorong).values(DAFTAR_JORONG.map((nama_jorong) => ({ nama_jorong }))).onConflictDoNothing();
  await db.insert(kategori).values(DAFTAR_KATEGORI).onConflictDoNothing();
  console.log(`Jorong & kategori siap (${DAFTAR_JORONG.length} jorong, ${DAFTAR_KATEGORI.length} kategori).`);


for (const akun of AKUN) {
  const diberikan = process.env[akun.envPassword];

  if (diberikan === undefined || diberikan.length < 8) {
    throw new Error(`${akun.envPassword} wajib diisi dan minimal 8 karakter.`);
  }

  const passwordHash = await bcrypt.hash(diberikan, 12);

  const hasil = await db
    .insert(aparatur)
    .values({
      username: akun.username,
      nama_lengkap: akun.nama_lengkap,
      peran: akun.peran,
      password_hash: passwordHash,
    })
    .onConflictDoUpdate({
      target: aparatur.username,
      set: {
        password_hash: passwordHash,
      },
    })
    .returning({ username: aparatur.username });

  console.log(`Akun "${hasil[0].username}" siap. Password telah disinkronkan.`);
}


  const daftarJorong = await db.select().from(jorong);
  const daftarKategori = await db.select().from(kategori);
  const idJorong = new Map(daftarJorong.map((row) => [row.nama_jorong, row.id_jorong]));
  const idKategori = new Map(daftarKategori.map((row) => [row.nama_kategori, row.id_kategori]));
  const [admin] = await db
    .select({ id_aparatur: aparatur.id_aparatur })
    .from(aparatur)
    .where(eq(aparatur.username, "admin"))
    .limit(1);

  if (!admin) throw new Error('Akun "admin" tidak ditemukan; data riwayat dummy tidak dapat dibuat.');

  let laporanBaru = 0;
  for (const contoh of LAPORAN_DUMMY) {
    const [sudahAda] = await db
      .select({ id_laporan: laporan.id_laporan })
      .from(laporan)
      .where(eq(laporan.kode_tiket, contoh.kode_tiket))
      .limit(1);
    if (sudahAda) continue;

    const referensiJorong = idJorong.get(contoh.jorong);
    const referensiKategori = idKategori.get(contoh.kategori);
    if (!referensiJorong || !referensiKategori) {
      throw new Error(`Referensi kategori/jorong untuk tiket ${contoh.kode_tiket} tidak ditemukan.`);
    }

    const idPelapor = randomUUID();
    const idLaporan = randomUUID();
    const waktuDibuat = new Date(contoh.waktu_dibuat);
    const lampiranContoh = Array.from({ length: contoh.jumlah_foto }, (_, index) => ({
      id_lampiran: randomUUID(),
      id_laporan: idLaporan,
      nama_berkas: `contoh-bukti-${contoh.kode_tiket.toLowerCase()}-${index + 1}.png`,
      jalur_berkas: FOTO_DUMMY,
      tipe_berkas: "image/png",
      ukuran_berkas: UKURAN_FOTO_DUMMY,
      waktu_unggah: waktuDibuat,
    }));

    const dataPelapor = db.insert(pelapor).values({
      id_pelapor: idPelapor,
      nama_pelapor: contoh.nama_pelapor,
      nomor_kontak: contoh.nomor_kontak,
      is_anonim: contoh.is_anonim,
    });
    const dataLaporan = db.insert(laporan).values({
      id_laporan: idLaporan,
      kode_tiket: contoh.kode_tiket,
      id_pelapor: idPelapor,
      id_jorong: referensiJorong,
      id_kategori: referensiKategori,
      jenis_laporan: contoh.jenis_laporan,
      judul_laporan: contoh.judul_laporan,
      deskripsi_laporan: contoh.deskripsi_laporan,
      koordinat_lintang: contoh.koordinat_lintang,
      koordinat_bujur: contoh.koordinat_bujur,
      patokan_lokasi: contoh.patokan_lokasi,
      status_laporan: contoh.status_laporan,
      waktu_dibuat: waktuDibuat,
      waktu_selesai: "waktu_selesai" in contoh ? new Date(contoh.waktu_selesai) : null,
    });
    const dataLampiran = db.insert(lampiran).values(lampiranContoh);
    if (contoh.riwayat.length > 0) {
      const dataRiwayat = db.insert(tindakLanjut).values(
        contoh.riwayat.map((riwayat) => ({
          id_tindak_lanjut: randomUUID(),
          id_laporan: idLaporan,
          id_aparatur: admin.id_aparatur,
          status_tahapan: riwayat.status_tahapan,
          catatan_petugas: riwayat.catatan_petugas,
          waktu_pembaruan: new Date(riwayat.waktu_pembaruan),
        })),
      );
      await db.batch([dataPelapor, dataLaporan, dataLampiran, dataRiwayat]);
    } else {
      await db.batch([dataPelapor, dataLaporan, dataLampiran]);
    }
    laporanBaru += 1;
  }

  console.log(
    `Data dummy laporan siap (${laporanBaru} laporan baru dari ${LAPORAN_DUMMY.length} contoh; ` +
      `${LAPORAN_DUMMY.filter((contoh) => contoh.is_anonim).length} laporan anonim).`,
  );
  console.log(`Kode tiket demo: ${LAPORAN_DUMMY.map((contoh) => contoh.kode_tiket).join(", ")}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
