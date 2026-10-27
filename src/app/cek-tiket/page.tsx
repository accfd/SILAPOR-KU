"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getTicketByCode } from "@/actions/ticket";
import { Ticket } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { formatDate } from "@/lib/utils";
import { Search, MapPin, Calendar, MessageSquare, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

function CekTiketContent() {
  const searchParams = useSearchParams();
  const initialKode = searchParams.get("kode") || "";

  const [kodeTiket, setKodeTiket] = useState(initialKode);
  const [isLoading, setIsLoading] = useState(false);
  const [ticketData, setTicketData] = useState<Ticket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialKode) {
      handleSearch(initialKode);
    }
  }, [initialKode]);

  const handleSearch = async (kodeToSearch?: string) => {
    const code = (kodeToSearch || kodeTiket).trim();
    if (!code) {
      setErrorMessage("Silakan masukkan kode tiket terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setTicketData(null);

    try {
      const res = await getTicketByCode(code);
      if (res.success && res.data) {
        setTicketData(res.data);
      } else {
        setErrorMessage(res.message || "Tiket tidak ditemukan. Pastikan format kode tiket sudah benar.");
      }
    } catch {
      setErrorMessage("Gagal menghubungkan ke server pelacakan tiket.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      {/* Header & Search Bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600">
            <Search className="w-4 h-4" />
            Pelacakan Mandiri
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Lacak Status Laporan
          </h1>
          <p className="text-sm text-slate-500">
            Masukkan kode tiket yang Anda peroleh saat mengirim laporan untuk melihat progres penanganannya.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={kodeTiket}
              onChange={(e) => setKodeTiket(e.target.value.toUpperCase())}
              placeholder="Contoh: SLP-202610-ABCD"
              className="w-full px-4 py-3.5 pl-11 rounded-xl border border-slate-300 font-mono text-sm uppercase tracking-wider focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 text-sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cari Tiket"}
          </button>
        </form>
      </div>

      {/* Pesan Error */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Detail Hasil Pencarian Tiket */}
      {ticketData && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <span className="text-xs uppercase font-semibold text-slate-400">Kode Tiket</span>
              <div className="text-2xl font-bold font-mono text-emerald-600">
                {ticketData.nomor_tiket}
              </div>
            </div>
            <div>
              <StatusBadge status={ticketData.status} size="md" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 mb-2">
                {ticketData.kategori}
              </span>
              <h2 className="text-xl font-bold text-slate-900">{ticketData.judul}</h2>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
              {ticketData.deskripsi}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 pt-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  {ticketData.jorong ? `${ticketData.jorong} - ` : ""}
                  {ticketData.lokasi}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dilaporkan pada {formatDate(ticketData.created_at)}</span>
              </div>
            </div>

            {/* Lampiran Foto Bukti */}
            {ticketData.lampiran_url && (
              <div className="pt-2">
                <span className="block text-xs font-semibold uppercase text-slate-400 mb-2">
                  Foto Bukti yang Dilampirkan
                </span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={ticketData.lampiran_url}
                  alt="Bukti Kejadian"
                  className="max-h-60 rounded-xl object-cover border border-slate-200 shadow-sm"
                />
              </div>
            )}
          </div>

          {/* Tanggapan Resmi Aparatur Nagari */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              Tanggapan Resmi Aparatur Nagari
            </h3>
            {ticketData.tanggapan ? (
              <div className="bg-emerald-50/60 border border-emerald-100 p-4 rounded-xl text-sm text-emerald-900 leading-relaxed">
                {ticketData.tanggapan}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                Laporan ini sedang dalam antrean verifikasi Admin Nagari. Tanggapan dan instruksi tindak lanjut akan diperbarui di sini.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CekTiketPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" /> Memuat halaman pelacakan tiket...
        </div>
      }
    >
      <CekTiketContent />
    </Suspense>
  );
}
