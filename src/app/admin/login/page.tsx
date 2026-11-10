"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2, LockKeyhole, ShieldAlert, UserRound } from "lucide-react";
import { loginAparatur } from "@/lib/actions/auth";

function AdminLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const aksesDitolak = searchParams.get("akses") === "ditolak";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("password", password);

      const result = await loginAparatur(formData);
      if (result.success && result.data?.aparatur) {
        router.replace(result.data.aparatur.peran === "wali_nagari" ? "/wali-nagari/dashboard" : "/admin/dashboard");
        router.refresh();
      } else {
        setErrorMessage(result.message || "Username atau kata sandi tidak valid.");
      }
    } catch {
      setErrorMessage("Login gagal diproses karena gangguan jaringan. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[78vh] items-center justify-center px-4 py-10 sm:py-14">
      <section className="w-full max-w-md space-y-7 rounded-3xl border border-slate-200 bg-white p-7 shadow-xl sm:p-9">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Logo.webp" alt="Logo Nagari Kambang Utara" className="h-16 w-16 object-contain drop-shadow" />
          </div>
          <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-emerald-800">Portal resmi SILAPOR-KU</p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900">Masuk aparatur</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Halaman khusus Admin Nagari dan Wali Nagari Kambang Utara.
          </p>
        </div>

        {aksesDitolak && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>Anda perlu masuk dengan akun yang berwenang untuk membuka halaman tersebut.</p>
          </div>
        )}

        {errorMessage && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-xs font-semibold text-slate-700">
            Username
            <span className="relative mt-1.5 block">
              <UserRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                maxLength={50}
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Masukkan username"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3 text-sm font-normal focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </span>
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Kata sandi
            <span className="relative mt-1.5 block">
              <LockKeyhole className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                maxLength={72}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-11 text-sm font-normal focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                aria-pressed={showPassword}
                className="absolute right-3 top-2.5 rounded p-1 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </span>
          </label>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-950 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoading ? "Memeriksa akses..." : "Masuk ke sistem"}
          </button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center">
          <p className="mb-3 text-xs leading-relaxed text-slate-500">
            Akses hanya untuk aparatur yang memiliki akun terdaftar.
          </p>
          <Link href="/" className="text-xs font-medium text-slate-600 transition hover:text-emerald-900">
            Kembali ke halaman utama warga
          </Link>
        </div>
      </section>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-sm text-slate-500">Memuat portal aparatur...</div>}>
      <AdminLoginContent />
    </Suspense>
  );
}
