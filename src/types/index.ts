/**
 * Tipe data & kontrak DTO antara Server Actions (src/lib/actions) dan UI.
 * Nama field mengikuti skema PRD v1.1 (src/db/schema.ts).
 */
export type { JenisLaporan, Peran, StatusLaporan } from "@/lib/constants";
export type { CreateLaporanInput, FilterLaporanInput, UpdateStatusInput } from "@/lib/validations";

import type { JenisLaporan, Peran, StatusLaporan } from "@/lib/constants";

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  /** Galat per kolom bila validasi Zod gagal, kunci = nama field (mis. "judul_laporan"). */
  errors?: Record<string, string[]>;
}

/** Aparatur yang sedang login. Tidak pernah memuat password_hash. */
export interface AparaturSesi {
  id_aparatur: string;
  username: string;
  nama_lengkap: string;
  peran: Peran;
}

export interface OpsiFormulir {
  jorong: { id_jorong: string; nama_jorong: string }[];
  kategori: { id_kategori: string; nama_kategori: string; deskripsi_kategori: string | null }[];
}

export interface LampiranDTO {
  id_lampiran: string;
  nama_berkas: string;
  jalur_berkas: string;
  tipe_berkas: string;
  ukuran_berkas: number;
}

/** Entri lini masa publik: tanpa identitas petugas. */
export interface RiwayatPublikDTO {
  status_tahapan: StatusLaporan;
  catatan_petugas: string;
  waktu_pembaruan: Date;
}

/** Hasil pelacakan publik (FR-09..FR-12). Sengaja tanpa data pelapor (NFR-07). */
export interface LaporanPublikDTO {
  kode_tiket: string;
  jenis_laporan: JenisLaporan;
  judul_laporan: string;
  deskripsi_laporan: string;
  nama_kategori: string;
  nama_jorong: string;
  patokan_lokasi: string;
  status_laporan: StatusLaporan;
  waktu_dibuat: Date;
  waktu_selesai: Date | null;
  lampiran: Pick<LampiranDTO, "id_lampiran" | "nama_berkas" | "jalur_berkas">[];
  riwayat: RiwayatPublikDTO[];
}

/** Baris daftar laporan untuk aparatur (FR-16). Tanpa jalur foto agar daftar tetap ringan. */
export interface LaporanRingkasDTO {
  id_laporan: string;
  kode_tiket: string;
  jenis_laporan: JenisLaporan;
  judul_laporan: string;
  status_laporan: StatusLaporan;
  nama_kategori: string;
  nama_jorong: string;
  /** null bila pelapor anonim */
  nama_pelapor: string | null;
  is_anonim: boolean;
  jumlah_lampiran: number;
  waktu_dibuat: Date;
  waktu_selesai: Date | null;
}

export interface RiwayatAparaturDTO extends RiwayatPublikDTO {
  id_tindak_lanjut: string;
  nama_petugas: string;
}

/** Detail laporan untuk Admin (CRUD) dan Wali Nagari (read-only) (FR-17). */
export interface LaporanDetailDTO extends Omit<LaporanRingkasDTO, "jumlah_lampiran"> {
  deskripsi_laporan: string;
  patokan_lokasi: string;
  koordinat_lintang: number | null;
  koordinat_bujur: number | null;
  /** null bila pelapor anonim */
  nomor_kontak: string | null;
  lampiran: LampiranDTO[];
  riwayat: RiwayatAparaturDTO[];
}
