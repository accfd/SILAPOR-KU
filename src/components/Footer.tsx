import Link from "next/link";
import { ShieldAlert, MapPin, Mail, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                SILAPOR<span className="text-emerald-400">-KU</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed">
              Sistem Informasi Layanan Pengaduan & Aspirasi Nagari Kambang Utara. Wadah resmi masyarakat
              untuk menyampaikan aspirasi, keluhan fasilitas publik, dan memantau penanganan secara terbuka.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Menu Cepat
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition">
                  Beranda
                </Link>
              </li>
              <li>
                <Link href="/lapor" className="hover:text-white transition">
                  Formulir Lapor
                </Link>
              </li>
              <li>
                <Link href="/cek-tiket" className="hover:text-white transition">
                  Pelacakan Tiket
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white transition">
                  Login Admin Nagari
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Nagari */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Kontak Kantor Nagari
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Kambang Utara, Kec. Lengayang, Kab. Pesisir Selatan, Sumatera Barat</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>(0756) 123456</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>kontak@kambangutara.desa.id</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Pemerintah Nagari Kambang Utara & Tim IS-SIA.</p>
          <p>Ditenagai oleh Next.js & Neon PostgreSQL</p>
        </div>
      </div>
    </footer>
  );
}
