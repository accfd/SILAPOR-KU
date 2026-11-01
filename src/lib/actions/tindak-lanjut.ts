"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { laporan, tindakLanjut } from "@/db/schema";
import { gagal, gagalValidasi, sukses, tanganiError } from "@/lib/action-result";
import { wajibAparatur } from "@/lib/auth";
import { ALUR_STATUS, type StatusLaporan } from "@/lib/constants";
import { updateStatusSchema } from "@/lib/validations";
import type { ActionResult, UpdateStatusInput } from "@/types";

/**
 * Pembaruan status + catatan penanganan oleh Admin Nagari (FR-18, FR-19, FR-20).
 * Hanya peran admin: Wali Nagari read-only (NFR-06). Identitas petugas selalu diambil dari sesi
 * yang diverifikasi ke DB, tidak pernah dari input client.
 *
 * Setiap pemanggilan menambah satu baris audit trail (tindak_lanjut) bersamaan dengan pembaruan
 * status laporan, dalam satu batch atomik. Baris audit tidak pernah diubah atau dihapus.
 */
export async function updateStatusLaporan(
  input: UpdateStatusInput,
): Promise<ActionResult<{ status_laporan: StatusLaporan }>> {
  try {
    const petugas = await wajibAparatur("admin");

    const parsed = updateStatusSchema.safeParse(input);
    if (!parsed.success) return gagalValidasi(parsed.error);
    const { id_laporan, status_tahapan, catatan_petugas } = parsed.data;

    const [saatIni] = await db
      .select({ status: laporan.status_laporan })
      .from(laporan)
      .where(eq(laporan.id_laporan, id_laporan))
      .limit(1);
    if (!saatIni) return gagal("Laporan tidak ditemukan.");

    if (!ALUR_STATUS[saatIni.status].includes(status_tahapan)) {
      return gagal(
        saatIni.status === "selesai" || saatIni.status === "ditolak"
          ? `Laporan berstatus ${saatIni.status} dan tidak dapat diubah lagi.`
          : `Status tidak dapat diubah dari ${saatIni.status} ke ${status_tahapan}.`,
      );
    }

    await db.batch([
      db
        .update(laporan)
        .set({
          status_laporan: status_tahapan,
          // waktu_selesai hanya untuk laporan yang tuntas ditangani, bukan yang ditolak.
          ...(status_tahapan === "selesai" && { waktu_selesai: new Date() }),
        })
        .where(eq(laporan.id_laporan, id_laporan)),
      db.insert(tindakLanjut).values({
        id_laporan,
        id_aparatur: petugas.id_aparatur,
        status_tahapan,
        catatan_petugas,
      }),
    ]);

    return sukses("Status laporan berhasil diperbarui.", { status_laporan: status_tahapan });
  } catch (error) {
    return tanganiError("updateStatusLaporan", error);
  }
}
