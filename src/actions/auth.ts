"use server";

import prisma from "@/lib/prisma";
import { ActionResult, User } from "@/types";

/**
 * Server Action: Otentikasi Staf / Login Admin & Wali Nagari
 * (Fondasi awal yang dapat dilanjutkan oleh Lutfi & Dea untuk hashing/session cookies)
 */
export async function loginStaff(formData: FormData): Promise<ActionResult<{ user: Omit<User, "password_hash"> }>> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return {
        success: false,
        message: "Email dan password wajib diisi.",
      };
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return {
        success: false,
        message: "Akun dengan email tersebut tidak ditemukan.",
      };
    }

    // TODO (BE Team): Implementasi verifikasi password menggunakan bcrypt / argon2
    if (user.password_hash !== password) {
      return {
        success: false,
        message: "Kata sandi yang Anda masukkan salah.",
      };
    }

    return {
      success: true,
      message: "Login berhasil.",
      data: {
        user: {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    };
  } catch (error) {
    console.error("Error logging in:", error);
    return {
      success: false,
      message: "Terjadi kesalahan saat proses login.",
    };
  }
}

/**
 * Server Action: Logout Sesi
 */
export async function logoutStaff(): Promise<ActionResult> {
  // TODO (BE Team): Hapus session cookie atau token auth
  return {
    success: true,
    message: "Logout berhasil.",
  };
}
