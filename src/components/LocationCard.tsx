import { MapPin, Navigation } from "lucide-react";

interface LocationCardProps {
  jorong: string;
  patokan: string;
  lintang: number | null;
  bujur: number | null;
}

export default function LocationCard({ jorong, patokan, lintang, bujur }: LocationCardProps) {
  const hasCoordinates = lintang !== null && bujur !== null;
  const mapUrl = hasCoordinates
    ? `https://www.openstreetmap.org/?mlat=${lintang}&mlon=${bujur}#map=17/${lintang}/${bujur}`
    : null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
        <MapPin className="h-4 w-4 text-emerald-700" />
        Lokasi Kejadian
      </h3>
      <p className="text-sm font-medium text-slate-800">{jorong}</p>
      <p className="mt-1 text-sm text-slate-600">{patokan}</p>
      {hasCoordinates ? (
        <>
          <p className="mt-3 break-all font-mono text-xs text-slate-500">
            {lintang}, {bujur}
          </p>
          <a
            href={mapUrl ?? undefined}
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100"
          >
            <Navigation className="h-3.5 w-3.5" />
            Buka titik pada peta
          </a>
        </>
      ) : (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Koordinat GPS belum disertakan. Gunakan patokan lokasi untuk menemukan titik kejadian.
        </p>
      )}
    </section>
  );
}
