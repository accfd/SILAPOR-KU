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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* TAMPILAN INTERAKTIF DI LAYAR (SCREEN ONLY) */}
      <div className="screen-only space-y-7">
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

      {/* DOKUMEN CETAK RESMI REKAPITULASI (A4 LANDSCAPE) */}
      <div className="print-only landscape-doc bg-white font-sans text-xs text-slate-900">
        {/* KOP SURAT KEDINASAN RESMI */}
        <div className="border-b-4 border-double border-slate-950 pb-3 text-center">
          <div className="flex items-center justify-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo.webp"
              alt="Logo Nagari Kambang Utara"
              className="h-14 w-14 shrink-0 object-contain"
            />
            <div className="text-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">PEMERINTAH KABUPATEN PESISIR SELATAN</h3>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">KECAMATAN LENGAYANG</h4>
              <h2 className="text-base font-black uppercase tracking-wide text-slate-950">PEMERINTAH NAGARI KAMBANG UTARA</h2>
              <p className="mt-0.5 text-[10px] text-slate-600">
                Alamat: Jl. Raya Kambang - Pasar Baru, Nagari Kambang Utara, Kec. Lengayang, Kode Pos 25672
              </p>
              <p className="text-[10px] text-slate-600">
                Laman Resmi: https://kambangutara.desa.id | Email: kontak@kambangutara.desa.id
              </p>
            </div>
          </div>
        </div>

        {/* JUDUL DOKUMEN & PARAMETER */}
        <div className="my-4 text-center">
          <h1 className="text-sm font-black uppercase tracking-wider underline">
            REKAPITULASI DAFTAR PENGADUAN & ASPIRASI MASYARAKAT
          </h1>
          <p className="mt-1 text-[11px] font-medium text-slate-700">
            Sistem Informasi Layanan Aspirasi & Pengaduan Nagari Kambang Utara (SILAPOR-KU)
          </p>
        </div>

        {/* BARIS KETERANGAN FILTER & STATISTIK */}
        <div className="mb-3 rounded border border-slate-400 bg-slate-50/70 p-2.5 text-[11px]">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <div>
              <span className="font-semibold text-slate-700">Wilayah Jorong: </span>
              <span className="font-bold text-slate-900">
                {opsi?.jorong.find((j) => j.id_jorong === filterJorong)?.nama_jorong ?? "Semua Wilayah Jorong"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Kategori Aduan: </span>
              <span className="font-bold text-slate-900">
                {opsi?.kategori.find((k) => k.id_kategori === filterKategori)?.nama_kategori ?? "Semua Kategori"}
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Filter Status: </span>
              <span className="font-bold uppercase text-slate-900">{filterStatus ? filterStatus : "Semua Status"}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-700">Rentang Tanggal: </span>
              <span className="text-slate-900">
                {filterDari || filterSampai ? `${filterDari || "Awal"} s.d. ${filterSampai || "Hari Ini"}` : "Semua Waktu"}
              </span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-4 border-t border-slate-300 pt-1.5 font-semibold text-slate-800">
            <span>Total Aduan: <strong className="text-slate-950">{tickets.length}</strong></span>
            <span>Menunggu: <strong className="text-amber-800">{jumlahStatus("menunggu")}</strong></span>
            <span>Diproses: <strong className="text-blue-800">{jumlahStatus("diproses")}</strong></span>
            <span>Selesai: <strong className="text-emerald-800">{jumlahStatus("selesai")}</strong></span>
            <span>Ditolak: <strong className="text-rose-800">{jumlahStatus("ditolak")}</strong></span>
          </div>
        </div>

        {/* TABEL DATA RESMI BERGARIS HITAM TEGAS */}
        <table className="w-full border-collapse border border-slate-900 text-left text-[10px]">
          <thead>
            <tr className="border-b-2 border-slate-900 bg-slate-100 font-bold uppercase text-slate-900">
              <th className="w-8 border border-slate-900 p-1.5 text-center">No</th>
              <th className="w-24 border border-slate-900 p-1.5">Kode Tiket</th>
              <th className="w-28 border border-slate-900 p-1.5">Waktu Masuk</th>
              <th className="w-32 border border-slate-900 p-1.5">Pelapor</th>
              <th className="w-28 border border-slate-900 p-1.5">Jorong</th>
              <th className="w-32 border border-slate-900 p-1.5">Kategori</th>
              <th className="border border-slate-900 p-1.5">Judul & Uraian Aduan</th>
              <th className="w-20 border border-slate-900 p-1.5 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="border border-slate-900 p-4 text-center italic text-slate-500">
                  Tidak ada data laporan yang sesuai dengan kriteria filter.
                </td>
              </tr>
            ) : (
              tickets.map((ticket, index) => (
                <tr key={ticket.id_laporan} className="border-b border-slate-900">
                  <td className="border border-slate-900 p-1.5 text-center">{index + 1}</td>
                  <td className="border border-slate-900 p-1.5 font-mono font-bold text-slate-950">{ticket.kode_tiket}</td>
                  <td className="border border-slate-900 p-1.5">{formatDate(ticket.waktu_dibuat)}</td>
                  <td className="border border-slate-900 p-1.5">
                    <p className="font-semibold">{ticket.is_anonim ? "Anonim (Rahasia)" : ticket.nama_pelapor || "Warga"}</p>
                    <p className="text-[9px] text-slate-500">{ticket.is_anonim ? "Identitas Terlindungi" : "Pelapor Terdaftar"}</p>
                  </td>
                  <td className="border border-slate-900 p-1.5">{ticket.nama_jorong}</td>
                  <td className="border border-slate-900 p-1.5">{ticket.nama_kategori}</td>
                  <td className="border border-slate-900 p-1.5">
                    <p className="font-bold text-slate-950">{ticket.judul_laporan}</p>
                    <p className="mt-0.5 text-[9px] text-slate-600 capitalize">{ticket.jenis_laporan} · {ticket.jumlah_lampiran} Bukti Foto</p>
                  </td>
                  <td className="border border-slate-900 p-1.5 text-center font-bold uppercase text-[9px]">
                    {ticket.status_laporan}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* KOLOM PENGESAHAN DOKUMEN (KANAN BAWAH) */}
        <div className="mt-6 flex justify-end">
          <div className="text-right text-xs">
            <p>Kambang Utara, {formatDate(new Date())}</p>
            <p className="mt-1 font-semibold">Petugas Administrasi Pelaporan Nagari</p>
            <p className="text-[10px] text-slate-500">Pemerintah Nagari Kambang Utara</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-slate-900">TIM ADMINISTRATOR NAGARI</p>
            <p className="text-[10px] text-slate-600">Unit Pelayanan Informasi & Pengaduan</p>
          </div>
        </div>
      </div>
    </div>
  );
}
