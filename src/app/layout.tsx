import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SILAPOR-KU | Sistem Layanan Pengaduan & Aspirasi Nagari Kambang Utara",
  description:
    "Portal resmi pengaduan dan penyampaian aspirasi masyarakat Nagari Kambang Utara, Pesisir Selatan. Lapor mudah, lacak tiket transparan, dan tindak lanjut cepat.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
