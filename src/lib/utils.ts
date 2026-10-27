/**
 * Utilitas umum untuk SILAPOR-KU
 */

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

// Generate format nomor tiket: SLP-YYYYMM-XXXX
export function generateTicketCode(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const randomChars = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SLP-${year}${month}-${randomChars}`;
}

// Klasifikasi warna status tiket
export function getStatusColor(status: string): { bg: string; text: string; border: string } {
  switch (status) {
    case "MENUNGGU":
      return { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" };
    case "DIPROSES":
      return { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" };
    case "SELESAI":
      return { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" };
    case "DITOLAK":
      return { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" };
    default:
      return { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" };
  }
}
