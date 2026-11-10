"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  Loader2,
  MapPin,
  MessageSquare,
  Printer,
  Search,
  Share2,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { getLaporanByKode } from "@/lib/actions/laporan";
import { formatDate } from "@/lib/utils";
import type { LaporanPublikDTO } from "@/types";

function CekTiketContent() {
  const searchParams = useSearchParams();
  const initialKode = searchParams.get("kode") ?? "";
  const [kodeTiket, setKodeTiket] = useState(initialKode.toUpperCase());
  const [isLoading, setIsLoading] = useState(Boolean(initialKode));
  const [ticketData, setTicketData] = useState<LaporanPublikDTO | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [shareMessage, setShareMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!initialKode) return;
    let active = true;
    getLaporanByKode(initialKode)
      .then((result) => {
        if (!active) return;
        if (result.success && result.data) {
          setTicketData(result.data);
          setKodeTiket(result.data.kode_tiket);
          setErrorMessage(null);
        } else {
          setTicketData(null);
          setErrorMessage(result.message || "Tiket tidak ditemukan. Periksa kembali kode tiket Anda.");
        }
      })
      .catch(() => {
        if (active) setErrorMessage("Pelacakan gagal dimuat karena gangguan jaringan. Silakan coba kembali.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialKode]);

  const handleSearch = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = kodeTiket.trim();
    if (!code) {
      setErrorMessage("Masukkan kode tiket terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setTicketData(null);
    try {
      const result = await getLaporanByKode(code);
      if (result.success && result.data) setTicketData(result.data);
      else setErrorMessage(result.message || "Tiket tidak ditemukan. Periksa kembali kode tiket Anda.");
    } catch {
      setErrorMessage("Pelacakan gagal dimuat karena gangguan jaringan. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  }, [kodeTiket]);

  const handleShare = async () => {
    if (!ticketData) return;
    const url = `${window.location.origin}/cek-tiket?kode=${encodeURIComponent(ticketData.kode_tiket)}`;
    setShareMessage(null);
    try {
      if (navigator.share) {
        await navigator.share({ title: "Lacak laporan SILAPOR-KU", url });
        setShareMessage("Tautan pelacakan siap dibagikan.");
      } else {
        await navigator.clipboard.writeText(url);
        setShareMessage("Tautan pelacakan berhasil disalin.");
      }
    } catch {
      setShareMessage("Tautan tidak dapat dibagikan otomatis. Salin alamat halaman ini untuk membagikannya.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link href="/" className="screen-only inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke beranda
      </Link>

      <section className="screen-only rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <Search className="h-4 w-4" />
            Pelacakan mandiri
          </div>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Lacak status laporan</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Masukkan kode tiket yang Anda terima setelah mengirim laporan.
          </p>
        </div>

        <form onSubmit={handleSearch} className="no-print mx-auto mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row">
          <label htmlFor="kode-tiket" className="sr-only">Kode tiket</label>
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-slate-400" />
            <input
              id="kode-tiket"
              type="text"
              required
              autoComplete="off"
              spellCheck={false}
              value={kodeTiket}
              onChange={(event) => setKodeTiket(event.target.value.toUpperCase())}
              placeholder="Contoh: SLP-202610-ABCD"
              className="w-full rounded-xl border border-slate-300 py-3.5 pl-11 pr-4 font-mono text-sm uppercase tracking-wider focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {isLoading ? "Mencari..." : "Cari laporan"}
          </button>
        </form>
      </section>

      {errorMessage && (
        <div role="alert" className="screen-only flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{errorMessage}</p>
        </div>
      )}

      {ticketData && (
        <>
          {/* TAMPILAN INTERAKTIF DI LAYAR (SCREEN ONLY) */}
          <div className="screen-only grid items-start gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
            <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-col justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kode tiket</span>
                  <p className="mt-1 break-all font-mono text-xl font-bold tracking-wider text-emerald-800 sm:text-2xl">
                    {ticketData.kode_tiket}
                  </p>
                </div>
                <StatusBadge status={ticketData.status_laporan} size="md" />
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {ticketData.nama_kategori}
                  </span>
                  <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold capitalize text-emerald-900">
                    {ticketData.jenis_laporan}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">{ticketData.judul_laporan}</h2>
                <p className="mt-4 whitespace-pre-line rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {ticketData.deskripsi_laporan}
                </p>
              </div>

              <div className="grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                <div className="flex items-start gap-2.5 text-sm text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
                  <span><strong className="block text-xs text-slate-500">Lokasi</strong>{ticketData.nama_jorong} · {ticketData.patokan_lokasi}</span>
                </div>
                <div className="flex items-start gap-2.5 text-sm text-slate-700">
                  <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-emerald-800" />
                  <span><strong className="block text-xs text-slate-500">Tanggal laporan</strong>{formatDate(ticketData.waktu_dibuat)}</span>
                </div>
              </div>

              {ticketData.lampiran.length > 0 && (
                <div className="border-t border-slate-100 pt-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Foto bukti</h3>
                  <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {ticketData.lampiran.map((foto) => (
                      <li key={foto.id_lampiran} className="overflow-hidden rounded-xl border border-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={foto.jalur_berkas} alt={foto.nama_berkas} className="h-36 w-full object-cover" />
                        <p className="truncate px-2 py-1.5 text-xs text-slate-500">{foto.nama_berkas}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="no-print flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Printer className="h-4 w-4" /> Cetak lembar bukti resmi
                </button>
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Share2 className="h-4 w-4" /> Bagikan tautan
                </button>
                {shareMessage && <span role="status" className="self-center text-xs text-slate-600">{shareMessage}</span>}
              </div>
            </section>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <MessageSquare className="h-4 w-4 text-emerald-800" />
                Riwayat dan tindak lanjut
              </h2>
              <ol className="mt-5 space-y-0">
                <li className="relative flex gap-3 pb-5">
                  <span className="absolute bottom-0 left-[11px] top-6 w-px bg-slate-200" aria-hidden="true" />
                  <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-800 text-white">
                    <CheckCircle2 className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">Laporan diterima</span>
                      <time className="text-xs text-slate-500">{formatDate(ticketData.waktu_dibuat)}</time>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600">Laporan tercatat dalam sistem SILAPOR-KU.</p>
                  </div>
                </li>
                {ticketData.riwayat.map((riwayat, index) => {
                  const isLatest = index === ticketData.riwayat.length - 1;
                  return (
                    <li key={`${riwayat.waktu_pembaruan}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
                      {!isLatest && <span className="absolute bottom-0 left-[11px] top-6 w-px bg-slate-200" aria-hidden="true" />}
                      <span className={`relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        isLatest ? "bg-emerald-800 text-white" : "border-2 border-emerald-700 bg-white text-emerald-800"
                      }`}>
                        {riwayat.status_tahapan === "menunggu"
                          ? <Clock3 className="h-3.5 w-3.5" />
                          : <CheckCircle2 className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <StatusBadge status={riwayat.status_tahapan} size="sm" />
                          <time className="text-xs text-slate-500">{formatDate(riwayat.waktu_pembaruan)}</time>
                        </div>
                        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{riwayat.catatan_petugas}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
              {ticketData.riwayat.length === 0 && (
                <p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
                  Laporan sedang menunggu pemeriksaan. Catatan aparatur akan muncul di sini setelah ada tindak lanjut.
                </p>
              )}
            </section>
          </div>

          {/* DOKUMEN RESMI TANDA BUKTI CETAK (Hanya Muncul Saat Print / Unduh PDF) */}
          <div className="print-only text-slate-900 bg-white font-sans text-xs">
            {/* KOP SURAT KEDINASAN */}
            <div className="border-b-4 border-double border-slate-950 pb-3 text-center">
              <div className="flex items-center justify-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/Logo.webp"
                  alt="Logo Nagari Kambang Utara"
                  className="h-16 w-16 shrink-0 object-contain"
                />
                <div className="text-center">
                  <h3 className="text-xs font-bold tracking-widest uppercase text-slate-800">PEMERINTAH KABUPATEN PESISIR SELATAN</h3>
                  <h4 className="text-sm font-bold tracking-wider uppercase text-slate-900">KECAMATAN LENGAYANG</h4>
                  <h2 className="text-lg font-black tracking-wide uppercase text-slate-950">PEMERINTAH NAGARI KAMBANG UTARA</h2>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Alamat: Jl. Raya Kambang - Pasar Baru, Nagari Kambang Utara, Kec. Lengayang, Kode Pos 25672
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Laman: https://kambangutara.desa.id | Email: kontak@kambangutara.desa.id | Telp: (0756) 123456
                  </p>
                </div>
              </div>
            </div>

            {/* JUDUL DOKUMEN */}
            <div className="my-5 text-center">
              <h1 className="text-sm font-extrabold uppercase tracking-wider underline">
                SURAT TANDA BUKTI PENERIMAAN LAPORAN MASYARAKAT
              </h1>
              <p className="mt-1 font-mono text-xs font-semibold text-slate-800">
                NOMOR REGISTRASI: {ticketData.kode_tiket}
              </p>
            </div>

            {/* KOTAK HEADER REGISTRASI */}
            <div className="mb-4 rounded-lg border border-slate-400 bg-slate-50/70 p-3">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                <div>
                  <span className="font-semibold text-slate-700">Kode Tiket Registrasi: </span>
                  <span className="font-mono text-sm font-bold text-slate-950">{ticketData.kode_tiket}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Waktu Masuk Laporan: </span>
                  <span className="font-medium text-slate-950">{formatDate(ticketData.waktu_dibuat)}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Jenis Layanan: </span>
                  <span className="font-bold uppercase text-slate-950">
                    {ticketData.jenis_laporan === "pengaduan" ? "Pengaduan Masalah" : "Aspirasi & Usulan"}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Status Penanganan: </span>
                  <span className="inline-block rounded border border-slate-800 bg-white px-2 py-0.5 text-[11px] font-bold uppercase text-slate-950">
                    {ticketData.status_laporan === "menunggu"
                      ? "Menunggu Pemeriksaan"
                      : ticketData.status_laporan === "diproses"
                        ? "Sedang Diproses"
                        : ticketData.status_laporan === "selesai"
                          ? "Selesai Ditangani"
                          : "Ditolak / Tidak Memenuhi Syarat"}
                  </span>
                </div>
              </div>
            </div>

            {/* RINCIAN DATA LAPORAN */}
            <div className="mb-4">
              <h2 className="mb-1.5 border-b border-slate-300 pb-1 text-xs font-bold uppercase text-slate-900">
                I. Rincian Laporan Pengaduan / Aspirasi
              </h2>
              <table className="w-full border-collapse text-xs">
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="w-44 py-1.5 font-semibold text-slate-700">Kategori Aduan</td>
                    <td className="py-1.5">: {ticketData.nama_kategori}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-semibold text-slate-700">Wilayah Jorong</td>
                    <td className="py-1.5">: {ticketData.nama_jorong}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-semibold text-slate-700">Patokan / Alamat Lokasi</td>
                    <td className="py-1.5">: {ticketData.patokan_lokasi}</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 font-semibold text-slate-700">Identitas Pelapor</td>
                    <td className="py-1.5">: Tercatat secara Rahasia / Anonim (Terlindungi Sistem)</td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="py-1.5 align-top font-semibold text-slate-700">Judul Laporan</td>
                    <td className="py-1.5 font-bold text-slate-950">: {ticketData.judul_laporan}</td>
                  </tr>
                  <tr>
                    <td className="py-1.5 align-top font-semibold text-slate-700">Uraian Lengkap</td>
                    <td className="py-1.5 whitespace-pre-line leading-relaxed">: {ticketData.deskripsi_laporan}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* FOTO BUKTI KEJADIAN */}
            {ticketData.lampiran.length > 0 && (
              <div className="mb-4">
                <h2 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase text-slate-900">
                  II. Lampiran Foto Bukti Kejadian ({ticketData.lampiran.length} Foto)
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {ticketData.lampiran.map((foto, idx) => (
                    <div key={foto.id_lampiran} className="rounded border border-slate-300 p-1 text-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={foto.jalur_berkas} alt={foto.nama_berkas} className="h-28 w-full rounded object-cover" />
                      <p className="mt-1 truncate text-[10px] text-slate-600">Foto #{idx + 1}: {foto.nama_berkas}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RIWAYAT PENANGANAN */}
            <div className="mb-6">
              <h2 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase text-slate-900">
                {ticketData.lampiran.length > 0 ? "III." : "II."} Lini Masa & Riwayat Tindak Lanjut Aparatur
              </h2>
              <table className="w-full border-collapse border border-slate-400 text-left text-[11px]">
                <thead>
                  <tr className="border-b border-slate-400 bg-slate-100 font-bold">
                    <th className="w-10 border-r border-slate-400 p-2 text-center">No</th>
                    <th className="w-36 border-r border-slate-400 p-2">Waktu Pembaruan</th>
                    <th className="w-32 border-r border-slate-400 p-2">Status Tahapan</th>
                    <th className="p-2">Catatan Resmi Petugas Lapangan</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="border-r border-slate-200 p-2 text-center">1</td>
                    <td className="border-r border-slate-200 p-2">{formatDate(ticketData.waktu_dibuat)}</td>
                    <td className="border-r border-slate-200 p-2 font-semibold">Laporan Diterima</td>
                    <td className="p-2">Laporan masyarakat berhasil didaftarkan ke dalam sistem SILAPOR-KU.</td>
                  </tr>
                  {ticketData.riwayat.map((riwayat, index) => (
                    <tr key={index} className="border-b border-slate-200">
                      <td className="border-r border-slate-200 p-2 text-center">{index + 2}</td>
                      <td className="border-r border-slate-200 p-2">{formatDate(riwayat.waktu_pembaruan)}</td>
                      <td className="border-r border-slate-200 p-2 font-semibold uppercase">{riwayat.status_tahapan}</td>
                      <td className="p-2 whitespace-pre-line">{riwayat.catatan_petugas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* CATATAN RESMI & PENGESAHAN ELEKTRONIK */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-300 pt-3">
              <div className="space-y-1 text-[10px] text-slate-600">
                <p className="font-semibold text-slate-800">Ketentuan & Catatan Penting:</p>
                <p>1. Surat tanda bukti ini merupakan bukti registrasi resmi layanan pengaduan SILAPOR-KU.</p>
                <p>2. Warga dapat mengecek perkembangan penanganan melalui https://kambangutara.desa.id/cek-tiket.</p>
                <p>3. Dokumen ini dicetak otomatis secara elektronik dan sah tanpa memerlukan stempel fisik.</p>
              </div>

              <div className="text-right text-[11px]">
                <p>Kambang Utara, {formatDate(new Date())}</p>
                <p className="mt-1 font-semibold text-slate-900">Pemerintah Nagari Kambang Utara</p>
                <p className="text-[10px] text-slate-500">Unit Layanan Pengaduan & Aspirasi (SILAPOR-KU)</p>
                <div className="my-2 inline-block rounded border border-emerald-900 bg-emerald-50 px-2.5 py-0.5 font-mono text-[9px] font-bold text-emerald-950">
                  [ DOKUMEN DIGITAL TERVERIFIKASI ]
                </div>
                <p className="font-semibold text-slate-800">Aparatur Nagari Kambang Utara</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function CekTiketPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Memuat halaman pelacakan...</div>}>
      <CekTiketContent />
    </Suspense>
  );
}
