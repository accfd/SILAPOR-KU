import type { Metadata } from "next";
import "./globals.css";
import SiteChrome, { SiteFooter } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "SILAPOR-KU | Sistem Layanan Pengaduan & Aspirasi Nagari Kambang Utara",
  description:
    "Portal resmi pengaduan dan penyampaian aspirasi masyarakat Nagari Kambang Utara, Pesisir Selatan. Lapor mudah, lacak tiket transparan, dan tindak lanjut cepat.",
  icons: {
    icon: "/favicon.webp",
    shortcut: "/favicon.webp",
    apple: "/Logo.webp",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <SiteChrome />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
