/**
 * Utilitas umum untuk SILAPOR-KU
 */
import { ALFABET_KODE_TIKET } from "./constants";

// Format tanggal lokal Indonesia
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Generate kode tiket: SLP-YYYYMM-XXXX (PRD FR-06).
 * - YYYYMM mengikuti waktu Jakarta, bukan UTC server, agar tidak bergeser bulan pada pergantian bulan.
 * - XXXX diambil dari CSPRNG (bukan Math.random) supaya kode tidak mudah ditebak.
 *   Alfabet 32 karakter membagi 256 habis, jadi tidak ada modulo bias.
 * Keunikan dijamin oleh UNIQUE(kode_tiket) di DB; createLaporan mengulang bila terjadi bentrok.
 */
export function generateTicketCode(now: Date = new Date()): string {
  const bagian = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const tahun = bagian.find((p) => p.type === "year")!.value;
  const bulan = bagian.find((p) => p.type === "month")!.value;

  const acak = crypto.getRandomValues(new Uint8Array(4));
  const sufiks = Array.from(acak, (b) => ALFABET_KODE_TIKET[b % ALFABET_KODE_TIKET.length]).join("");
  return `SLP-${tahun}${bulan}-${sufiks}`;
}

// Klasifikasi warna status laporan
export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case "menunggu":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "diproses":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "selesai":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "ditolak":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
    default:
      return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
  }
}
