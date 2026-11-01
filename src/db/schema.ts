/**
 * Skema basis data SILAPOR-KU (PRD v1.1 bagian 4) untuk Neon PostgreSQL.
 * Ketujuh tabel: jorong, kategori, aparatur, pelapor, laporan, lampiran, tindak_lanjut.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
// Relatif (bukan "@/"), karena drizzle-kit memuat berkas ini di luar Next.js.
import {
  JENIS_LAPORAN,
  MAKS_UKURAN_LAMPIRAN,
  PERAN_APARATUR,
  STATUS_LAPORAN,
} from "../lib/constants";

export const peranEnum = pgEnum("peran_aparatur", PERAN_APARATUR);
export const jenisLaporanEnum = pgEnum("jenis_laporan", JENIS_LAPORAN);
export const statusLaporanEnum = pgEnum("status_laporan", STATUS_LAPORAN);

const newId = () => crypto.randomUUID();

export const jorong = pgTable("jorong", {
  id_jorong: varchar("id_jorong", { length: 36 }).primaryKey().$defaultFn(newId),
  nama_jorong: varchar("nama_jorong", { length: 100 }).notNull().unique(),
});

export const kategori = pgTable("kategori", {
  id_kategori: varchar("id_kategori", { length: 36 }).primaryKey().$defaultFn(newId),
  nama_kategori: varchar("nama_kategori", { length: 100 }).notNull().unique(),
  deskripsi_kategori: text("deskripsi_kategori"),
});

export const aparatur = pgTable("aparatur", {
  id_aparatur: varchar("id_aparatur", { length: 36 }).primaryKey().$defaultFn(newId),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password_hash: varchar("password_hash", { length: 100 }).notNull(), // bcrypt (NFR-05)
  nama_lengkap: varchar("nama_lengkap", { length: 100 }).notNull(),
  peran: peranEnum("peran").notNull(),
});

// Satu baris per laporan: warga tidak memiliki akun, jadi identitas pelapor tidak dideduplikasi.
// Pelapor anonim tetap punya baris (is_anonim = true, nama & kontak null) agar FK laporan terpenuhi.
export const pelapor = pgTable("pelapor", {
  id_pelapor: varchar("id_pelapor", { length: 36 }).primaryKey().$defaultFn(newId),
  nama_pelapor: varchar("nama_pelapor", { length: 100 }),
  nomor_kontak: varchar("nomor_kontak", { length: 20 }),
  is_anonim: boolean("is_anonim").notNull().default(false),
});

export const laporan = pgTable(
  "laporan",
  {
    id_laporan: varchar("id_laporan", { length: 36 }).primaryKey().$defaultFn(newId),
    kode_tiket: varchar("kode_tiket", { length: 20 }).notNull().unique(),
    id_pelapor: varchar("id_pelapor", { length: 36 })
      .notNull()
      .references(() => pelapor.id_pelapor, { onDelete: "restrict" }),
    id_jorong: varchar("id_jorong", { length: 36 })
      .notNull()
      .references(() => jorong.id_jorong, { onDelete: "restrict" }),
    id_kategori: varchar("id_kategori", { length: 36 })
      .notNull()
      .references(() => kategori.id_kategori, { onDelete: "restrict" }),
    jenis_laporan: jenisLaporanEnum("jenis_laporan").notNull().default("pengaduan"),
    judul_laporan: varchar("judul_laporan", { length: 150 }).notNull(),
    deskripsi_laporan: text("deskripsi_laporan").notNull(),
    koordinat_lintang: numeric("koordinat_lintang", { precision: 9, scale: 6, mode: "number" }),
    koordinat_bujur: numeric("koordinat_bujur", { precision: 9, scale: 6, mode: "number" }),
    patokan_lokasi: text("patokan_lokasi").notNull(),
    status_laporan: statusLaporanEnum("status_laporan").notNull().default("menunggu"),
    waktu_dibuat: timestamp("waktu_dibuat", { withTimezone: true }).notNull().defaultNow(),
    waktu_selesai: timestamp("waktu_selesai", { withTimezone: true }),
  },
  (t) => [
    index("laporan_status_idx").on(t.status_laporan),
    index("laporan_waktu_dibuat_idx").on(t.waktu_dibuat),
    index("laporan_jorong_idx").on(t.id_jorong),
    index("laporan_kategori_idx").on(t.id_kategori),
    check(
      "laporan_koordinat_valid",
      sql`(${t.koordinat_lintang} is null) = (${t.koordinat_bujur} is null)
        and (${t.koordinat_lintang} is null or ${t.koordinat_lintang} between -90 and 90)
        and (${t.koordinat_bujur} is null or ${t.koordinat_bujur} between -180 and 180)`,
    ),
  ],
);

// Foto bukti. Minimal 1 per laporan dijamin oleh Server Action createLaporan (satu batch atomik).
export const lampiran = pgTable(
  "lampiran",
  {
    id_lampiran: varchar("id_lampiran", { length: 36 }).primaryKey().$defaultFn(newId),
    id_laporan: varchar("id_laporan", { length: 36 })
      .notNull()
      .references(() => laporan.id_laporan, { onDelete: "cascade" }),
    nama_berkas: varchar("nama_berkas", { length: 255 }).notNull(),
    jalur_berkas: text("jalur_berkas").notNull(),
    tipe_berkas: varchar("tipe_berkas", { length: 50 }).notNull(),
    ukuran_berkas: integer("ukuran_berkas").notNull(),
    waktu_unggah: timestamp("waktu_unggah", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("lampiran_laporan_idx").on(t.id_laporan),
    check(
      "lampiran_tipe_gambar",
      sql`${t.tipe_berkas} in ('image/jpeg', 'image/png', 'image/webp')`,
    ),
    check(
      "lampiran_ukuran_valid",
      // sql.raw: DDL tidak boleh berisi parameter ($1), angka harus literal.
      sql`${t.ukuran_berkas} > 0 and ${t.ukuran_berkas} <= ${sql.raw(String(MAKS_UKURAN_LAMPIRAN))}`,
    ),
  ],
);

// Audit trail (FR-20): satu baris per tindakan aparatur, tidak pernah diubah atau dihapus oleh aplikasi.
export const tindakLanjut = pgTable(
  "tindak_lanjut",
  {
    id_tindak_lanjut: varchar("id_tindak_lanjut", { length: 36 }).primaryKey().$defaultFn(newId),
    id_laporan: varchar("id_laporan", { length: 36 })
      .notNull()
      .references(() => laporan.id_laporan, { onDelete: "cascade" }),
    id_aparatur: varchar("id_aparatur", { length: 36 })
      .notNull()
      .references(() => aparatur.id_aparatur, { onDelete: "restrict" }),
    status_tahapan: statusLaporanEnum("status_tahapan").notNull(),
    catatan_petugas: text("catatan_petugas").notNull(),
    waktu_pembaruan: timestamp("waktu_pembaruan", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("tindak_lanjut_laporan_idx").on(t.id_laporan, t.waktu_pembaruan)],
);

export const jorongRelations = relations(jorong, ({ many }) => ({
  laporan: many(laporan),
}));

export const kategoriRelations = relations(kategori, ({ many }) => ({
  laporan: many(laporan),
}));

export const aparaturRelations = relations(aparatur, ({ many }) => ({
  tindakLanjut: many(tindakLanjut),
}));

export const pelaporRelations = relations(pelapor, ({ many }) => ({
  laporan: many(laporan),
}));

export const laporanRelations = relations(laporan, ({ one, many }) => ({
  pelapor: one(pelapor, { fields: [laporan.id_pelapor], references: [pelapor.id_pelapor] }),
  jorong: one(jorong, { fields: [laporan.id_jorong], references: [jorong.id_jorong] }),
  kategori: one(kategori, { fields: [laporan.id_kategori], references: [kategori.id_kategori] }),
  lampiran: many(lampiran),
  tindakLanjut: many(tindakLanjut),
}));

export const lampiranRelations = relations(lampiran, ({ one }) => ({
  laporan: one(laporan, { fields: [lampiran.id_laporan], references: [laporan.id_laporan] }),
}));

export const tindakLanjutRelations = relations(tindakLanjut, ({ one }) => ({
  laporan: one(laporan, { fields: [tindakLanjut.id_laporan], references: [laporan.id_laporan] }),
  aparatur: one(aparatur, {
    fields: [tindakLanjut.id_aparatur],
    references: [aparatur.id_aparatur],
  }),
}));
