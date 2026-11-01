"use client";

import { useState, useEffect } from "react";
import { getDaftarLaporan, getDetailLaporan } from "@/lib/actions/laporan";
import { updateStatusLaporan } from "@/lib/actions/tindak-lanjut";
import { ALUR_STATUS } from "@/lib/constants";
import { LaporanDetailDTO, LaporanRingkasDTO, StatusLaporan } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import Modal from "@/components/Modal";
import { formatDate } from "@/lib/utils";
import {
  Inbox,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  RefreshCw,
  Edit3,
  Loader2,
  MapPin,
  Calendar,
  User,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<LaporanRingkasDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] = useState<LaporanRingkasDTO | null>(null);
  const [detail, setDetail] = useState<LaporanDetailDTO | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Form update status
  const [newStatus, setNewStatus] = useState<StatusLaporan>("diproses");
  const [tanggapanText, setTanggapanText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const res = await getDaftarLaporan(
        filterStatus !== "ALL" ? { status_laporan: filterStatus as StatusLaporan } : undefined
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleOpenDetail = async (ticket: LaporanRingkasDTO) => {
    setSelectedTicket(ticket);
    setDetail(null);
    const res = await getDetailLaporan(ticket.id_laporan);
    if (res.success && res.data) setDetail(res.data);
  };

  const handleOpenUpdate = (ticket: LaporanRingkasDTO) => {
    setSelectedTicket(ticket);
    // Catatan baru ditambahkan ke riwayat (audit trail), bukan menimpa catatan lama.
    setNewStatus(ALUR_STATUS[ticket.status_laporan][0] ?? ticket.status_laporan);
    setTanggapanText("");
    setSaveError(null);
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await updateStatusLaporan({
        id_laporan: selectedTicket.id_laporan,
        status_tahapan: newStatus as "diproses" | "selesai" | "ditolak",
        catatan_petugas: tanggapanText,
      });
      if (!res.success) {
        setSaveError(res.message);
        return;
      }
      setIsUpdateModalOpen(false);
      setSelectedTicket(null);
      await fetchTickets();
    } catch (e) {
      console.error(e);
      setSaveError("Terjadi gangguan jaringan saat menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  const countMenunggu = tickets.filter((t) => t.status_laporan === "menunggu").length;
  const countDiproses = tickets.filter((t) => t.status_laporan === "diproses").length;
  const countSelesai = tickets.filter((t) => t.status_laporan === "selesai").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Dasbor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">
            <Inbox className="w-4 h-4" />
            Dasbor Operasional
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Antrean Pengaduan Warga
          </h1>
          <p className="text-sm text-slate-500">
            Kelola verifikasi, validasi foto bukti, dan pembaruan tindak lanjut laporan masyarakat.
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

      {/* Ringkasan Antrean Kerja */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-amber-700 tracking-wider">
              Menunggu Pemeriksaan
            </div>
            <div className="text-2xl font-bold text-amber-900 mt-1">{countMenunggu}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-blue-700 tracking-wider">
              Sedang Diproses
            </div>
            <div className="text-2xl font-bold text-blue-900 mt-1">{countDiproses}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs uppercase font-semibold text-emerald-700 tracking-wider">
              Laporan Selesai
            </div>
            <div className="text-2xl font-bold text-emerald-900 mt-1">{countSelesai}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Tabel Data Laporan */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">
              Filter Status:
            </span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-medium py-1.5 px-3 rounded-lg border border-slate-200 bg-slate-50 outline-none"
            >
              <option value="ALL">Semua Status</option>
              <option value="menunggu">Menunggu Pemeriksaan</option>
              <option value="diproses">Sedang Diproses</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {tickets.length} Laporan Ditampilkan
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Memuat daftar laporan...
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">
            Tidak ada laporan dalam status ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Kode Tiket</th>
                  <th className="py-3.5 px-4 font-semibold">Pelapor & Jorong</th>
                  <th className="py-3.5 px-4 font-semibold">Judul & Kategori</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Tanggal</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Aksi (CRUD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((t) => (
                  <tr key={t.id_laporan} className="hover:bg-slate-50/70 transition">
                    <td className="py-4 px-4 font-mono font-bold text-emerald-600">
                      {t.kode_tiket}
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900">
                        {t.is_anonim ? (
                          <span className="italic text-slate-400">Anonim</span>
                        ) : (
                          t.nama_pelapor || "Warga"
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{t.nama_jorong}</div>
                    </td>
                    <td className="py-4 px-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">{t.judul_laporan}</div>
                      <div className="text-xs text-slate-500 truncate">{t.nama_kategori}</div>
                    </td>
                    <td className="py-4 px-4">
                      <StatusBadge status={t.status_laporan} size="sm" />
                    </td>
                    <td className="py-4 px-4 text-xs text-slate-500">
                      {formatDate(t.waktu_dibuat)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenDetail(t)}
                          title="Lihat Detail & Foto Bukti"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenUpdate(t)}
                          disabled={ALUR_STATUS[t.status_laporan].length === 0}
                          title={
                            ALUR_STATUS[t.status_laporan].length === 0
                              ? "Laporan sudah final dan tidak dapat diubah"
                              : "Tindak Lanjut & Ubah Status"
                          }
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detail Laporan (Read / Inspection) */}
      {selectedTicket && !isUpdateModalOpen && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Detail Laporan: ${selectedTicket.kode_tiket}`}
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
                    {detail.nomor_kontak ? ` (${detail.nomor_kontak})` : ""}
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

              {/* Foto Bukti Resolusi Penuh */}
              {detail.lampiran.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="block text-xs font-semibold uppercase text-slate-400">
                    Foto Bukti Lapangan:
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

              {/* Riwayat Tindak Lanjut (Audit Trail) */}
              {detail.riwayat.length > 0 && (
                <div className="pt-2 space-y-2">
                  <span className="block text-xs font-semibold uppercase text-slate-400">
                    Riwayat Penanganan:
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
              )}

              <div className="pt-4 flex justify-end gap-2">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Tutup
                </button>
                {ALUR_STATUS[selectedTicket.status_laporan].length > 0 && (
                  <button
                    onClick={() => {
                      handleOpenUpdate(selectedTicket);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                  >
                    Tindak Lanjut Laporan Ini
                  </button>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Modal Update Status & Tindak Lanjut (CRUD Action) */}
      {selectedTicket && isUpdateModalOpen && (
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Tindak Lanjut Tiket: ${selectedTicket.kode_tiket}`}
        >
          <form onSubmit={handleSaveUpdate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Pilih Status Penanganan
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as StatusLaporan)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {ALUR_STATUS[selectedTicket.status_laporan].includes("diproses") && (
                  <option value="diproses">
                    {selectedTicket.status_laporan === "diproses"
                      ? "Tetap Diproses (Tambah Catatan Progres)"
                      : "Sedang Diproses (Instruksi Lapangan)"}
                  </option>
                )}
                {ALUR_STATUS[selectedTicket.status_laporan].includes("selesai") && (
                  <option value="selesai">Selesai (Penanganan Tuntas)</option>
                )}
                {ALUR_STATUS[selectedTicket.status_laporan].includes("ditolak") && (
                  <option value="ditolak">Tolak Laporan (Tidak Valid / Fiktif)</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Catatan Penanganan / Tanggapan Resmi
              </label>
              <textarea
                rows={4}
                required
                value={tanggapanText}
                onChange={(e) => setTanggapanText(e.target.value)}
                placeholder="Tuliskan catatan progres atau alasan status diperbarui (catatan ini dapat dibaca oleh warga pada pelacakan tiket)..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {saveError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {saveError}
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-400 rounded-lg transition flex items-center gap-1.5"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
