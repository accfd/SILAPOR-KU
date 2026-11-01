/**
 * Autentikasi sesi & proteksi hak akses aparatur (PRD FR-13..FR-15, FR-27, NFR-06).
 *
 * Cookie hanya menyimpan id & peran yang ditandatangani. Setiap tindakan aparatur memeriksa ulang ke DB
 * (wajibAparatur), sehingga akun yang dihapus atau diubah perannya langsung kehilangan akses
 * tanpa menunggu token kedaluwarsa.
 */
import "server-only";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/db";
import { aparatur } from "@/db/schema";
import type { Peran } from "@/lib/constants";
import {
  decryptSession,
  encryptSession,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
} from "@/lib/session";
import type { AparaturSesi } from "@/types";

export class AksesDitolakError extends Error {
  constructor(
    public readonly status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "AksesDitolakError";
  }
}

export async function createSession(a: { id_aparatur: string; peran: Peran }): Promise<void> {
  const token = await encryptSession({ id_aparatur: a.id_aparatur, peran: a.peran });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/** Aparatur yang sedang login (diverifikasi ke DB), atau null. */
export const getAparaturSaatIni = cache(async (): Promise<AparaturSesi | null> => {
  const cookieStore = await cookies();
  const sesi = await decryptSession(cookieStore.get(SESSION_COOKIE)?.value);
  if (!sesi) return null;

  const [row] = await db
    .select({
      id_aparatur: aparatur.id_aparatur,
      username: aparatur.username,
      nama_lengkap: aparatur.nama_lengkap,
      peran: aparatur.peran,
    })
    .from(aparatur)
    .where(eq(aparatur.id_aparatur, sesi.id_aparatur))
    .limit(1);

  // Peran diambil dari DB, bukan dari cookie.
  return row ?? null;
});

/**
 * Gerbang otorisasi untuk Server Action aparatur.
 * Lempar AksesDitolakError(401) bila belum login, (403) bila peran tidak diizinkan.
 */
export async function wajibAparatur(...peranDiizinkan: Peran[]): Promise<AparaturSesi> {
  const pengguna = await getAparaturSaatIni();
  if (!pengguna) {
    throw new AksesDitolakError(401, "Sesi Anda telah berakhir. Silakan login kembali.");
  }
  if (peranDiizinkan.length > 0 && !peranDiizinkan.includes(pengguna.peran)) {
    throw new AksesDitolakError(403, "Akses ditolak. Anda tidak memiliki wewenang untuk tindakan ini.");
  }
  return pengguna;
}
