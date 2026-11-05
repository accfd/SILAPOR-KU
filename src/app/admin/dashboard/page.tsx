"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Filter,
  Loader2,
  Printer,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import LocationCard from "@/components/LocationCard";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { getDaftarLaporan, getDetailLaporan, getOpsiFormulir } from "@/lib/actions/laporan";
import { updateStatusLaporan } from "@/lib/actions/tindak-lanjut";
import { ALUR_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type {
  FilterLaporanInput,
  LaporanDetailDTO,
  LaporanRingkasDTO,
  OpsiFormulir,
  StatusLaporan,
} from "@/types";

export default function AdminDashboardPage() {
  const [tickets, setTickets] = useState<LaporanRingkasDTO[]>([]);
  const [opsi, setOpsi] = useState<OpsiFormulir | null>(null);
  const [filterStatus, setFilterStatus] = useState<StatusLaporan | "">("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterJorong, setFilterJorong] = useState("");
  const [filterDari, setFilterDari] = useState("");
  const [filterSampai, setFilterSampai] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<LaporanRingkasDTO | null>(null);
  const [detail, setDetail] = useState<LaporanDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<StatusLaporan>("diproses");
  const [tanggapanText, setTanggapanText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const detailRequest = useRef(0);

  const filter = useMemo<FilterLaporanInput>(() => ({
    ...(filterStatus && { status_laporan: filterStatus }),
    ...(filterKategori && { id_kategori: filterKategori }),
    ...(filterJorong && { id_jorong: filterJorong }),
    ...(filterDari && { dari: filterDari }),
    ...(filterSampai && { sampai: filterSampai }),
    limit: 500,
  }), [filterStatus, filterKategori, filterJorong, filterDari, filterSampai]);

  useEffect(() => {
    let active = true;
    getDaftarLaporan(filter)
      .then((result) => {
        if (!active) return;
        if (result.success && result.data) {
          setTickets(result.data);
          setErrorMessage(null);
        } else {
          setErrorMessage(result.message || "Daftar laporan tidak dapat dimuat.");
        }
      })
      .catch(() => {
        if (active) setErrorMessage("Daftar laporan gagal dimuat karena gangguan jaringan.");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [filter, refreshKey]);

  useEffect(() => {
    let active = true;
    getOpsiFormulir()
      .then((result) => {
        if (!active) return;
        if (result.success && result.data) setOpsi(result.data);
        else setErrorMessage(result.message || "Pilihan filter tidak dapat dimuat.");
      })
      .catch(() => {
        if (active) setErrorMessage("Pilihan filter gagal dimuat karena gangguan jaringan.");
      });
    return () => {
      active = false;
    };
  }, []);

  const handleOpenDetail = async (ticket: LaporanRingkasDTO) => {
    const requestId = ++detailRequest.current;
    setSelectedTicket(ticket);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      const result = await getDetailLaporan(ticket.id_laporan);
      if (requestId !== detailRequest.current) return;
      if (result.success && result.data) setDetail(result.data);
      else setDetailError(result.message || "Detail laporan tidak dapat dimuat.");
    } catch {
      if (requestId === detailRequest.current) setDetailError("Detail laporan gagal dimuat karena gangguan jaringan.");
    } finally {
      if (requestId === detailRequest.current) setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    detailRequest.current += 1;
    setSelectedTicket(null);
    setDetail(null);
    setDetailError(null);
  };

  const handleOpenUpdate = (ticket: LaporanRingkasDTO) => {
    setSelectedTicket(ticket);
    setNewStatus(ALUR_STATUS[ticket.status_laporan][0] ?? ticket.status_laporan);
    setTanggapanText("");
    setSaveError(null);
    setIsUpdateModalOpen(true);
  };

  const handleSaveUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedTicket) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const result = await updateStatusLaporan({
        id_laporan: selectedTicket.id_laporan,
        status_tahapan: newStatus as "diproses" | "selesai" | "ditolak",
        catatan_petugas: tanggapanText,
      });
      if (!result.success) {
        setSaveError(result.message);
        return;
      }

      setIsUpdateModalOpen(false);
      setSelectedTicket(null);
      setIsLoading(true);
      setRefreshKey((current) => current + 1);
    } catch {
      setSaveError("Perubahan gagal disimpan karena gangguan jaringan.");
    } finally {
      setIsSaving(false);
    }
  };

  const jumlahStatus = (status: StatusLaporan) => tickets.filter((ticket) => ticket.status_laporan === status).length;
  const kartuRingkasan = [
    { label: "Total laporan", nilai: tickets.length, icon: FileText, style: "border-slate-200 text-slate-800 bg-slate-50" },
    { label: "Menunggu pemeriksaan", nilai: jumlahStatus("menunggu"), icon: Clock3, style: "border-amber-200 text-amber-900 bg-amber-50" },
    { label: "Sedang diproses", nilai: jumlahStatus("diproses"), icon: RefreshCw, style: "border-blue-200 text-blue-900 bg-blue-50" },
    { label: "Selesai", nilai: jumlahStatus("selesai"), icon: CheckCircle2, style: "border-emerald-200 text-emerald-900 bg-emerald-50" },
    { label: "Ditolak", nilai: jumlahStatus("ditolak"), icon: XCircle, style: "border-rose-200 text-rose-900 bg-rose-50" },
  ];

  const resetFilter = () => {
    setIsLoading(true);
    setFilterStatus("");
    setFilterKategori("");
    setFilterJorong("");
    setFilterDari("");
    setFilterSampai("");
    setRefreshKey((current) => current + 1);
  };

  return (
    <div className="print-area mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <FileText className="h-4 w-4" />
            Dasbor operasional
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Antrean pengaduan warga</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Tinjau laporan, periksa bukti dan lokasi, lalu catat tindak lanjut resmi.
          </p>
        </div>
        <DashboardHeader peran="admin" />
      </div>

      {errorMessage && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <section aria-label="Ringkasan antrean laporan" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {kartuRingkasan.map(({ label, nilai, icon: Icon, style }) => (
          <div key={label} className={`flex items-center justify-between rounded-2xl border bg-white p-4 shadow-sm ${style}`}>
            <div>
              <p className="text-xs font-semibold">{label}</p>
              <p className="mt-1 text-2xl font-extrabold">{nilai}</p>
            </div>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/80">
              <Icon className="h-5 w-5" />
            </span>
          </div>
        ))}
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="flex items-center gap-2 font-bold text-slate-900">
                <Filter className="h-4 w-4 text-emerald-800" />
                Filter dan daftar laporan
              </h2>
              <p className="mt-1 text-xs text-slate-500">Filter berlaku langsung pada daftar dan rekap yang dicetak.</p>
            </div>
            <div className="no-print flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setRefreshKey((current) => current + 1);
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Segarkan
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-950"
              >
                <Printer className="h-4 w-4" /> Cetak rekap
              </button>
            </div>
          </div>

          <div className="no-print mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="text-xs font-medium text-slate-700">
              <span className="mb-1 flex items-center gap-1"><Search className="h-3.5 w-3.5" /> Status</span>
              <select
                value={filterStatus}
                onChange={(event) => {
                  setIsLoading(true);
                  setFilterStatus(event.target.value as StatusLaporan | "");
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Semua status</option>
                <option value="menunggu">Menunggu pemeriksaan</option>
                <option value="diproses">Sedang diproses</option>
                <option value="selesai">Selesai</option>
                <option value="ditolak">Ditolak</option>
              </select>
            </label>
            <label className="text-xs font-medium text-slate-700">
              Kategori
              <select
                value={filterKategori}
                onChange={(event) => {
                  setIsLoading(true);
                  setFilterKategori(event.target.value);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Semua kategori</option>
                {opsi?.kategori.map((kategori) => <option key={kategori.id_kategori} value={kategori.id_kategori}>{kategori.nama_kategori}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-700">
              Wilayah jorong
              <select
                value={filterJorong}
                onChange={(event) => {
                  setIsLoading(true);
                  setFilterJorong(event.target.value);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Semua jorong</option>
                {opsi?.jorong.map((jorong) => <option key={jorong.id_jorong} value={jorong.id_jorong}>{jorong.nama_jorong}</option>)}
              </select>
            </label>
            <label className="text-xs font-medium text-slate-700">
              <span className="mb-1 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Dari tanggal</span>
              <input
                type="date"
                value={filterDari}
                onChange={(event) => {
                  setIsLoading(true);
                  setFilterDari(event.target.value);
                }}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
            <label className="text-xs font-medium text-slate-700">
              Sampai tanggal
              <input
                type="date"
                value={filterSampai}
                onChange={(event) => {
                  setIsLoading(true);
                  setFilterSampai(event.target.value);
                }}
                className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </label>
          </div>
          <div className="no-print mt-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-slate-500">
              {filterDari && filterSampai && filterDari > filterSampai
                ? "Tanggal awal tidak boleh melewati tanggal akhir."
                : `Menampilkan ${tickets.length} laporan${tickets.length === 500 ? " (maksimal 500 hasil)" : ""}.`}
            </p>
            <button type="button" onClick={resetFilter} className="text-xs font-semibold text-emerald-900 underline-offset-2 hover:underline">
              Hapus semua filter
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" /> Memuat daftar laporan...
          </div>
        ) : tickets.length === 0 ? (
          <div className="py-16 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">Tidak ada laporan yang sesuai filter.</p>
            <p className="mt-1 text-xs text-slate-500">Ubah filter atau periksa kembali rentang tanggal.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm text-slate-600">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-3.5 font-semibold">Kode tiket</th>
                  <th className="px-4 py-3.5 font-semibold">Pelapor & jorong</th>
                  <th className="px-4 py-3.5 font-semibold">Laporan</th>
                  <th className="px-4 py-3.5 font-semibold">Status</th>
                  <th className="px-4 py-3.5 font-semibold">Tanggal masuk</th>
                  <th className="no-print px-4 py-3.5 text-center font-semibold">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tickets.map((ticket) => (
                  <tr key={ticket.id_laporan} className="hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-4 font-mono text-xs font-bold text-emerald-900">{ticket.kode_tiket}</td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-900">{ticket.is_anonim ? <span className="italic text-slate-500">Anonim</span> : ticket.nama_pelapor || "Warga"}</p>
                      <p className="mt-1 text-xs text-slate-500">{ticket.nama_jorong}</p>
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <p className="truncate font-semibold text-slate-900">{ticket.judul_laporan}</p>
                      <p className="mt-1 truncate text-xs text-slate-500">{ticket.nama_kategori} · {ticket.jenis_laporan}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4"><StatusBadge status={ticket.status_laporan} size="sm" /></td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">{formatDate(ticket.waktu_dibuat)}</td>
                    <td className="no-print whitespace-nowrap px-4 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleOpenDetail(ticket)}
                          aria-label={`Lihat detail ${ticket.kode_tiket}`}
                          className="rounded-lg bg-slate-100 p-2 text-slate-700 transition hover:bg-slate-200"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenUpdate(ticket)}
                          disabled={ALUR_STATUS[ticket.status_laporan].length === 0}
                          aria-label={`Tindak lanjuti ${ticket.kode_tiket}`}
                          title={ALUR_STATUS[ticket.status_laporan].length === 0 ? "Laporan berstatus final" : "Tindak lanjuti"}
                          className="rounded-lg bg-emerald-50 p-2 text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedTicket && !isUpdateModalOpen && (
        <Modal isOpen onClose={closeDetail} title={`Detail laporan · ${selectedTicket.kode_tiket}`} size="xl">
          {detailLoading ? (
            <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-600">
              <Loader2 className="h-5 w-5 animate-spin" /> Memuat detail laporan...
            </div>
          ) : detailError ? (
            <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{detailError}</div>
          ) : detail && (
            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.8fr)]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-slate-200 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{detail.nama_kategori}</span>
                      <span className="text-xs capitalize text-slate-500">{detail.jenis_laporan}</span>
                    </div>
                    <StatusBadge status={detail.status_laporan} size="sm" />
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{detail.judul_laporan}</h3>
                  <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{detail.deskripsi_laporan}</p>
                  <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
                    <p className="flex items-start gap-2 text-xs text-slate-600">
                      <User className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>Pelapor: {detail.is_anonim ? "Anonim (dirahasiakan)" : detail.nama_pelapor || "Warga"}{detail.nomor_kontak ? ` · ${detail.nomor_kontak}` : ""}</span>
                    </p>
                    <p className="flex items-start gap-2 text-xs text-slate-600">
                      <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                      <span>Dikirim {formatDate(detail.waktu_dibuat)}</span>
                    </p>
                  </div>
                </section>

                <LocationCard
                  jorong={detail.nama_jorong}
                  patokan={detail.patokan_lokasi}
                  lintang={detail.koordinat_lintang}
                  bujur={detail.koordinat_bujur}
                />

                <section>
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Foto bukti lapangan</h3>
                  {detail.lampiran.length > 0 ? (
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {detail.lampiran.map((foto) => (
                        <li key={foto.id_lampiran} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={foto.jalur_berkas} alt={foto.nama_berkas} className="max-h-72 w-full object-contain" />
                          <p className="truncate border-t border-slate-200 px-3 py-2 text-xs text-slate-600">{foto.nama_berkas}</p>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-xs text-slate-500">Tidak ada foto bukti.</p>}
                </section>
              </div>

              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Clock3 className="h-4 w-4 text-emerald-800" /> Riwayat penanganan
                </h3>
                {detail.riwayat.length ? (
                  <ol className="space-y-3">
                    {detail.riwayat.map((riwayat) => (
                      <li key={riwayat.id_tindak_lanjut} className="rounded-xl border border-slate-200 bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <StatusBadge status={riwayat.status_tahapan} size="sm" />
                          <time className="text-xs text-slate-500">{formatDate(riwayat.waktu_pembaruan)}</time>
                        </div>
                        <p className="mt-2 text-xs font-semibold text-slate-700">{riwayat.nama_petugas}</p>
                        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">{riwayat.catatan_petugas}</p>
                      </li>
                    ))}
                  </ol>
                ) : <p className="text-xs leading-relaxed text-slate-600">Belum ada catatan tindak lanjut.</p>}
                <button type="button" onClick={closeDetail} className="no-print mt-4 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                  Tutup detail
                </button>
              </section>
            </div>
          )}
        </Modal>
      )}

      {selectedTicket && isUpdateModalOpen && (
        <Modal
          isOpen
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Tindak lanjut · ${selectedTicket.kode_tiket}`}
        >
          <form onSubmit={handleSaveUpdate} className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-800">{selectedTicket.judul_laporan}</p>
              <p className="mt-1 text-xs text-slate-500">{selectedTicket.nama_jorong} · status {selectedTicket.status_laporan}</p>
            </div>
            <label className="block text-xs font-semibold text-slate-700">
              Status penanganan
              <select
                value={newStatus}
                onChange={(event) => setNewStatus(event.target.value as StatusLaporan)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm"
              >
                {ALUR_STATUS[selectedTicket.status_laporan].includes("diproses") && (
                  <option value="diproses">{selectedTicket.status_laporan === "diproses" ? "Tetap diproses · tambah catatan" : "Diproses"}</option>
                )}
                {ALUR_STATUS[selectedTicket.status_laporan].includes("selesai") && <option value="selesai">Selesai</option>}
                {ALUR_STATUS[selectedTicket.status_laporan].includes("ditolak") && <option value="ditolak">Ditolak</option>}
              </select>
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Catatan penanganan resmi
              <textarea
                rows={5}
                minLength={5}
                maxLength={1000}
                required
                value={tanggapanText}
                onChange={(event) => setTanggapanText(event.target.value)}
                placeholder="Tuliskan perkembangan atau alasan perubahan status. Catatan ini dapat dibaca warga."
                className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm font-normal"
              />
              <span className="mt-1 block text-right font-normal text-slate-500">{tanggapanText.length}/1000 karakter</span>
            </label>
            {saveError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">{saveError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setIsUpdateModalOpen(false)} className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Batal</button>
              <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-950 disabled:opacity-60">
                {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {isSaving ? "Menyimpan..." : "Simpan tindak lanjut"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
