import "server-only";
import { z } from "zod";
import { AksesDitolakError } from "@/lib/auth";
import type { ActionResult } from "@/types";

export function sukses<T = undefined>(message: string, data?: T): ActionResult<T> {
  return { success: true, message, data };
}

export function gagal(message: string, errors?: Record<string, string[]>): ActionResult<never> {
  return { success: false, message, errors };
}

export function gagalValidasi(error: z.ZodError): ActionResult<never> {
  const { fieldErrors, formErrors } = z.flattenError(error);
  const errors = fieldErrors as Record<string, string[]>;
  const pesanPertama = Object.values(errors).flat()[0] ?? formErrors[0];
  return gagal(pesanPertama ?? "Data yang dikirim tidak valid.", errors);
}

/**
 * Ubah galat tak terduga menjadi pesan aman untuk klien (NFR-10): detail teknis hanya masuk log server,
 * tidak pernah ke respons.
 */
export function tanganiError(konteks: string, error: unknown): ActionResult<never> {
  if (error instanceof AksesDitolakError) return gagal(error.message);
  console.error(`[${konteks}]`, error);
  return gagal("Terjadi kesalahan pada sistem. Silakan coba lagi beberapa saat lagi.");
}
