/**
 * Skema validasi Zod untuk Server Actions (PRD FR-05, FR-26, FR-28, NFR-09, NFR-13).
 * Tanpa dependensi server, sehingga form client dapat memakai skema yang sama untuk umpan balik cepat;
 * validasi yang berlaku tetap yang dijalankan ulang di server.
 */
import { z } from "zod";
import {
  JENIS_LAPORAN,
  MAKS_JUMLAH_LAMPIRAN,
  MAKS_UKURAN_LAMPIRAN,
  POLA_KODE_TIKET,
  STATUS_LAPORAN,
  TIPE_LAMPIRAN_DIIZINKAN,
} from "./constants";

// Form HTML mengirim "" untuk kolom kosong; anggap sama dengan tidak diisi.
const opsional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (typeof v === "string" && v.trim() === "" ? undefined : v), schema.optional());

const NOMOR_HP = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;

// ---------- Lampiran foto bukti ----------

const PREFIKS_DATA_URL = /^data:(image\/(?:jpeg|png|webp));base64,/;
// Data URL ~4/3 ukuran asli. Batas panjang menolak payload raksasa sebelum dihitung lebih jauh.
const MAKS_PANJANG_DATA_URL = Math.ceil((MAKS_UKURAN_LAMPIRAN * 4) / 3) + 128;
const MAKS_PANJANG_URL = 2048;

function ukuranDariDataUrl(dataUrl: string, panjangPrefiks: number): number {
  const b64 = dataUrl.slice(panjangPrefiks);
  const padding = b64.endsWith("==") ? 2 : b64.endsWith("=") ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

export const lampiranSchema = z
  .object({
    nama_berkas: z.string().trim().min(1, { error: "Nama berkas wajib ada." }).max(255),
    jalur_berkas: z.string().min(1, { error: "Jalur berkas wajib ada." }),
    tipe_berkas: z.enum(TIPE_LAMPIRAN_DIIZINKAN, {
      error: "Format berkas harus berupa foto (JPG, JPEG, PNG, atau WebP).",
    }),
    ukuran_berkas: z
      .number()
      .int()
      .positive({ error: "Ukuran berkas tidak valid." })
      .max(MAKS_UKURAN_LAMPIRAN, { error: "Ukuran foto melebihi batas maksimal 5 MB." }),
  })
  .superRefine((v, ctx) => {
    const data = PREFIKS_DATA_URL.exec(v.jalur_berkas);
    if (data) {
      if (v.jalur_berkas.length > MAKS_PANJANG_DATA_URL) {
        ctx.addIssue({ code: "custom", path: ["jalur_berkas"], message: "Ukuran foto melebihi batas maksimal 5 MB." });
        return;
      }
      if (data[1] !== v.tipe_berkas) {
        ctx.addIssue({ code: "custom", path: ["tipe_berkas"], message: "Format berkas tidak sesuai dengan isi foto." });
      }
      if (ukuranDariDataUrl(v.jalur_berkas, data[0].length) > MAKS_UKURAN_LAMPIRAN) {
        ctx.addIssue({ code: "custom", path: ["jalur_berkas"], message: "Ukuran foto melebihi batas maksimal 5 MB." });
      }
    } else if (!/^https:\/\//.test(v.jalur_berkas) || v.jalur_berkas.length > MAKS_PANJANG_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["jalur_berkas"],
        message: "Jalur berkas harus berupa foto yang diunggah atau URL https yang valid.",
      });
    }
  })
  // Ukuran yang dipercaya adalah hasil hitung server, bukan angka kiriman client.
  .transform((v) => {
    const data = PREFIKS_DATA_URL.exec(v.jalur_berkas);
    return data ? { ...v, ukuran_berkas: ukuranDariDataUrl(v.jalur_berkas, data[0].length) } : v;
  });

// ---------- Laporan ----------

export const createLaporanSchema = z
  .object({
    is_anonim: z.boolean().default(false),
    nama_pelapor: opsional(z.string().trim().max(100, { error: "Nama pelapor maksimal 100 karakter." })),
    nomor_kontak: opsional(
      z.string().trim().regex(NOMOR_HP, { error: "Nomor kontak tidak valid. Contoh: 081234567890." }),
    ),
    jenis_laporan: z.enum(JENIS_LAPORAN).default("pengaduan"),
    judul_laporan: z
      .string()
      .trim()
      .min(5, { error: "Judul laporan minimal 5 karakter." })
      .max(150, { error: "Judul laporan maksimal 150 karakter." }),
    deskripsi_laporan: z
      .string()
      .trim()
      .min(10, { error: "Deskripsi laporan minimal 10 karakter." })
      .max(3000, { error: "Deskripsi laporan maksimal 3000 karakter." }),
    id_kategori: z.string().trim().min(1, { error: "Kategori wajib dipilih." }).max(36),
    id_jorong: z.string().trim().min(1, { error: "Wilayah jorong wajib dipilih." }).max(36),
    patokan_lokasi: z
      .string()
      .trim()
      .min(3, { error: "Patokan lokasi wajib diisi." })
      .max(500, { error: "Patokan lokasi maksimal 500 karakter." }),
    koordinat_lintang: z.number().min(-90).max(90).nullish(),
    koordinat_bujur: z.number().min(-180).max(180).nullish(),
    lampiran: z
      .array(lampiranSchema)
      .min(1, { error: "Wajib melampirkan minimal 1 foto bukti kejadian." })
      .max(MAKS_JUMLAH_LAMPIRAN, { error: `Maksimal ${MAKS_JUMLAH_LAMPIRAN} foto bukti per laporan.` }),
  })
  .superRefine((v, ctx) => {
    if (!v.is_anonim && !v.nama_pelapor) {
      ctx.addIssue({
        code: "custom",
        path: ["nama_pelapor"],
        message: "Isi nama pelapor atau pilih opsi laporkan secara anonim.",
      });
    }
    if ((v.koordinat_lintang == null) !== (v.koordinat_bujur == null)) {
      ctx.addIssue({
        code: "custom",
        path: ["koordinat_lintang"],
        message: "Koordinat harus diisi lintang dan bujur sekaligus.",
      });
    }
  })
  // Anonimitas ditegakkan di server: identitas dibuang walaupun client mengirimnya (FR-04, NFR-07).
  .transform((v) => ({
    ...v,
    nama_pelapor: v.is_anonim ? null : (v.nama_pelapor ?? null),
    nomor_kontak: v.is_anonim ? null : (v.nomor_kontak ?? null),
    koordinat_lintang: v.koordinat_lintang ?? null,
    koordinat_bujur: v.koordinat_bujur ?? null,
  }));

export const kodeTiketSchema = z
  .string({ error: "Kode tiket wajib diisi." })
  .trim()
  .toUpperCase()
  .regex(POLA_KODE_TIKET, { error: "Format kode tiket tidak valid. Contoh: SLP-202610-A9B2." });

export const filterLaporanSchema = z
  .object({
    status_laporan: z.enum(STATUS_LAPORAN).optional(),
    id_kategori: z.string().trim().min(1).max(36).optional(),
    id_jorong: z.string().trim().min(1).max(36).optional(),
    dari: z.iso.date({ error: "Tanggal awal tidak valid (format YYYY-MM-DD)." }).optional(),
    sampai: z.iso.date({ error: "Tanggal akhir tidak valid (format YYYY-MM-DD)." }).optional(),
    limit: z.number().int().min(1).max(500).default(200),
  })
  .refine((v) => !v.dari || !v.sampai || v.dari <= v.sampai, {
    path: ["dari"],
    error: "Tanggal awal tidak boleh melewati tanggal akhir.",
  });

export const idLaporanSchema = z.string().trim().min(1, { error: "ID laporan wajib diisi." }).max(36);

// ---------- Aparatur ----------

export const loginSchema = z.object({
  username: z
    .string({ error: "Username wajib diisi." })
    .trim()
    .toLowerCase()
    .min(1, { error: "Username wajib diisi." })
    .max(50),
  // bcrypt hanya memakai 72 byte pertama, jadi kata sandi lebih panjang ditolak.
  password: z
    .string({ error: "Kata sandi wajib diisi." })
    .min(1, { error: "Kata sandi wajib diisi." })
    .max(72),
});

export const updateStatusSchema = z.object({
  id_laporan: idLaporanSchema,
  // "menunggu" hanya status awal; aparatur tidak dapat mengembalikan laporan ke sana.
  status_tahapan: z.enum(["diproses", "selesai", "ditolak"], { error: "Status penanganan tidak valid." }),
  catatan_petugas: z
    .string({ error: "Catatan penanganan wajib diisi." })
    .trim()
    .min(5, { error: "Catatan penanganan minimal 5 karakter." })
    .max(1000, { error: "Catatan penanganan maksimal 1000 karakter." }),
});

export type CreateLaporanInput = z.input<typeof createLaporanSchema>;
export type FilterLaporanInput = z.input<typeof filterLaporanSchema>;
export type UpdateStatusInput = z.input<typeof updateStatusSchema>;
