import { NextResponse, type NextRequest } from "next/server";
import { decryptSession, SESSION_COOKIE } from "@/lib/session";

/**
 * Pemeriksaan optimistis: hanya membaca cookie, tanpa DB. Ini pengarah UX (FR-27), bukan batas keamanan;
 * otorisasi sebenarnya dijalankan ulang di setiap Server Action lewat wajibAparatur().
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sesi = await decryptSession(request.cookies.get(SESSION_COOKIE)?.value);

  if (!sesi) {
    return NextResponse.redirect(new URL("/admin/login?akses=ditolak", request.url));
  }

  // Admin hanya ke /admin/*, Wali Nagari hanya ke /wali-nagari/*.
  const rumah = sesi.peran === "admin" ? "/admin/dashboard" : "/wali-nagari/dashboard";
  const diizinkan = pathname.startsWith(sesi.peran === "admin" ? "/admin" : "/wali-nagari");
  if (!diizinkan) {
    return NextResponse.redirect(new URL(`${rumah}?akses=ditolak`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/dashboard/:path*", "/wali-nagari/:path*"],
};
