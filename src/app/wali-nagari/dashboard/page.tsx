"use client";

import { useState, useEffect } from "react";
import { getDaftarLaporan, getDetailLaporan } from "@/lib/actions/laporan";
import { LaporanDetailDTO, LaporanRingkasDTO } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { formatDate } from "@/lib/utils";
import {
  PieChart,
  BarChart3,
  TrendingUp,
  MapPin,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  Loader2,
  Calendar,
  User,
  ShieldCheck,
} from "lucide-react";

export default function WaliNagariDashboardPage() {
  const [tickets, setTickets] = useState<LaporanRingkasDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<LaporanRingkasDTO | null>(null);
  const [detail, setDetail] = useState<LaporanDetailDTO | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await getDaftarLaporan();
      if (res.success && res.data) {
        setTickets(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleOpenDetail = async (ticket: LaporanRingkasDTO) => {
    setSelectedTicket(ticket);
    setDetail(null);
    const res = await getDetailLaporan(ticket.id_laporan);
    if (res.success && res.data) setDetail(res.data);
  };

  const total = tickets.length;
  const selesai = tickets.filter((t) => t.status_laporan === "selesai").length;
  const diproses = tickets.filter((t) => t.status_laporan === "diproses").length;
  const menunggu = tickets.filter((t) => t.status_laporan === "menunggu").length;
  const ditolak = tickets.filter((t) => t.status_laporan === "ditolak").length;

  const completionRate = total > 0 ? Math.round((selesai / total) * 100) : 0;

  // Sebaran per jorong
  const jorongCounts = tickets.reduce((acc, t) => {
    const key = t.nama_jorong || "Lainnya";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sebaran per kategori
  const kategoriCounts = tickets.reduce((acc, t) => {
    const key = t.nama_kategori || "Umum";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Eksekutif */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            <PieChart className="w-4 h-4" />
            Dasbor Eksekutif Pimpinan
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Monitoring & Evaluasi Wali Nagari
          </h1>
          <p className="text-sm text-slate-500">
            Analitik makro laporan masyarakat Nagari Kambang Utara untuk pengambilan kebijakan publik.
          </p>
        </div>

        <button
          onClick={fetchTickets}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium shadow-sm transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Segarkan Data
        </button>
      </div>

      {/* Kartu Metrik Utama */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="text-xs uppercase font-semibold text-slate-400">Total Aduan Masuk</div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">{total}</div>
          <div className="text-xs text-slate-500 mt-1">Laporan dari warga nagari</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm">
          <div className="text-xs uppercase font-semibold text-emerald-600 flex items-center justify-between">
            <span>Tingkat Penyelesaian</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">{completionRate}%</div>
          <div className="text-xs text-emerald-700 mt-1">{selesai} laporan tuntas ditindaklanjuti</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm">
          <div className="text-xs uppercase font-semibold text-blue-600 flex items-center justify-between">
            <span>Sedang Diproses</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-blue-600 mt-2">{diproses}</div>
          <div className="text-xs text-blue-700 mt-1">Aduan dalam pengerjaan teknis</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm">
          <div className="text-xs uppercase font-semibold text-amber-600 flex items-center justify-between">
            <span>Menunggu Verifikasi</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">{menunggu}</div>
          <div className="text-xs text-amber-700 mt-1">Aduan baru belum ditangani</div>
        </div>
      </div>

      {/* Distribusi Kategori & Sebaran Jorong */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribusi Kategori */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Distribusi Kategori Keluhan</h3>
          </div>
          {Object.keys(kategoriCounts).length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada data laporan.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {Object.entries(kategoriCounts).map(([cat, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{cat}</span>
                      <span>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Sebaran Wilayah Jorong */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900">Sebaran Laporan per Wilayah Jorong</h3>
          </div>
          {Object.keys(jorongCounts).length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">Belum ada data laporan.</p>
          ) : (
            <div className="space-y-3 pt-2">
              {Object.entries(jorongCounts).map(([jorong, count]) => {
                const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={jorong} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{jorong}</span>
                      <span>
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tabel Peninjauan Menyeluruh (Read-Only) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900">Daftar Audit Laporan (Read-Only)</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Wali Nagari berhak meninjau seluruh isi laporan, bukti foto, dan kronologi penanganan.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Memuat data eksekutif...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Kode Tiket</th>
                  <th className="py-3.5 px-4 font-semibold">Jorong & Pelapor</th>
                  <th className="py-3.5 px-4 font-semibold">Judul Aduan</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Tanggal Diajukan</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Tinjau</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id_laporan} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-4 font-mono font-bold text-emerald-600">
                      {t.kode_tiket}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900">{t.nama_jorong}</div>
                      <div className="text-xs text-slate-400">
                        {t.is_anonim ? "Anonim" : t.nama_pelapor || "Warga"}
                      </div>
                    </td>
                    <td className="py-4 px-4 max-w-xs font-medium text-slate-900 truncate">
                      {t.judul_laporan}
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={t.status_laporan} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">{formatDate(t.waktu_dibuat)}</td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleOpenDetail(t)}
                        title="Buka Detail Laporan"
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Laporan Khusus Wali Nagari (Read-Only) */}
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Peninjauan Eksekutif: ${selectedTicket.kode_tiket}`}
        >
          {!detail ? (
            <div className="py-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Memuat detail laporan...
            </div>
          ) : (
            <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700">
                  {detail.nama_kategori}
                </span>
                <StatusBadge status={detail.status_laporan} size="sm" />
              </div>

              <div>
                <h4 className="text-lg font-bold text-slate-900">{detail.judul_laporan}</h4>
                <p className="text-sm text-slate-600 mt-2 whitespace-pre-line bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  {detail.deskripsi_laporan}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 pt-1">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>
                    Pelapor: {detail.is_anonim ? "Anonim (Dirahasiakan)" : detail.nama_pelapor || "Warga"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>
                    {detail.nama_jorong} - {detail.patokan_lokasi}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Diajukan: {formatDate(detail.waktu_dibuat)}</span>
                </div>
              </div>

              {/* Foto Bukti */}
              {detail.lampiran.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="block text-xs font-semibold uppercase text-slate-400">
                    Foto Bukti yang Ditinjau:
                  </span>
                  {detail.lampiran.map((l) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={l.id_lampiran}
                      src={l.jalur_berkas}
                      alt={l.nama_berkas}
                      className="max-h-72 w-full rounded-xl object-contain bg-slate-950 p-1 border border-slate-200"
                    />
                  ))}
                </div>
              )}

              {/* Riwayat Penanganan */}
              {detail.riwayat.length > 0 ? (
                <div className="pt-2 space-y-2">
                  <span className="block text-xs font-semibold uppercase text-slate-400">
                    Catatan Progres dari Aparatur:
                  </span>
                  {detail.riwayat.map((r) => (
                    <div
                      key={r.id_tindak_lanjut}
                      className="text-xs bg-emerald-50 text-emerald-800 p-3 rounded-lg border border-emerald-100 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <StatusBadge status={r.status_tahapan} size="sm" />
                        <span>
                          {r.nama_petugas} - {formatDate(r.waktu_pembaruan)}
                        </span>
                      </div>
                      <p>{r.catatan_petugas}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Belum ada catatan tindak lanjut dari admin.</p>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
