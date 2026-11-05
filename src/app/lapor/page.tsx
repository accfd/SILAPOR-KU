"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clipboard,
  FileText,
  ImagePlus,
  Loader2,
  MapPin,
  Navigation,
  Shield,
  Trash2,
  Upload,
} from "lucide-react";
import { createLaporan, getOpsiFormulir } from "@/lib/actions/laporan";
import {
  JENIS_LAPORAN,
  MAKS_JUMLAH_LAMPIRAN,
  MAKS_UKURAN_LAMPIRAN,
  TIPE_LAMPIRAN_DIIZINKAN,
} from "@/lib/constants";
import type { CreateLaporanInput, OpsiFormulir } from "@/types";

type LampiranInput = CreateLaporanInput["lampiran"][number];
type FormData = Omit<CreateLaporanInput, "lampiran" | "koordinat_lintang" | "koordinat_bujur">;

const BATAS_FOTO_TERKOMPRESI = 460 * 1024;
const UKURAN_SISI_MAKS = 1600;

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Foto tidak dapat diproses."))),
      "image/jpeg",
      quality,
    );
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Foto tidak dapat dibaca."));
    };
    reader.onerror = () => reject(new Error("Foto tidak dapat dibaca."));
    reader.readAsDataURL(blob);
  });
}

async function siapkanFoto(file: File): Promise<LampiranInput> {
  const bitmap = await createImageBitmap(file);
  let lebar = Math.min(bitmap.width, UKURAN_SISI_MAKS);
  let tinggi = Math.round((bitmap.height / bitmap.width) * lebar);
  let hasil: Blob | null = null;

  try {
    for (let skala = 0; skala < 5; skala++) {
      const canvas = document.createElement("canvas");
      canvas.width = lebar;
      canvas.height = tinggi;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Peramban tidak dapat memproses foto.");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, lebar, tinggi);
      context.drawImage(bitmap, 0, 0, lebar, tinggi);

      for (const kualitas of [0.82, 0.72, 0.62, 0.52, 0.42]) {
        const fotoTerkompresi = await canvasToBlob(canvas, kualitas);
        hasil = fotoTerkompresi;
        if (fotoTerkompresi.size <= BATAS_FOTO_TERKOMPRESI) break;
      }

      if (hasil && hasil.size <= BATAS_FOTO_TERKOMPRESI) break;
      lebar = Math.max(640, Math.round(lebar * 0.82));
      tinggi = Math.round((bitmap.height / bitmap.width) * lebar);
    }
  } finally {
    bitmap.close();
  }

  if (!hasil || hasil.size > BATAS_FOTO_TERKOMPRESI) {
    throw new Error(`Foto "${file.name}" terlalu besar untuk diproses. Pilih foto lain.`);
  }

  const nama = file.name.replace(/\.[^.]+$/, "") || "foto-bukti";
  return {
    nama_berkas: `${nama}.jpg`,
    jalur_berkas: await blobToDataUrl(hasil),
    tipe_berkas: "image/jpeg",
    ukuran_berkas: hasil.size,
  };
}

function pesanGalatOpsi(result: { message: string; success: boolean }) {
  return result.success ? null : result.message || "Gagal memuat pilihan kategori dan jorong.";
}

export default function LaporPage() {
  const inputFoto = useRef<HTMLInputElement>(null);
  const [isAnonim, setIsAnonim] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [createdTicketCode, setCreatedTicketCode] = useState<string | null>(null);
  const [copyMessage, setCopyMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [opsi, setOpsi] = useState<OpsiFormulir | null>(null);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [lampiran, setLampiran] = useState<LampiranInput[]>([]);
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [formData, setFormData] = useState<FormData>({
    is_anonim: false,
    nama_pelapor: "",
    nomor_kontak: "",
    jenis_laporan: "pengaduan",
    judul_laporan: "",
    deskripsi_laporan: "",
    id_kategori: "",
    id_jorong: "",
    patokan_lokasi: "",
  });

  useEffect(() => {
    let active = true;
    getOpsiFormulir()
      .then((result) => {
        if (!active) return;
        const error = pesanGalatOpsi(result);
        if (error) {
          setOptionsError(error);
          return;
        }
        if (result.data) {
          setOpsi(result.data);
          setFormData((previous) => ({
            ...previous,
            id_kategori: result.data?.kategori[0]?.id_kategori ?? "",
            id_jorong: result.data?.jorong[0]?.id_jorong ?? "",
          }));
        }
      })
      .catch(() => {
        if (active) setOptionsError("Pilihan formulir tidak dapat dimuat. Periksa koneksi lalu muat ulang halaman.");
      });

    return () => {
      active = false;
    };
  }, []);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const ruangTersedia = MAKS_JUMLAH_LAMPIRAN - lampiran.length;
    if (files.length > ruangTersedia) {
      setErrorMessage(`Maksimal ${MAKS_JUMLAH_LAMPIRAN} foto. Hapus foto yang sudah dipilih sebelum menambahkan lagi.`);
      return;
    }

    setErrorMessage(null);
    setIsProcessingFiles(true);
    try {
      const fotoBaru: LampiranInput[] = [];
      for (const file of files) {
        if (!(TIPE_LAMPIRAN_DIIZINKAN as readonly string[]).includes(file.type)) {
          throw new Error(`"${file.name}" bukan foto JPG, PNG, atau WebP.`);
        }
        if (file.size > MAKS_UKURAN_LAMPIRAN) {
          throw new Error(`Ukuran "${file.name}" melebihi batas maksimal 5 MB.`);
        }
        fotoBaru.push(await siapkanFoto(file));
      }
      setLampiran((previous) => [...previous, ...fotoBaru]);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Foto gagal diproses. Silakan coba foto lain.");
    } finally {
      setIsProcessingFiles(false);
    }
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setErrorMessage("Peramban ini tidak mendukung pengambilan lokasi otomatis.");
      return;
    }

    setErrorMessage(null);
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLatitude(coords.latitude.toFixed(6));
        setLongitude(coords.longitude.toFixed(6));
        setIsLocating(false);
      },
      (error) => {
        const message =
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan izin lokasi atau masukkan koordinat secara manual."
            : error.code === error.TIMEOUT
              ? "Pengambilan lokasi melewati batas waktu. Silakan coba kembali."
              : "Lokasi tidak dapat ditentukan. Pastikan GPS perangkat aktif.";
        setErrorMessage(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (lampiran.length === 0) {
      setErrorMessage("Tambahkan minimal satu foto bukti sebelum mengirim laporan.");
      return;
    }
    if (lampiran.length > MAKS_JUMLAH_LAMPIRAN) {
      setErrorMessage(`Maksimal ${MAKS_JUMLAH_LAMPIRAN} foto untuk setiap laporan.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createLaporan({
        ...formData,
        is_anonim: isAnonim,
        koordinat_lintang: latitude.trim() ? Number(latitude) : null,
        koordinat_bujur: longitude.trim() ? Number(longitude) : null,
        lampiran,
      });

      if (result.success && result.data?.kode_tiket) {
        setCreatedTicketCode(result.data.kode_tiket);
      } else {
        const fieldError = Object.values(result.errors ?? {}).flat()[0];
        setErrorMessage(fieldError ?? result.message ?? "Laporan gagal dikirim. Periksa kembali isian Anda.");
      }
    } catch {
      setErrorMessage("Laporan belum terkirim karena gangguan jaringan. Periksa koneksi lalu coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = async () => {
    if (!createdTicketCode) return;
    try {
      await navigator.clipboard.writeText(createdTicketCode);
      setCopyMessage("Kode tiket berhasil disalin.");
    } catch {
      setCopyMessage("Kode tiket tidak dapat disalin otomatis. Silakan salin kode secara manual.");
    }
  };

  if (createdTicketCode) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <section className="space-y-6 rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-emerald-800">Laporan berhasil dikirim</p>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Terima kasih atas kepedulian Anda
            </h1>
            <p className="text-sm leading-relaxed text-slate-600">
              Simpan kode tiket berikut untuk memantau perkembangan laporan secara mandiri.
            </p>
          </div>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Kode tiket Anda</span>
            <p className="break-all font-mono text-2xl font-bold tracking-wider text-emerald-800 sm:text-3xl">
              {createdTicketCode}
            </p>
            <button
              type="button"
              onClick={handleCopyTicket}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <Clipboard className="h-4 w-4" />
              Salin kode tiket
            </button>
            {copyMessage && <p role="status" className="text-xs text-slate-600">{copyMessage}</p>}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/cek-tiket?kode=${createdTicketCode}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-900"
            >
              Lacak status laporan <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Kembali ke beranda
            </Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" />
        Kembali ke beranda
      </Link>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(260px,0.8fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="mb-7">
            <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <FileText className="h-4 w-4" />
              Formulir layanan aspirasi
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Sampaikan laporan</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Isi informasi kejadian dan sertakan foto bukti agar laporan dapat ditinjau dengan baik.
            </p>
          </div>

          {(errorMessage || optionsError) && (
            <div role="alert" className="mb-6 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <span>{errorMessage ?? optionsError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <fieldset className="space-y-3">
              <legend className="mb-3 text-sm font-semibold text-slate-900">Jenis penyampaian</legend>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {JENIS_LAPORAN.map((jenis) => {
                  const selected = formData.jenis_laporan === jenis;
                  return (
                    <label
                      key={jenis}
                      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                        selected ? "border-emerald-700 bg-emerald-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="jenis_laporan"
                        value={jenis}
                        checked={selected}
                        onChange={() => setFormData((previous) => ({ ...previous, jenis_laporan: jenis }))}
                        className="mt-1 h-4 w-4 accent-emerald-800"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">
                          {jenis === "pengaduan" ? "Pengaduan masalah" : "Aspirasi & usulan"}
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                          {jenis === "pengaduan"
                            ? "Laporkan masalah atau kondisi yang perlu ditangani."
                            : "Sampaikan usulan untuk kemajuan Nagari."}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-900">Informasi laporan</legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="kategori" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Kategori <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="kategori"
                    required
                    value={formData.id_kategori}
                    onChange={(event) => setFormData((previous) => ({ ...previous, id_kategori: event.target.value }))}
                    disabled={!opsi?.kategori.length}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 disabled:bg-slate-100"
                  >
                    <option value="">Pilih kategori</option>
                    {opsi?.kategori.map((kategori) => (
                      <option key={kategori.id_kategori} value={kategori.id_kategori}>{kategori.nama_kategori}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="jorong" className="mb-1.5 block text-xs font-semibold text-slate-700">
                    Wilayah jorong <span className="text-rose-600">*</span>
                  </label>
                  <select
                    id="jorong"
                    required
                    value={formData.id_jorong}
                    onChange={(event) => setFormData((previous) => ({ ...previous, id_jorong: event.target.value }))}
                    disabled={!opsi?.jorong.length}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20 disabled:bg-slate-100"
                  >
                    <option value="">Pilih jorong</option>
                    {opsi?.jorong.map((jorong) => (
                      <option key={jorong.id_jorong} value={jorong.id_jorong}>{jorong.nama_jorong}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="judul" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Judul laporan <span className="text-rose-600">*</span>
                </label>
                <input
                  id="judul"
                  type="text"
                  minLength={5}
                  maxLength={150}
                  required
                  value={formData.judul_laporan}
                  onChange={(event) => setFormData((previous) => ({ ...previous, judul_laporan: event.target.value }))}
                  placeholder="Contoh: Lampu jalan tidak menyala di Jorong Kambang Barat"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>
              <div>
                <label htmlFor="deskripsi" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Uraian kejadian <span className="text-rose-600">*</span>
                </label>
                <textarea
                  id="deskripsi"
                  rows={5}
                  minLength={10}
                  maxLength={3000}
                  required
                  value={formData.deskripsi_laporan}
                  onChange={(event) => setFormData((previous) => ({ ...previous, deskripsi_laporan: event.target.value }))}
                  placeholder="Jelaskan kronologi, dampak, dan informasi lain yang membantu penanganan laporan."
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
                <p className="mt-1 text-right text-xs text-slate-500">{formData.deskripsi_laporan.length}/3000 karakter</p>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-slate-900">Lokasi dan bukti pendukung</legend>
              <div>
                <label htmlFor="lokasi" className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Patokan atau alamat kejadian <span className="text-rose-600">*</span>
                </label>
                <input
                  id="lokasi"
                  type="text"
                  minLength={3}
                  maxLength={500}
                  required
                  value={formData.patokan_lokasi}
                  onChange={(event) => setFormData((previous) => ({ ...previous, patokan_lokasi: event.target.value }))}
                  placeholder="Contoh: Di depan kantor jorong, dekat jembatan"
                  className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <MapPin className="h-4 w-4 text-emerald-800" />
                      Titik koordinat GPS
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Opsional, tetapi membantu petugas menemukan lokasi secara akurat.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-800 px-3 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-50 disabled:opacity-60"
                  >
                    {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    {isLocating ? "Mencari lokasi..." : "Gunakan lokasi saya"}
                  </button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-medium text-slate-700">
                    Lintang
                    <input
                      type="number"
                      step="any"
                      min="-90"
                      max="90"
                      value={latitude}
                      onChange={(event) => setLatitude(event.target.value)}
                      placeholder="-1.234567"
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                    />
                  </label>
                  <label className="text-xs font-medium text-slate-700">
                    Bujur
                    <input
                      type="number"
                      step="any"
                      min="-180"
                      max="180"
                      value={longitude}
                      onChange={(event) => setLongitude(event.target.value)}
                      placeholder="100.123456"
                      className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                    />
                  </label>
                </div>
              </div>

              <div>
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Foto bukti <span className="text-rose-600">* minimal 1</span>
                  </label>
                  <span className="text-xs text-slate-500">{lampiran.length}/{MAKS_JUMLAH_LAMPIRAN} foto</span>
                </div>
                <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-emerald-700">
                  <input
                    ref={inputFoto}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    onChange={handleFileChange}
                    disabled={isProcessingFiles || lampiran.length >= MAKS_JUMLAH_LAMPIRAN}
                    className="sr-only"
                    aria-label="Pilih foto bukti"
                  />
                  <button
                    type="button"
                    onClick={() => inputFoto.current?.click()}
                    disabled={isProcessingFiles || lampiran.length >= MAKS_JUMLAH_LAMPIRAN}
                    className="mx-auto flex flex-col items-center gap-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessingFiles ? <Loader2 className="h-8 w-8 animate-spin text-emerald-800" /> : <ImagePlus className="h-8 w-8 text-emerald-800" />}
                    <span className="text-sm font-semibold text-slate-800">
                      {isProcessingFiles ? "Menyiapkan foto..." : "Pilih foto dari galeri atau kamera"}
                    </span>
                    <span className="text-xs text-slate-500">JPG, PNG, atau WebP · maksimal 5 MB per foto</span>
                  </button>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Foto dioptimalkan dengan tetap menjaga keterbacaan sebelum dikirim. Unggah hingga {MAKS_JUMLAH_LAMPIRAN} foto.
                </p>

                {lampiran.length > 0 && (
                  <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {lampiran.map((foto, index) => (
                      <li key={`${foto.nama_berkas}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={foto.jalur_berkas} alt={`Pratinjau ${foto.nama_berkas}`} className="h-32 w-full object-cover" />
                        <div className="flex items-center justify-between gap-2 p-2">
                          <span className="min-w-0 truncate text-xs text-slate-600" title={foto.nama_berkas}>{foto.nama_berkas}</span>
                          <button
                            type="button"
                            onClick={() => setLampiran((previous) => previous.filter((_, current) => current !== index))}
                            aria-label={`Hapus ${foto.nama_berkas}`}
                            className="rounded p-1 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </fieldset>

            <fieldset className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
              <legend className="px-1 text-sm font-semibold text-slate-900">Identitas pelapor</legend>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={isAnonim}
                  onChange={(event) => setIsAnonim(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-emerald-800"
                />
                <span>
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                    <Shield className="h-4 w-4 text-emerald-800" />
                    Laporkan secara anonim
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-slate-600">
                    Nama dan nomor kontak tidak akan dicantumkan pada laporan anonim.
                  </span>
                </span>
              </label>
              {!isAnonim && (
                <div className="grid gap-4 border-t border-slate-200 pt-4 sm:grid-cols-2">
                  <label className="text-xs font-semibold text-slate-700">
                    Nama lengkap <span className="text-rose-600">*</span>
                    <input
                      type="text"
                      maxLength={100}
                      required={!isAnonim}
                      value={typeof formData.nama_pelapor === "string" ? formData.nama_pelapor : ""}
                      onChange={(event) => setFormData((previous) => ({ ...previous, nama_pelapor: event.target.value }))}
                      placeholder="Nama Anda"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-700">
                    Nomor telepon <span className="font-normal text-slate-500">(opsional)</span>
                    <input
                      type="tel"
                      maxLength={16}
                      value={typeof formData.nomor_kontak === "string" ? formData.nomor_kontak : ""}
                      onChange={(event) => setFormData((previous) => ({ ...previous, nomor_kontak: event.target.value }))}
                      placeholder="Contoh: 081234567890"
                      className="mt-1.5 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal"
                    />
                  </label>
                </div>
              )}
            </fieldset>

            <button
              type="submit"
              disabled={isSubmitting || isProcessingFiles || !opsi || lampiran.length === 0}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
              {isSubmitting ? "Mengirim laporan..." : "Kirim laporan"}
            </button>
          </form>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900">Sebelum mengirim</h2>
            <ol className="mt-4 space-y-4">
              {[
                "Gunakan judul dan uraian yang jelas agar laporan mudah dipahami.",
                "Pilih kategori dan jorong sesuai lokasi kejadian.",
                "Sertakan minimal satu foto sebagai bukti pendukung.",
                "Simpan kode tiket yang diberikan setelah laporan berhasil dikirim.",
              ].map((panduan, index) => (
                <li key={panduan} className="flex gap-3 text-xs leading-relaxed text-slate-600">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-900">
                    {index + 1}
                  </span>
                  {panduan}
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-2xl bg-emerald-950 p-5 text-white">
            <h2 className="text-sm font-bold">Alur tindak lanjut</h2>
            <ol className="mt-4 space-y-3 text-xs text-emerald-50">
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">1</span>Laporan diterima dan diverifikasi.</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">2</span>Petugas memberikan pembaruan penanganan.</li>
              <li className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">3</span>Perkembangan dapat dilacak dengan kode tiket.</li>
            </ol>
          </section>
        </aside>
      </div>
    </div>
  );
}
