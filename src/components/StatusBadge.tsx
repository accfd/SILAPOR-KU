import { getStatusColor } from "@/lib/utils";
import { StatusLaporan } from "@/types";
import { Clock, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: StatusLaporan | string;
  size?: "sm" | "md";
}

export default function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const colors = getStatusColor(status);

  const getIcon = () => {
    switch (status) {
      case "menunggu":
        return <Clock className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      case "diproses":
        return <Loader2 className={`${size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} animate-spin`} />;
      case "selesai":
        return <CheckCircle2 className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      case "ditolak":
        return <XCircle className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />;
      default:
        return null;
    }
  };

  const getLabel = () => {
    switch (status) {
      case "menunggu":
        return "Menunggu Verifikasi";
      case "diproses":
        return "Sedang Diproses";
      case "selesai":
        return "Selesai Ditindaklanjuti";
      case "ditolak":
        return "Laporan Ditolak";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${
        size === "sm" ? "text-xs px-2.5 py-0.5" : "text-sm px-3 py-1"
      }`}
    >
      {getIcon()}
      {getLabel()}
    </span>
  );
}
