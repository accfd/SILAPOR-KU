"use server";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { aparatur } from "@/db/schema";
import { gagal, gagalValidasi, sukses, tanganiError } from "@/lib/action-result";
import { createSession, deleteSession, getAparaturSaatIni } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import type { ActionResult, AparaturSesi } from "@/types";

// Hash tiruan: bcrypt.compare tetap dijalankan walau username tidak ada, supaya waktu respons
// tidak membedakan "username salah" dari "kata sandi salah".
const HASH_TIRUAN = "$2b$12$pD4l8IvDM.YeUpf1jXuBwuNPftybUgAC8/k9QYohysU5HWk7fFi1a";

/** Login aparatur (FR-13). FormData: username, password. */
export async function loginAparatur(formData: FormData): Promise<ActionResult<{ aparatur: AparaturSesi }>> {
  try {
    const parsed = loginSchema.safeParse({
      username: formData.get("username"),
      password: formData.get("password"),
    });
    if (!parsed.success) return gagalValidasi(parsed.error);
    const { username, password } = parsed.data;

    const [row] = await db.select().from(aparatur).where(eq(aparatur.username, username)).limit(1);

    const cocok = await bcrypt.compare(password, row?.password_hash ?? HASH_TIRUAN);
    if (!row || !cocok) return gagal("Username atau kata sandi salah.");

    await createSession({ id_aparatur: row.id_aparatur, peran: row.peran });

    return sukses("Login berhasil.", {
      aparatur: {
        id_aparatur: row.id_aparatur,
        username: row.username,
        nama_lengkap: row.nama_lengkap,
        peran: row.peran,
      },
    });
  } catch (error) {
    return tanganiError("loginAparatur", error);
  }
}

/** Logout (FR-15): menghapus cookie sesi. */
export async function logoutAparatur(): Promise<ActionResult> {
  try {
    await deleteSession();
    return sukses("Logout berhasil.");
  } catch (error) {
    return tanganiError("logoutAparatur", error);
  }
}

/** Aparatur yang sedang login, untuk menampilkan nama/peran di UI. */
export async function getSesiAparatur(): Promise<ActionResult<{ aparatur: AparaturSesi }>> {
  try {
    const pengguna = await getAparaturSaatIni();
    if (!pengguna) return gagal("Belum login.");
    return sukses("Sesi aktif.", { aparatur: pengguna });
  } catch (error) {
    return tanganiError("getSesiAparatur", error);
  }
}
