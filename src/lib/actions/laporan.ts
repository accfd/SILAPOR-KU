"use server";

import { and, asc, desc, eq, gte, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { jorong, kategori, lampiran, laporan, pelapor } from "@/db/schema";
import { gagal, gagalValidasi, sukses, tanganiError } from "@/lib/action-result";
import { wajibAparatur } from "@/lib/auth";
import { KATEGORI_LAINNYA } from "@/lib/constants";
import { generateTicketCode } from "@/lib/utils";
import {
  createLaporanSchema,
  filterLaporanSchema,
  idLaporanSchema,
  kodeTiketSchema,
} from "@/lib/validations";
import type {
  ActionResult,
  CreateLaporanInput,
  FilterLaporanInput,
  LaporanDetailDTO,
  LaporanPublikDTO,
  LaporanRingkasDTO,
  OpsiFormulir,
} from "@/types";

const MAKS_PERCOBAAN_KODE_TIKET = 5;

/** Bentrok UNIQUE(kode_tiket)? Drizzle membungkus galat driver di `cause`, jadi periksa keduanya. */
function bentrokKodeTiket(error: unknown): boolean {
  for (let e: unknown = error; e instanceof Error; e = e.cause) {
    const { code, constraint, message } = e as Error & { code?: string; constraint?: string };
    if (code === "23505" && (constraint ?? message).includes("kode_tiket")) return true;
  }
  return false;
}

/** Awal hari WIB (UTC+7) dari "YYYY-MM-DD". */
function awalHariWib(tanggal: string): Date {
  return new Date(`${tanggal}T00:00:00+07:00`);
}

/** Daftar jorong & kategori untuk dropdown formulir (publik). */
export async function getOpsiFormulir(): Promise<ActionResult<OpsiFormulir>> {
  try {
    const [daftarJorong, daftarKategori] = await Promise.all([
      db.select().from(jorong).orderBy(asc(jorong.nama_jorong)),
      db.select().from(kategori),
    ]);
    // Urut abjad, kecuali "Lainnya" selalu di paling bawah. Diurutkan di sini (bukan di SQL)
    // agar hasilnya tetap sama apa pun collation database-nya.
    const kategoriUrut = [...daftarKategori].sort(
      (a, b) =>
        Number(a.nama_kategori === KATEGORI_LAINNYA) - Number(b.nama_kategori === KATEGORI_LAINNYA) ||
        a.nama_kategori.localeCompare(b.nama_kategori, "id"),
    );
    return sukses("Opsi formulir berhasil dimuat.", { jorong: daftarJorong, kategori: kategoriUrut });
  } catch (error) {
    return tanganiError("getOpsiFormulir", error);
  }
}

/**
 * Pembuatan laporan oleh warga, tanpa login (FR-01..FR-08).
 * Validasi Zod → cek referensi → generate kode tiket unik → simpan pelapor, laporan, dan lampiran
 * dalam satu batch atomik (semua tersimpan atau tidak sama sekali).
 */
export async function createLaporan(input: CreateLaporanInput): Promise<ActionResult<{ kode_tiket: string }>> {
  try {
    const parsed = createLaporanSchema.safeParse(input);
    if (!parsed.success) return gagalValidasi(parsed.error);
    const data = parsed.data;

    const [adaKategori, adaJorong] = await Promise.all([
      db.select({ id: kategori.id_kategori }).from(kategori).where(eq(kategori.id_kategori, data.id_kategori)).limit(1),
      db.select({ id: jorong.id_jorong }).from(jorong).where(eq(jorong.id_jorong, data.id_jorong)).limit(1),
    ]);
    if (adaKategori.length === 0) return gagal("Kategori laporan tidak valid.", { id_kategori: ["Kategori tidak ditemukan."] });
    if (adaJorong.length === 0) return gagal("Wilayah jorong tidak valid.", { id_jorong: ["Jorong tidak ditemukan."] });

    const id_pelapor = crypto.randomUUID();
    const id_laporan = crypto.randomUUID();

    for (let percobaan = 1; percobaan <= MAKS_PERCOBAAN_KODE_TIKET; percobaan++) {
      const kode_tiket = generateTicketCode();
      try {
        await db.batch([
          db.insert(pelapor).values({
            id_pelapor,
            nama_pelapor: data.nama_pelapor,
            nomor_kontak: data.nomor_kontak,
            is_anonim: data.is_anonim,
          }),
          db.insert(laporan).values({
            id_laporan,
            kode_tiket,
            id_pelapor,
            id_jorong: data.id_jorong,
            id_kategori: data.id_kategori,
            jenis_laporan: data.jenis_laporan,
            judul_laporan: data.judul_laporan,
            deskripsi_laporan: data.deskripsi_laporan,
            koordinat_lintang: data.koordinat_lintang,
            koordinat_bujur: data.koordinat_bujur,
            patokan_lokasi: data.patokan_lokasi,
          }),
          db.insert(lampiran).values(data.lampiran.map((l) => ({ ...l, id_laporan }))),
        ]);
        return sukses("Laporan berhasil dikirim.", { kode_tiket });
      } catch (error) {
        // Batch bersifat transaksi, jadi bentrok kode membatalkan semuanya dan aman diulang dengan kode baru.
        if (bentrokKodeTiket(error) && percobaan < MAKS_PERCOBAAN_KODE_TIKET) continue;
        throw error;
      }
    }
    throw new Error("Gagal membuat kode tiket unik.");
  } catch (error) {
    return tanganiError("createLaporan", error);
  }
}

/**
 * Pelacakan publik berdasarkan kode tiket (FR-09..FR-12, FR-26).
 * DTO sengaja tanpa data pelapor, koordinat, dan identitas petugas (NFR-07).
 */
export async function getLaporanByKode(kode: string): Promise<ActionResult<LaporanPublikDTO>> {
  try {
    const parsed = kodeTiketSchema.safeParse(kode);
    if (!parsed.success) return gagalValidasi(parsed.error);

    const row = await db.query.laporan.findFirst({
      where: eq(laporan.kode_tiket, parsed.data),
      with: {
        kategori: { columns: { nama_kategori: true } },
        jorong: { columns: { nama_jorong: true } },
        lampiran: { columns: { id_lampiran: true, nama_berkas: true, jalur_berkas: true } },
        tindakLanjut: {
          columns: { status_tahapan: true, catatan_petugas: true, waktu_pembaruan: true },
          orderBy: (t, { asc }) => [asc(t.waktu_pembaruan)],
        },
      },
    });
    if (!row) return gagal(`Tiket dengan kode ${parsed.data} tidak ditemukan.`);

    return sukses("Tiket ditemukan.", {
      kode_tiket: row.kode_tiket,
      jenis_laporan: row.jenis_laporan,
      judul_laporan: row.judul_laporan,
      deskripsi_laporan: row.deskripsi_laporan,
      nama_kategori: row.kategori.nama_kategori,
      nama_jorong: row.jorong.nama_jorong,
      patokan_lokasi: row.patokan_lokasi,
      status_laporan: row.status_laporan,
      waktu_dibuat: row.waktu_dibuat,
      waktu_selesai: row.waktu_selesai,
      lampiran: row.lampiran,
      riwayat: row.tindakLanjut,
    });
  } catch (error) {
    return tanganiError("getLaporanByKode", error);
  }
}

/** Daftar laporan dengan filter status, kategori, jorong, dan rentang tanggal (FR-16). Admin & Wali Nagari. */
export async function getDaftarLaporan(filter?: FilterLaporanInput): Promise<ActionResult<LaporanRingkasDTO[]>> {
  try {
    await wajibAparatur("admin", "wali_nagari");

    const parsed = filterLaporanSchema.safeParse(filter ?? {});
    if (!parsed.success) return gagalValidasi(parsed.error);
    const f = parsed.data;

    const kondisi = [
      f.status_laporan && eq(laporan.status_laporan, f.status_laporan),
      f.id_kategori && eq(laporan.id_kategori, f.id_kategori),
      f.id_jorong && eq(laporan.id_jorong, f.id_jorong),
      f.dari && gte(laporan.waktu_dibuat, awalHariWib(f.dari)),
      // Batas atas eksklusif di awal hari berikutnya, sehingga seluruh hari "sampai" ikut terhitung.
      f.sampai && lt(laporan.waktu_dibuat, new Date(awalHariWib(f.sampai).getTime() + 24 * 60 * 60 * 1000)),
    ].filter((k) => !!k);

    const rows = await db
      .select({
        id_laporan: laporan.id_laporan,
        kode_tiket: laporan.kode_tiket,
        jenis_laporan: laporan.jenis_laporan,
        judul_laporan: laporan.judul_laporan,
        status_laporan: laporan.status_laporan,
        nama_kategori: kategori.nama_kategori,
        nama_jorong: jorong.nama_jorong,
        nama_pelapor: pelapor.nama_pelapor,
        is_anonim: pelapor.is_anonim,
        jumlah_lampiran: sql<number>`(select count(*)::int from ${lampiran} where ${lampiran.id_laporan} = ${laporan.id_laporan})`,
        waktu_dibuat: laporan.waktu_dibuat,
        waktu_selesai: laporan.waktu_selesai,
      })
      .from(laporan)
      .innerJoin(kategori, eq(laporan.id_kategori, kategori.id_kategori))
      .innerJoin(jorong, eq(laporan.id_jorong, jorong.id_jorong))
      .innerJoin(pelapor, eq(laporan.id_pelapor, pelapor.id_pelapor))
      .where(and(...kondisi))
      .orderBy(desc(laporan.waktu_dibuat))
      .limit(f.limit);

    return sukses(
      "Data laporan berhasil dimuat.",
      rows.map((r) => ({ ...r, nama_pelapor: r.is_anonim ? null : r.nama_pelapor })),
    );
  } catch (error) {
    return tanganiError("getDaftarLaporan", error);
  }
}

/** Detail lengkap laporan: Admin (akses penuh) dan Wali Nagari (read-only) (FR-17). */
export async function getDetailLaporan(idLaporan: string): Promise<ActionResult<LaporanDetailDTO>> {
  try {
    await wajibAparatur("admin", "wali_nagari");

    const parsed = idLaporanSchema.safeParse(idLaporan);
    if (!parsed.success) return gagalValidasi(parsed.error);

    const row = await db.query.laporan.findFirst({
      where: eq(laporan.id_laporan, parsed.data),
      with: {
        pelapor: true,
        kategori: { columns: { nama_kategori: true } },
        jorong: { columns: { nama_jorong: true } },
        lampiran: { orderBy: (t, { asc }) => [asc(t.waktu_unggah)] },
        tindakLanjut: {
          orderBy: (t, { asc }) => [asc(t.waktu_pembaruan)],
          with: { aparatur: { columns: { nama_lengkap: true } } },
        },
      },
    });
    if (!row) return gagal("Laporan tidak ditemukan.");

    const anonim = row.pelapor.is_anonim;
    return sukses("Detail laporan berhasil dimuat.", {
      id_laporan: row.id_laporan,
      kode_tiket: row.kode_tiket,
      jenis_laporan: row.jenis_laporan,
      judul_laporan: row.judul_laporan,
      deskripsi_laporan: row.deskripsi_laporan,
      patokan_lokasi: row.patokan_lokasi,
      koordinat_lintang: row.koordinat_lintang,
      koordinat_bujur: row.koordinat_bujur,
      status_laporan: row.status_laporan,
      nama_kategori: row.kategori.nama_kategori,
      nama_jorong: row.jorong.nama_jorong,
      is_anonim: anonim,
      nama_pelapor: anonim ? null : row.pelapor.nama_pelapor,
      nomor_kontak: anonim ? null : row.pelapor.nomor_kontak,
      waktu_dibuat: row.waktu_dibuat,
      waktu_selesai: row.waktu_selesai,
      lampiran: row.lampiran.map(({ id_lampiran, nama_berkas, jalur_berkas, tipe_berkas, ukuran_berkas }) => ({
        id_lampiran,
        nama_berkas,
        jalur_berkas,
        tipe_berkas,
        ukuran_berkas,
      })),
      riwayat: row.tindakLanjut.map((t) => ({
        id_tindak_lanjut: t.id_tindak_lanjut,
        status_tahapan: t.status_tahapan,
        catatan_petugas: t.catatan_petugas,
        waktu_pembaruan: t.waktu_pembaruan,
        nama_petugas: t.aparatur.nama_lengkap,
      })),
    });
  } catch (error) {
    return tanganiError("getDetailLaporan", error);
  }
}
