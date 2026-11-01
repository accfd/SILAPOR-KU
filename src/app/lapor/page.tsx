"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createLaporan, getOpsiFormulir } from "@/lib/actions/laporan";
import { MAKS_UKURAN_LAMPIRAN, TIPE_LAMPIRAN_DIIZINKAN } from "@/lib/constants";
import type { CreateLaporanInput, OpsiFormulir } from "@/types";

type LampiranInput = CreateLaporanInput["lampiran"][number];
import { FileText, Upload, AlertCircle, CheckCircle2, Shield, ArrowLeft, Loader2 } from "lucide-react";

export default function LaporPage() {
  const [isAnonim, setIsAnonim] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdTicketCode, setCreatedTicketCode] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [opsi, setOpsi] = useState<OpsiFormulir | null>(null);

  const [formData, setFormData] = useState({
    nama_pelapor: "",
    nomor_telepon: "",
    judul: "",
    id_kategori: "",
    id_jorong: "",
    lokasi: "",
    deskripsi: "",
  });

  const [lampiran, setLampiran] = useState<LampiranInput | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  useEffect(() => {
    getOpsiFormulir().then((res) => {
      if (res.success && res.data) {
        const data = res.data;
        setOpsi(data);
        setFormData((prev) => ({
          ...prev,
          id_kategori: data.kategori[0]?.id_kategori ?? "",
          id_jorong: data.jorong[0]?.id_jorong ?? "",
        }));
      } else {
        setErrorMessage(res.message || "Gagal memuat pilihan kategori dan jorong.");
      }
    });
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!(TIPE_LAMPIRAN_DIIZINKAN as readonly string[]).includes(file.type)) {
      setErrorMessage("Format berkas harus berupa foto/gambar (JPG, JPEG, PNG, WebP).");
      return;
    }

    if (file.size > MAKS_UKURAN_LAMPIRAN) {
      setErrorMessage("Ukuran foto melebihi batas maksimal 5 MB.");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFilePreview(result);
      // Untuk MVP awal, foto dikirim sebagai Data URL (lihat catatan bodySizeLimit di next.config.ts)
      setLampiran({
        nama_berkas: file.name,
        jalur_berkas: result,
        tipe_berkas: file.type as LampiranInput["tipe_berkas"],
        ukuran_berkas: file.size,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validasi foto wajib sesuai PRD FR-03 & FR-05
    if (!lampiran) {
      setErrorMessage("Wajib melampirkan minimal 1 foto bukti kondisi di lapangan.");
      return;
    }

    if (!isAnonim && !formData.nama_pelapor) {
      setErrorMessage("Silakan isi nama lengkap pelapor atau pilih opsi 'Laporkan Secara Anonim'.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createLaporan({
        is_anonim: isAnonim,
        nama_pelapor: formData.nama_pelapor,
        nomor_kontak: formData.nomor_telepon,
        judul_laporan: formData.judul,
        deskripsi_laporan: formData.deskripsi,
        id_kategori: formData.id_kategori,
        id_jorong: formData.id_jorong,
        patokan_lokasi: formData.lokasi,
        lampiran: [lampiran],
      });

      if (result.success && result.data?.kode_tiket) {
        setCreatedTicketCode(result.data.kode_tiket);
      } else {
        setErrorMessage(result.message || "Gagal mengirim laporan. Silakan periksa kembali formulir.");
      }
    } catch {
      setErrorMessage("Terjadi gangguan jaringan saat mengirim laporan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdTicketCode) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Laporan Berhasil Terkirim!
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Aduan Anda telah tercatat dalam sistem dan akan segera diverifikasi oleh Admin Nagari Kambang Utara.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-2">
            <span className="text-xs uppercase font-semibold tracking-wider text-slate-500">
              Kode Tiket Pelacakan Anda
            </span>
            <div className="text-3xl font-mono font-bold text-emerald-600 tracking-wider">
              {createdTicketCode}
            </div>
            <p className="text-xs text-slate-500">
              Simpan kode ini untuk mengecek status tindak lanjut aduan secara mandiri.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href={`/cek-tiket?kode=${createdTicketCode}`}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition text-center text-sm"
            >
              Lacak Status Laporan Sekarang
            </Link>
            <Link
              href="/"
              className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition text-center text-sm"
            >
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Link>

      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-sm space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-2">
            <FileText className="w-4 h-4" />
            Formulir Layanan Aspirasi
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Buat Laporan Baru
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Sampaikan permasalahan di lingkungan Anda dengan jelas dan sertakan foto bukti kondisi lapangan.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identitas Pelapor / Anonim */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/70 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-600" />
                Privasi Pelapor
              </label>
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs sm:text-sm font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={isAnonim}
                  onChange={(e) => setIsAnonim(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                Laporkan Secara Anonim
              </label>
            </div>

            {!isAnonim ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nama Lengkap <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nama_pelapor}
                    onChange={(e) => setFormData({ ...formData, nama_pelapor: e.target.value })}
                    placeholder="Nama sesuai KTP"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    value={formData.nomor_telepon}
                    onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                    placeholder="08xxxxxxxxxx"
                    className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic bg-white p-3 rounded-lg border border-slate-200">
                Identitas Anda dirahasiakan sepenuhnya. Laporan hanya akan diidentifikasi dengan kode tiket unik.
              </p>
            )}
          </div>

          {/* Klasifikasi Aduan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Kategori Laporan <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.id_kategori}
                onChange={(e) => setFormData({ ...formData, id_kategori: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                {opsi?.kategori.map((kat) => (
                  <option key={kat.id_kategori} value={kat.id_kategori}>
                    {kat.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-900 mb-1.5">
                Wilayah Jorong <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.id_jorong}
                onChange={(e) => setFormData({ ...formData, id_jorong: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                {opsi?.jorong.map((j) => (
                  <option key={j.id_jorong} value={j.id_jorong}>
                    {j.nama_jorong}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Judul & Detail */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Judul Laporan / Keluhan <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.judul}
              onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
              placeholder="Contoh: Lampu Jalan Mati di Pertigaan Jorong Kambang Barat"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Patokan / Alamat Lokasi Kejadian <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.lokasi}
              onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
              placeholder="Contoh: Depan Mushalla Al-Ikhlas, RT 02 / RW 01"
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Deskripsi Lengkap Kejadian <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Jelaskan secara rinci kronologi kejadian, dampak yang dirasakan warga, atau saran perbaikan..."
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          {/* Unggah Foto Bukti Wajib */}
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-1.5">
              Foto Bukti Kejadian <span className="text-rose-500">* (Wajib Minimal 1 Foto)</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-emerald-500 transition bg-slate-50/50">
              {filePreview ? (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={filePreview}
                    alt="Pratinjau Foto Bukti"
                    className="max-h-56 mx-auto rounded-xl object-contain border border-slate-200"
                  />
                  <label
                    htmlFor="foto-input"
                    className="inline-block text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Ganti Foto Lain
                  </label>
                </div>
              ) : (
                <label htmlFor="foto-input" className="cursor-pointer block space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-medium text-slate-700">
                    Klik untuk memilih foto dari galeri/kamera
                  </div>
                  <p className="text-xs text-slate-500">Mendukung format JPG, PNG, atau WebP (Maks. 5 MB)</p>
                </label>
              )}
              <input
                id="foto-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Tombol Kirim */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold rounded-xl shadow-lg shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim Laporan ke Sistem...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Kirim Pengaduan Sekarang
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
