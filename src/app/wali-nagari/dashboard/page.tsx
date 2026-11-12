"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock3,
  Eye,
  FileText,
  Loader2,
  MapPin,
  Printer,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  User,
} from "lucide-react";
import DashboardHeader from "@/components/DashboardHeader";
import LocationCard from "@/components/LocationCard";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import { getDaftarLaporan, getDetailLaporan, getOpsiFormulir } from "@/lib/actions/laporan";
import { formatDate } from "@/lib/utils";
import type { FilterLaporanInput, LaporanDetailDTO, LaporanRingkasDTO, OpsiFormulir } from "@/types";

type Periode = "semua" | "30-hari" | "90-hari" | "tahun-ini";

function tanggalISO(date: Date) {
  const tahun = date.getFullYear();
  const bulan = String(date.getMonth() + 1).padStart(2, "0");
  const hari = String(date.getDate()).padStart(2, "0");
  return `${tahun}-${bulan}-${hari}`;
}

export default function WaliNagariDashboardPage() {
  const [tickets, setTickets] = useState<LaporanRingkasDTO[]>([]);
  const [opsi, setOpsi] = useState<OpsiFormulir | null>(null);
  const [periode, setPeriode] = useState<Periode>("semua");
  const [filterJorong, setFilterJorong] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<LaporanRingkasDTO | null>(null);
  const [detail, setDetail] = useState<LaporanDetailDTO | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const detailRequest = useRef(0);

  const filter = useMemo<FilterLaporanInput>(() => {
    let dari: string | undefined;
    const hariIni = new Date();
    if (periode === "30-hari") {
      const awal = new Date(hariIni);
      awal.setDate(awal.getDate() - 29);
      dari = tanggalISO(awal);
    } else if (periode === "90-hari") {
      const awal = new Date(hariIni);
      awal.setDate(awal.getDate() - 89);
      dari = tanggalISO(awal);
    } else if (periode === "tahun-ini") {
      dari = `${hariIni.getFullYear()}-01-01`;
    }

    return {
      ...(dari && { dari }),
      ...(filterJorong && { id_jorong: filterJorong }),
      limit: 500,
    };
  }, [periode, filterJorong]);

  useEffect(() => {
    let active = true;
    getDaftarLaporan(filter)
      .then((result) => {
        if (!active) return;
        if (result.success && result.data) {
          setTickets(result.data);
          setErrorMessage(null);
        } else {
          setErrorMessage(result.message || "Data pemantauan tidak dapat dimuat.");
        }
      })
      .catch(() => {
        if (active) setErrorMessage("Data pemantauan gagal dimuat karena gangguan jaringan.");
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
        else setErrorMessage(result.message || "Pilihan wilayah tidak dapat dimuat.");
      })
      .catch(() => {
        if (active) setErrorMessage("Pilihan wilayah gagal dimuat karena gangguan jaringan.");
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

  const total = tickets.length;
  const menunggu = tickets.filter((ticket) => ticket.status_laporan === "menunggu").length;
  const diproses = tickets.filter((ticket) => ticket.status_laporan === "diproses").length;
  const selesai = tickets.filter((ticket) => ticket.status_laporan === "selesai").length;
  const ditolak = tickets.filter((ticket) => ticket.status_laporan === "ditolak").length;
  const perluPerhatian = menunggu + diproses;
  const completionRate = total ? Math.round((selesai / total) * 100) : 0;

  const jumlahPerKategori = tickets.reduce<Record<string, number>>((accumulator, ticket) => {
    accumulator[ticket.nama_kategori] = (accumulator[ticket.nama_kategori] ?? 0) + 1;
    return accumulator;
  }, {});
  const jumlahPerJorong = tickets.reduce<Record<string, number>>((accumulator, ticket) => {
    accumulator[ticket.nama_jorong] = (accumulator[ticket.nama_jorong] ?? 0) + 1;
    return accumulator;
  }, {});
  const distribusiStatus = [
    { label: "Menunggu pemeriksaan", count: menunggu, bar: "bg-slate-500" },
    { label: "Sedang diproses", count: diproses, bar: "bg-blue-600" },
    { label: "Selesai", count: selesai, bar: "bg-emerald-600" },
    { label: "Ditolak", count: ditolak, bar: "bg-rose-600" },
  ];
  const laporanTerbaru = [...tickets]
    .sort((a, b) => new Date(b.waktu_dibuat).getTime() - new Date(a.waktu_dibuat).getTime())
    .slice(0, 8);

  const kartuKpi = [
    { label: "Total laporan", nilai: total, catatan: "Sesuai filter yang dipilih", icon: FileText, style: "border-slate-200 text-slate-900" },
    { label: "Perlu perhatian", nilai: perluPerhatian, catatan: `${menunggu} menunggu · ${diproses} diproses`, icon: Clock3, style: "border-blue-200 text-blue-900" },
    { label: "Laporan selesai", nilai: selesai, catatan: "Penanganan telah dituntaskan", icon: CheckCircle2, style: "border-emerald-200 text-emerald-900" },
    { label: "Tingkat penyelesaian", nilai: `${completionRate}%`, catatan: `${selesai} dari ${total} laporan`, icon: TrendingUp, style: "border-emerald-200 text-emerald-900" },
  ];

  return (
    <>
    <DashboardHeader peran="wali_nagari" />
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {/* TAMPILAN INTERAKTIF DI LAYAR (SCREEN ONLY) */}
      <div className="screen-only space-y-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-1 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <ShieldCheck className="h-4 w-4" />
            Dasbor eksekutif pimpinan
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Pemantauan Wali Nagari</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Ringkasan laporan dan perkembangan penanganan sebagai bahan evaluasi pelayanan.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-700">
            <span className="mb-1 flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Periode pemantauan</span>
            <select
              value={periode}
              onChange={(event) => {
                setIsLoading(true);
                setPeriode(event.target.value as Periode);
              }}
              className="min-w-52 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="semua">Semua waktu</option>
              <option value="30-hari">30 hari terakhir</option>
              <option value="90-hari">90 hari terakhir</option>
              <option value="tahun-ini">Tahun berjalan</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-700">
            Wilayah jorong
            <select
              value={filterJorong}
              onChange={(event) => {
                setIsLoading(true);
                setFilterJorong(event.target.value);
              }}
              className="mt-1 w-full min-w-52 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Semua jorong</option>
              {opsi?.jorong.map((jorong) => <option key={jorong.id_jorong} value={jorong.id_jorong}>{jorong.nama_jorong}</option>)}
            </select>
          </label>
        </div>
        <div className="no-print flex gap-2">
          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setRefreshKey((current) => current + 1);
            }}
            disabled={isLoading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} /> Segarkan
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-900 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-950"
          >
            <Printer className="h-4 w-4" /> Cetak ringkasan
          </button>
        </div>
      </section>

      <section aria-label="Indikator kinerja utama" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kartuKpi.map(({ label, nilai, catatan, icon: Icon, style }) => (
          <div key={label} className={`rounded-2xl border bg-white p-5 shadow-sm ${style}`}>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">{label}</p>
              <Icon className="h-4 w-4" />
            </div>
            <p className="mt-2 text-3xl font-extrabold">{nilai}</p>
            <p className="mt-1 text-xs text-slate-500">{catatan}</p>
          </div>
        ))}
      </section>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" /> Memuat data pemantauan...
        </div>
      ) : (
        <>
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-emerald-800" />
                <div>
                  <h2 className="font-bold text-slate-900">Sebaran laporan per kategori</h2>
                  <p className="text-xs text-slate-500">Jumlah laporan pada periode terpilih</p>
                </div>
              </div>
              {Object.keys(jumlahPerKategori).length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">Belum ada data untuk filter ini.</p>
              ) : (
                <ul className="space-y-4">
                  {Object.entries(jumlahPerKategori).sort((a, b) => b[1] - a[1]).map(([kategori, count]) => {
                    const persen = total ? Math.round((count / total) * 100) : 0;
                    return (
                      <li key={kategori}>
                        <div className="mb-1.5 flex justify-between gap-3 text-xs">
                          <span className="font-semibold text-slate-700">{kategori}</span>
                          <span className="shrink-0 text-slate-500">{count} · {persen}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-emerald-700 transition-all" style={{ width: `${persen}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-800" />
                <div>
                  <h2 className="font-bold text-slate-900">Sebaran status penanganan</h2>
                  <p className="text-xs text-slate-500">Ringkasan tahapan laporan</p>
                </div>
              </div>
              <ul className="space-y-4">
                {distribusiStatus.map(({ label, count, bar }) => {
                  const persen = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <li key={label}>
                      <div className="mb-1.5 flex justify-between gap-3 text-xs">
                        <span className="font-semibold text-slate-700">{label}</span>
                        <span className="shrink-0 text-slate-500">{count} · {persen}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full transition-all ${bar}`} style={{ width: `${persen}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-6 rounded-xl bg-emerald-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-emerald-950">Tingkat penyelesaian</p>
                  <p className="text-lg font-extrabold text-emerald-900">{completionRate}%</p>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div className="h-full rounded-full bg-emerald-700" style={{ width: `${completionRate}%` }} />
                </div>
                <p className="mt-2 text-xs text-emerald-900">{ditolak} laporan ditolak dari {total} laporan yang ditampilkan.</p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <h2 className="font-bold text-slate-900">Peringkat laporan per jorong</h2>
              <p className="mt-1 text-xs text-slate-500">Sebaran volume laporan pada wilayah yang dipilih.</p>
            </div>
            {Object.keys(jumlahPerJorong).length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">Belum ada data untuk ditampilkan.</p>
            ) : (
              <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(jumlahPerJorong).sort((a, b) => b[1] - a[1]).map(([jorong, count]) => (
                  <div key={jorong} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex justify-between gap-2 text-xs">
                      <span className="font-semibold text-slate-800">{jorong}</span>
                      <span className="text-slate-500">{count} laporan</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-blue-600" style={{ width: `${total ? Math.round((count / total) * 100) : 0}%` }} />
                    </div>
                    <p className="mt-1 text-right text-xs text-slate-500">{total ? Math.round((count / total) * 100) : 0}% dari total</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <h2 className="font-bold text-slate-900">Laporan terbaru</h2>
              <p className="mt-1 text-xs text-slate-500">Informasi detail tersedia untuk ditinjau tanpa mengubah data operasional.</p>
            </div>
            {laporanTerbaru.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500">Belum ada laporan pada periode ini.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[780px] text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Kode tiket</th>
                      <th className="px-4 py-3 font-semibold">Laporan & jorong</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Tanggal masuk</th>
                      <th className="no-print px-4 py-3 text-center font-semibold">Tinjau</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {laporanTerbaru.map((ticket) => (
                      <tr key={ticket.id_laporan} className="hover:bg-slate-50/70">
                        <td className="whitespace-nowrap px-4 py-3.5 font-mono text-xs font-bold text-emerald-900">{ticket.kode_tiket}</td>
                        <td className="px-4 py-3.5">
                          <p className="max-w-sm truncate font-semibold text-slate-900">{ticket.judul_laporan}</p>
                          <p className="mt-1 text-xs text-slate-500">{ticket.nama_jorong} · {ticket.nama_kategori}</p>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5"><StatusBadge status={ticket.status_laporan} size="sm" /></td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500">{formatDate(ticket.waktu_dibuat)}</td>
                        <td className="no-print px-4 py-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => void handleOpenDetail(ticket)}
                            aria-label={`Tinjau ${ticket.kode_tiket}`}
                            className="rounded-lg bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {selectedTicket && (
        <Modal isOpen onClose={closeDetail} title={`Peninjauan read-only · ${selectedTicket.kode_tiket}`} size="xl">
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
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">Foto bukti</h3>
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {detail.lampiran.map((foto) => (
                      <li key={foto.id_lampiran} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={foto.jalur_berkas} alt={foto.nama_berkas} className="max-h-72 w-full object-contain" />
                        <p className="truncate border-t border-slate-200 px-3 py-2 text-xs text-slate-600">{foto.nama_berkas}</p>
                      </li>
                    ))}
                  </ul>
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
                <div className="no-print mt-4 flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-900">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  Tampilan ini hanya untuk peninjauan; perubahan status tidak tersedia.
                </div>
                <button type="button" onClick={closeDetail} className="no-print mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100">
                  Tutup detail
                </button>
              </section>
            </div>
          )}
        </Modal>
      )}
      </div>

      {/* DOKUMEN CETAK RESMI LAPORAN EKSEKUTIF WALI NAGARI (A4) */}
      <div className="print-only portrait-doc bg-white font-sans text-xs text-slate-900">
        {/* KOP SURAT RESMI KANTOR WALI NAGARI */}
        <div className="border-b-4 border-double border-slate-950 pb-3 text-center">
          <div className="flex items-center justify-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/Logo.webp"
              alt="Logo Nagari Kambang Utara"
              className="h-16 w-16 shrink-0 object-contain"
            />
            <div className="text-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800">PEMERINTAH KABUPATEN PESISIR SELATAN</h3>
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900">KECAMATAN LENGAYANG</h4>
              <h2 className="text-lg font-black uppercase tracking-wide text-slate-950">KANTOR WALI NAGARI KAMBANG UTARA</h2>
              <p className="mt-0.5 text-[10px] text-slate-600">
                Alamat: Jl. Raya Kambang - Pasar Baru, Nagari Kambang Utara, Kec. Lengayang, Kode Pos 25672
              </p>
              <p className="text-[10px] text-slate-600">
                Laman Resmi: https://kambangutara.desa.id | Email: walinagari@kambangutara.desa.id
              </p>
            </div>
          </div>
        </div>

        {/* JUDUL DOKUMEN */}
        <div className="my-5 text-center">
          <h1 className="text-sm font-black uppercase tracking-wider underline">
            LAPORAN EKSEKUTIF KINERJA PENANGANAN ASPIRASI & PENGADUAN NAGARI
          </h1>
          <p className="mt-1 text-xs text-slate-700">
            Periode: <strong>{periode === "30-hari" ? "30 Hari Terakhir" : periode === "90-hari" ? "90 Hari Terakhir" : periode === "tahun-ini" ? "Tahun Berjalan" : "Semua Waktu"}</strong>
            {" · "}
            Wilayah: <strong>{opsi?.jorong.find((j) => j.id_jorong === filterJorong)?.nama_jorong ?? "Seluruh Jorong Nagari Kambang Utara"}</strong>
          </p>
        </div>

        {/* BAGIAN I: INDIKATOR KINERJA UTAMA (KPI) */}
        <div className="mb-5">
          <h2 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase text-slate-900">
            I. Ringkasan Eksekutif & Indikator Kunci (KPI)
          </h2>
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="rounded border border-slate-400 bg-slate-50 p-2.5">
              <span className="block text-[10px] font-semibold uppercase text-slate-600">Total Laporan</span>
              <span className="text-xl font-black text-slate-950">{total}</span>
            </div>
            <div className="rounded border border-slate-400 bg-slate-50 p-2.5">
              <span className="block text-[10px] font-semibold uppercase text-slate-600">Laporan Selesai</span>
              <span className="text-xl font-black text-emerald-800">{selesai}</span>
            </div>
            <div className="rounded border border-slate-400 bg-slate-50 p-2.5">
              <span className="block text-[10px] font-semibold uppercase text-slate-600">Sedang Ditangani</span>
              <span className="text-xl font-black text-blue-800">{diproses}</span>
            </div>
            <div className="rounded border border-slate-400 bg-slate-50 p-2.5">
              <span className="block text-[10px] font-semibold uppercase text-slate-600">Tingkat Penyelesaian</span>
              <span className="text-xl font-black text-emerald-800">{completionRate}%</span>
            </div>
          </div>
          <p className="mt-2 text-[10px] italic text-slate-600">
            * Dari total {total} aduan masuk, sebanyak {selesai} laporan telah selesai ditangani ({completionRate}%), {diproses} laporan sedang ditindaklanjuti tim teknis, {menunggu} laporan menunggu verifikasi, dan {ditolak} laporan dinyatakan tidak memenuhi ketentuan.
          </p>
        </div>

        {/* BAGIAN II & III: DISTRIBUSI SEBARAN JORONG & KATEGORI (2 KOLOM) */}
        <div className="mb-5 grid grid-cols-2 gap-4">
          <div>
            <h2 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase text-slate-900">
              II. Sebaran per Wilayah Jorong
            </h2>
            <table className="w-full border-collapse border border-slate-400 text-left text-[10px]">
              <thead>
                <tr className="border-b border-slate-400 bg-slate-100 font-bold uppercase">
                  <th className="w-8 border border-slate-400 p-1.5 text-center">No</th>
                  <th className="border border-slate-400 p-1.5">Wilayah Jorong</th>
                  <th className="w-16 border border-slate-400 p-1.5 text-center">Jumlah</th>
                  <th className="w-14 border border-slate-400 p-1.5 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {(opsi?.jorong ?? []).map((j, idx) => {
                  const count = jumlahPerJorong[j.nama_jorong] ?? 0;
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <tr key={j.id_jorong} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-1.5">{j.nama_jorong}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-bold">{count}</td>
                      <td className="border border-slate-300 p-1.5 text-center">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase text-slate-900">
              III. Sebaran per Kategori Layanan
            </h2>
            <table className="w-full border-collapse border border-slate-400 text-left text-[10px]">
              <thead>
                <tr className="border-b border-slate-400 bg-slate-100 font-bold uppercase">
                  <th className="w-8 border border-slate-400 p-1.5 text-center">No</th>
                  <th className="border border-slate-400 p-1.5">Kategori Aduan</th>
                  <th className="w-16 border border-slate-400 p-1.5 text-center">Jumlah</th>
                  <th className="w-14 border border-slate-400 p-1.5 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {(opsi?.kategori ?? []).map((k, idx) => {
                  const count = jumlahPerKategori[k.nama_kategori] ?? 0;
                  const pct = total ? Math.round((count / total) * 100) : 0;
                  return (
                    <tr key={k.id_kategori} className="border-b border-slate-300">
                      <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                      <td className="border border-slate-300 p-1.5">{k.nama_kategori}</td>
                      <td className="border border-slate-300 p-1.5 text-center font-bold">{count}</td>
                      <td className="border border-slate-300 p-1.5 text-center">{pct}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* BAGIAN IV: DAFTAR LAPORAN TERAKHIR / PRIORITAS */}
        <div className="mb-6">
          <h2 className="mb-2 border-b border-slate-300 pb-1 text-xs font-bold uppercase text-slate-900">
            IV. Rekapitulasi Sampel Laporan Terkini ({laporanTerbaru.length} Aduan)
          </h2>
          <table className="w-full border-collapse border border-slate-400 text-left text-[10px]">
            <thead>
              <tr className="border-b border-slate-400 bg-slate-100 font-bold uppercase">
                <th className="w-8 border border-slate-400 p-1.5 text-center">No</th>
                <th className="w-24 border border-slate-400 p-1.5">Kode Tiket</th>
                <th className="w-24 border border-slate-400 p-1.5">Tanggal</th>
                <th className="w-28 border border-slate-400 p-1.5">Jorong</th>
                <th className="border border-slate-400 p-1.5">Judul Pengaduan / Aspirasi</th>
                <th className="w-20 border border-slate-400 p-1.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {laporanTerbaru.map((ticket, idx) => (
                <tr key={ticket.id_laporan} className="border-b border-slate-300">
                  <td className="border border-slate-300 p-1.5 text-center">{idx + 1}</td>
                  <td className="border border-slate-300 p-1.5 font-mono font-bold">{ticket.kode_tiket}</td>
                  <td className="border border-slate-300 p-1.5">{formatDate(ticket.waktu_dibuat)}</td>
                  <td className="border border-slate-300 p-1.5">{ticket.nama_jorong}</td>
                  <td className="border border-slate-300 p-1.5">{ticket.judul_laporan}</td>
                  <td className="border border-slate-300 p-1.5 text-center font-bold uppercase text-[9px]">{ticket.status_laporan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* BAGIAN V: PENGESAHAN WALI NAGARI */}
        <div className="flex justify-between border-t border-slate-300 pt-3 text-xs">
          <div className="max-w-xs text-[10px] text-slate-500">
            <p className="font-semibold text-slate-700">Catatan Evaluasi:</p>
            <p>Laporan eksekutif ini disusun secara berkala sebagai bahan pertimbangan pengalokasian anggaran nagari, musrenbangdes, serta peningkatan kualitas pelayanan publik bagi warga Nagari Kambang Utara.</p>
          </div>

          <div className="text-right">
            <p>Kambang Utara, {formatDate(new Date())}</p>
            <p className="mt-1 font-semibold text-slate-900">Mengetahui,</p>
            <p className="font-bold uppercase text-slate-950">WALI NAGARI KAMBANG UTARA</p>
            <div className="h-16"></div>
            <p className="font-bold underline text-slate-900">WALI NAGARI KAMBANG UTARA</p>
            <p className="text-[10px] text-slate-600">Pemerintah Nagari Kambang Utara</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
