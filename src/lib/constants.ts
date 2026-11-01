/**
 * Konstanta domain SILAPOR-KU. Aman diimpor dari client maupun server,
 * dan menjadi satu sumber kebenaran untuk skema DB (src/db/schema.ts) dan validasi Zod.
 */

export const PERAN_APARATUR = ["admin", "wali_nagari"] as const;
export const JENIS_LAPORAN = ["pengaduan", "aspirasi"] as const;
export const STATUS_LAPORAN = ["menunggu", "diproses", "selesai", "ditolak"] as const;

export type Peran = (typeof PERAN_APARATUR)[number];
export type JenisLaporan = (typeof JENIS_LAPORAN)[number];
export type StatusLaporan = (typeof STATUS_LAPORAN)[number];

// Lampiran foto bukti (PRD NFR-13)
export const MAKS_UKURAN_LAMPIRAN = 5 * 1024 * 1024; // 5 MB per foto
export const MAKS_JUMLAH_LAMPIRAN = 5;
export const TIPE_LAMPIRAN_DIIZINKAN = ["image/jpeg", "image/png", "image/webp"] as const;

/**
 * Alur status yang boleh ditempuh Admin Nagari (PRD FR-18):
 * menunggu -> diproses -> selesai / ditolak, dan menunggu -> ditolak bila laporan tidak valid.
 * diproses -> diproses dipakai untuk menambah catatan progres tanpa mengubah status (FR-19).
 * selesai dan ditolak bersifat final.
 */
export const ALUR_STATUS: Record<StatusLaporan, readonly StatusLaporan[]> = {
  menunggu: ["diproses", "ditolak"],
  diproses: ["diproses", "selesai", "ditolak"],
  selesai: [],
  ditolak: [],
};

// Format kode tiket: SLP-YYYYMM-XXXX (4 karakter tanpa 0/O/1/I agar mudah dibaca & disalin warga)
export const ALFABET_KODE_TIKET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const POLA_KODE_TIKET = /^SLP-\d{6}-[A-HJ-NP-Z2-9]{4}$/;
