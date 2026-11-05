"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
    <div className="no-print flex flex-col items-end gap-2">
      <div className="flex items-center gap-3">
        <span className="hidden text-right sm:block">
          <span className="block text-xs font-semibold text-slate-800">
            {peran === "admin" ? "Admin Nagari" : "Wali Nagari"}
          </span>
          <span className="block text-xs text-slate-500">Portal Aparatur</span>
        </span>
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
        <p role="alert" className="max-w-xs text-right text-xs text-rose-700">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
