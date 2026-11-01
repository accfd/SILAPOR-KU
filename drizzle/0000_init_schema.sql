CREATE TYPE "public"."jenis_laporan" AS ENUM('pengaduan', 'aspirasi');--> statement-breakpoint
CREATE TYPE "public"."peran_aparatur" AS ENUM('admin', 'wali_nagari');--> statement-breakpoint
CREATE TYPE "public"."status_laporan" AS ENUM('menunggu', 'diproses', 'selesai', 'ditolak');--> statement-breakpoint
CREATE TABLE "aparatur" (
	"id_aparatur" varchar(36) PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"password_hash" varchar(100) NOT NULL,
	"nama_lengkap" varchar(100) NOT NULL,
	"peran" "peran_aparatur" NOT NULL,
	CONSTRAINT "aparatur_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "jorong" (
	"id_jorong" varchar(36) PRIMARY KEY NOT NULL,
	"nama_jorong" varchar(100) NOT NULL,
	CONSTRAINT "jorong_nama_jorong_unique" UNIQUE("nama_jorong")
);
--> statement-breakpoint
CREATE TABLE "kategori" (
	"id_kategori" varchar(36) PRIMARY KEY NOT NULL,
	"nama_kategori" varchar(100) NOT NULL,
	"deskripsi_kategori" text,
	CONSTRAINT "kategori_nama_kategori_unique" UNIQUE("nama_kategori")
);
--> statement-breakpoint
CREATE TABLE "lampiran" (
	"id_lampiran" varchar(36) PRIMARY KEY NOT NULL,
	"id_laporan" varchar(36) NOT NULL,
	"nama_berkas" varchar(255) NOT NULL,
	"jalur_berkas" text NOT NULL,
	"tipe_berkas" varchar(50) NOT NULL,
	"ukuran_berkas" integer NOT NULL,
	"waktu_unggah" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lampiran_tipe_gambar" CHECK ("lampiran"."tipe_berkas" in ('image/jpeg', 'image/png', 'image/webp')),
	CONSTRAINT "lampiran_ukuran_valid" CHECK ("lampiran"."ukuran_berkas" > 0 and "lampiran"."ukuran_berkas" <= 5242880)
);
--> statement-breakpoint
CREATE TABLE "laporan" (
	"id_laporan" varchar(36) PRIMARY KEY NOT NULL,
	"kode_tiket" varchar(20) NOT NULL,
	"id_pelapor" varchar(36) NOT NULL,
	"id_jorong" varchar(36) NOT NULL,
	"id_kategori" varchar(36) NOT NULL,
	"jenis_laporan" "jenis_laporan" DEFAULT 'pengaduan' NOT NULL,
	"judul_laporan" varchar(150) NOT NULL,
	"deskripsi_laporan" text NOT NULL,
	"koordinat_lintang" numeric(9, 6),
	"koordinat_bujur" numeric(9, 6),
	"patokan_lokasi" text NOT NULL,
	"status_laporan" "status_laporan" DEFAULT 'menunggu' NOT NULL,
	"waktu_dibuat" timestamp with time zone DEFAULT now() NOT NULL,
	"waktu_selesai" timestamp with time zone,
	CONSTRAINT "laporan_kode_tiket_unique" UNIQUE("kode_tiket"),
	CONSTRAINT "laporan_koordinat_valid" CHECK (("laporan"."koordinat_lintang" is null) = ("laporan"."koordinat_bujur" is null)
        and ("laporan"."koordinat_lintang" is null or "laporan"."koordinat_lintang" between -90 and 90)
        and ("laporan"."koordinat_bujur" is null or "laporan"."koordinat_bujur" between -180 and 180))
);
--> statement-breakpoint
CREATE TABLE "pelapor" (
	"id_pelapor" varchar(36) PRIMARY KEY NOT NULL,
	"nama_pelapor" varchar(100),
	"nomor_kontak" varchar(20),
	"is_anonim" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tindak_lanjut" (
	"id_tindak_lanjut" varchar(36) PRIMARY KEY NOT NULL,
	"id_laporan" varchar(36) NOT NULL,
	"id_aparatur" varchar(36) NOT NULL,
	"status_tahapan" "status_laporan" NOT NULL,
	"catatan_petugas" text NOT NULL,
	"waktu_pembaruan" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lampiran" ADD CONSTRAINT "lampiran_id_laporan_laporan_id_laporan_fk" FOREIGN KEY ("id_laporan") REFERENCES "public"."laporan"("id_laporan") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_id_pelapor_pelapor_id_pelapor_fk" FOREIGN KEY ("id_pelapor") REFERENCES "public"."pelapor"("id_pelapor") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_id_jorong_jorong_id_jorong_fk" FOREIGN KEY ("id_jorong") REFERENCES "public"."jorong"("id_jorong") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "laporan" ADD CONSTRAINT "laporan_id_kategori_kategori_id_kategori_fk" FOREIGN KEY ("id_kategori") REFERENCES "public"."kategori"("id_kategori") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tindak_lanjut" ADD CONSTRAINT "tindak_lanjut_id_laporan_laporan_id_laporan_fk" FOREIGN KEY ("id_laporan") REFERENCES "public"."laporan"("id_laporan") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tindak_lanjut" ADD CONSTRAINT "tindak_lanjut_id_aparatur_aparatur_id_aparatur_fk" FOREIGN KEY ("id_aparatur") REFERENCES "public"."aparatur"("id_aparatur") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "lampiran_laporan_idx" ON "lampiran" USING btree ("id_laporan");--> statement-breakpoint
CREATE INDEX "laporan_status_idx" ON "laporan" USING btree ("status_laporan");--> statement-breakpoint
CREATE INDEX "laporan_waktu_dibuat_idx" ON "laporan" USING btree ("waktu_dibuat");--> statement-breakpoint
CREATE INDEX "laporan_jorong_idx" ON "laporan" USING btree ("id_jorong");--> statement-breakpoint
CREATE INDEX "laporan_kategori_idx" ON "laporan" USING btree ("id_kategori");--> statement-breakpoint
CREATE INDEX "tindak_lanjut_laporan_idx" ON "tindak_lanjut" USING btree ("id_laporan","waktu_pembaruan");