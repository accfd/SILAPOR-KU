/**
 * Enkripsi/dekripsi token sesi (JWT HS256 via jose).
 *
 * Sengaja tanpa `server-only` dan tanpa akses DB/next/headers agar dapat dipakai juga oleh
 * src/proxy.ts. Jangan impor dari Client Component: SESSION_SECRET hanya ada di server.
 * Keputusan otorisasi sebenarnya ada di src/lib/auth.ts (memeriksa ulang ke DB).
 */
import { jwtVerify, SignJWT } from "jose";
import { PERAN_APARATUR, type Peran } from "./constants";

export const SESSION_COOKIE = "silapor_session";
// Sesi satu hari kerja; aparatur login ulang setiap hari.
export const SESSION_DURATION_SECONDS = 8 * 60 * 60;

export interface SessionPayload {
  id_aparatur: string;
  peran: Peran;
}

function getKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET belum diatur atau kurang dari 32 karakter (lihat .env.example).");
  }
  return new TextEncoder().encode(secret);
}

export async function encryptSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ peran: payload.peran })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.id_aparatur)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getKey());
}

/** Mengembalikan null untuk token kosong, kedaluwarsa, atau dipalsukan. */
export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  // Di luar try: konfigurasi yang salah harus gagal keras, bukan diam-diam dianggap "belum login".
  const key = getKey();
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const peran = payload.peran;
    if (!payload.sub || !PERAN_APARATUR.includes(peran as Peran)) return null;
    return { id_aparatur: payload.sub, peran: peran as Peran };
  } catch {
    return null;
  }
}
