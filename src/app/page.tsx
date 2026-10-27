import Link from "next/link";
import { ShieldCheck, FileText, Search, Clock, CheckCircle, ArrowRight, MapPin, Users } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold tracking-wide">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Portal Resmi Pengaduan Nagari Kambang Utara
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
              Sampaikan Aspirasi & Keluhan untuk{" "}
              <span className="text-emerald-600 underline decoration-emerald-300">
                Kemajuan Nagari
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Layanan pelaporan masyarakat yang transparan, mudah, dan akuntabel. Wajib sertakan foto bukti kejadian dan pantau proses penanganannya secara mandiri melalui kode tiket.
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/lapor"
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 group text-base"
              >
                <FileText className="w-5 h-5" />
                Buat Laporan Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/cek-tiket"
                className="w-full sm:w-auto px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-800 font-semibold rounded-xl border border-slate-300 shadow-sm transition-all flex items-center justify-center gap-2 text-base"
              >
                <Search className="w-5 h-5 text-emerald-600" />
                Lacak Status Tiket
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Langkah Mudah */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Bagaimana Cara Kerjanya?
          </h2>
          <p className="text-slate-500 text-sm mt-2">
            Hanya 3 langkah sederhana untuk mengawal aduan sampai tuntas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-900">Isi Formulir & Lampirkan Foto</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Jelaskan keluhan atau aspirasi Anda, tentukan wilayah jorong, dan wajib unggah minimal 1 foto bukti kondisi di lapangan.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-900">Dapatkan Kode Tiket Unik</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Setelah dikirim, Anda akan langsung memperoleh kode tiket resmi (contoh: <code>SLP-202610-ABCD</code>) sebagai bukti tanda terima.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3 relative">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 font-bold text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-900">Pantau Tindak Lanjut Aparatur</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Cek perkembangan penanganan berkala, mulai dari proses verifikasi Admin Nagari hingga penyelesaian oleh instansi terkait.
            </p>
          </div>
        </div>
      </section>

      {/* Wilayah & Komitmen */}
      <section className="bg-emerald-900 text-white rounded-3xl max-w-7xl mx-auto px-6 sm:px-12 py-12 mb-12 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-emerald-300 text-sm font-semibold">
              <MapPin className="w-4 h-4" />
              Cakupan Wilayah Nagari Kambang Utara
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Melayani Seluruh Jorong di Nagari Kambang Utara
            </h2>
            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed">
              Pemerintah Nagari bersama tim pengembang berkomitmen menghadirkan saluran komunikasi yang aman dan terpercaya bagi kemakmuran bersama.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
              <Clock className="w-6 h-6 text-emerald-300 mx-auto mb-2" />
              <div className="text-2xl font-bold">24 Jam</div>
              <div className="text-xs text-emerald-200 mt-1">Layanan Pengaduan Online</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10">
              <CheckCircle className="w-6 h-6 text-emerald-300 mx-auto mb-2" />
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-emerald-200 mt-1">Transparansi Penanganan</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
