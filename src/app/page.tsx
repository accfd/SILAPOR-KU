import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  LockKeyhole,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";

const langkah = [
  {
    nomor: "01",
    judul: "Ceritakan kebutuhan Anda",
    deskripsi: "Isi informasi laporan, pilih kategori dan wilayah jorong, lalu jelaskan lokasi kejadian.",
    icon: FileText,
  },
  {
    nomor: "02",
    judul: "Sertakan bukti pendukung",
    deskripsi: "Lampirkan foto agar petugas dapat memahami kondisi yang perlu ditinjau.",
    icon: MapPin,
  },
  {
    nomor: "03",
    judul: "Pantau dengan kode tiket",
    deskripsi: "Gunakan kode tiket untuk mengikuti pembaruan tindak lanjut secara mandiri.",
    icon: Search,
  },
];

export default function HomePage() {
  return (
    <div className="space-y-12 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section className="mx-auto grid max-w-7xl items-center gap-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)] lg:p-14">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-950">
            <ShieldCheck className="h-4 w-4" />
            Portal layanan resmi Nagari Kambang Utara
          </div>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            Sampaikan pengaduan dan aspirasi Anda.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            SILAPOR-KU membantu warga menyampaikan kebutuhan dengan mudah dan memantau perkembangan penanganan melalui kode tiket.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/lapor"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900"
            >
              <FileText className="h-4 w-4" />
              Buat laporan
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cek-tiket"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              <Search className="h-4 w-4 text-emerald-900" />
              Lacak laporan
            </Link>
          </div>
        </div>

        <aside className="rounded-2xl bg-emerald-950 p-6 text-white sm:p-7">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
            <ClipboardList className="h-5 w-5 text-emerald-200" />
          </div>
          <h2 className="mt-5 text-xl font-bold">Satu layanan, dua kebutuhan</h2>
          <p className="mt-2 text-sm leading-relaxed text-emerald-100">
            Sampaikan keluhan atau usulan, lalu pantau penanganannya di satu tempat.
          </p>
          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3 rounded-xl bg-white/10 p-3.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-emerald-950">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Sampaikan laporan</p>
                <p className="mt-0.5 text-xs text-emerald-100">Pilih pengaduan atau aspirasi.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl bg-white/10 p-3.5">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-300 text-emerald-950">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </span>
              <div>
                <p className="text-sm font-semibold">Lacak tindak lanjut</p>
                <p className="mt-0.5 text-xs text-emerald-100">Gunakan kode tiket yang diterima.</p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900">Alur layanan</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Cara menyampaikan laporan</h2>
          </div>
          <p className="max-w-lg text-sm text-slate-600">Ikuti tiga langkah sederhana untuk menyampaikan kebutuhan dan mengetahui perkembangannya.</p>
        </div>
        <ol className="grid gap-4 md:grid-cols-3">
          {langkah.map(({ nomor, judul, deskripsi, icon: Icon }) => (
            <li key={nomor} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-900">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-bold tracking-wider text-slate-300">{nomor}</span>
              </div>
              <h3 className="mt-5 text-base font-bold text-slate-900">{judul}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{deskripsi}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto flex max-w-7xl flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:p-6">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-900">
          <LockKeyhole className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-slate-900">Privasi pelapor tetap terlindungi</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-700">
            Anda dapat memilih untuk menyampaikan laporan secara anonim. Identitas pelapor tidak ditampilkan dalam pelacakan publik.
          </p>
        </div>
      </section>
    </div>
  );
}
