"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginStaff } from "@/actions/auth";
import { ShieldAlert, Lock, Mail, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const res = await loginStaff(formData);
      if (res.success && res.data?.user) {
        if (res.data.user.role === "WALI_NAGARI") {
          router.push("/wali-nagari/dashboard");
        } else {
          router.push("/admin/dashboard");
        }
      } else {
        setErrorMessage(res.message || "Email atau kata sandi tidak valid.");
      }
    } catch {
      setErrorMessage("Terjadi kesalahan koneksi saat memproses login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-xl max-w-md w-full space-y-8">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Masuk Portal Aparatur
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Khusus Admin Nagari & Wali Nagari Kambang Utara untuk verifikasi dan pemantauan laporan.
          </p>
        </div>

        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Resmi
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kambangutara.desa.id"
                className="w-full px-4 py-2.5 pl-10 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pl-10 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-md"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Masuk ke Sistem"}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-800 transition">
            ← Kembali ke Halaman Utama Warga
          </Link>
        </div>
      </div>
    </div>
  );
}
