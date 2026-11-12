"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAparatur } from "@/lib/actions/auth";
import type { Peran } from "@/types";

interface DashboardHeaderProps {
  peran: Peran;
}

export default function DashboardHeader({ peran }: DashboardHeaderProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dashboardPath = peran === "admin" ? "/admin/dashboard" : "/wali-nagari/dashboard";

  const handleLogout = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const result = await logoutAparatur();
      if (!result.success) {
        setErrorMessage(result.message);
        return;
      }

      router.replace("/admin/login");
      router.refresh();
    } catch {
      setErrorMessage("Gagal mengakhiri sesi. Silakan coba kembali.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <header className="no-print border-b border-slate-200 bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
        <Link
          href={dashboardPath}
          aria-label="SILAPOR-KU, kembali ke dashboard"
          className="flex min-w-0 items-center gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo.webp"
            alt=""
            className="h-10 w-10 shrink-0 object-contain"
          />
          <span className="min-w-0">
            <span className="block truncate text-lg font-bold tracking-tight text-slate-900">
              SILAPOR<span className="text-emerald-600">-KU</span>
            </span>
            <span className="block truncate text-xs font-medium text-slate-500">
              Nagari Kambang Utara
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
          Keluar
        </button>
      </div>
      {errorMessage && (
        <p role="alert" className="mx-auto max-w-7xl px-4 pb-2 text-right text-xs text-rose-700 sm:px-6 lg:px-8">
          {errorMessage}
        </p>
      )}
    </header>
  );
}
