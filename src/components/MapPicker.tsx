"use client";

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Navigation, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

interface MapPickerProps {
  latitude: string;
  longitude: string;
  onChange: (lat: string, lng: string) => void;
  isLocating?: boolean;
  onGetLocation?: () => void;
}

// Koordinat pusat Nagari Kambang Utara (Kecamatan Lengayang, Pesisir Selatan)
const DEFAULT_CENTER: [number, number] = [-1.415, 100.62];
const DEFAULT_ZOOM = 14;

// Ikon pin khusus bernuansa hijau SILAPOR-KU (SVG anti-rusak/anti-404)
const customPinIcon = L.divIcon({
  className: "silapor-custom-marker",
  html: `
    <div style="transform: translate(-50%, -100%); display: flex; flex-direction: column; align-items: center; cursor: grab;">
      <div style="background-color: #065f46; color: #ffffff; padding: 7px; border-radius: 9999px; box-shadow: 0 4px 10px rgba(0,0,0,0.35); border: 2.5px solid #ffffff;">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div style="width: 8px; height: 8px; background-color: #065f46; border-radius: 9999px; margin-top: -3px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [0, 0],
});

export default function MapPicker({
  latitude,
  longitude,
  onChange,
  isLocating = false,
  onGetLocation,
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [showCoordinateDetails, setShowCoordinateDetails] = useState(false);

  const hasCoordinates =
    latitude.trim() !== "" &&
    longitude.trim() !== "" &&
    !isNaN(Number(latitude)) &&
    !isNaN(Number(longitude));

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialLat = hasCoordinates ? Number(latitude) : DEFAULT_CENTER[0];
    const initialLng = hasCoordinates ? Number(longitude) : DEFAULT_CENTER[1];
    const initialZoom = hasCoordinates ? 16 : DEFAULT_ZOOM;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: initialZoom,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Pasang marker jika sudah ada koordinat awal
    if (hasCoordinates) {
      const marker = L.marker([initialLat, initialLng], {
        icon: customPinIcon,
        draggable: true,
      }).addTo(map);

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        onChange(position.lat.toFixed(6), position.lng.toFixed(6));
      });

      markerRef.current = marker;
    }

    // Klik pada peta untuk pasang / pindahkan marker
    map.on("click", (event: L.LeafletMouseEvent) => {
      const { lat, lng } = event.latlng;
      const formattedLat = lat.toFixed(6);
      const formattedLng = lng.toFixed(6);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          const position = marker.getLatLng();
          onChange(position.lat.toFixed(6), position.lng.toFixed(6));
        });

        markerRef.current = marker;
      }

      onChange(formattedLat, formattedLng);
    });

    mapInstanceRef.current = map;

    // Fix ukuran map bila render di tab/container dinamis
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker posisi ketika props latitude / longitude berubah dari luar (misal GPS button)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (hasCoordinates) {
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const marker = L.marker([lat, lng], {
          icon: customPinIcon,
          draggable: true,
        }).addTo(map);

        marker.on("dragend", () => {
          const position = marker.getLatLng();
          onChange(position.lat.toFixed(6), position.lng.toFixed(6));
        });

        markerRef.current = marker;
      }

      map.flyTo([lat, lng], Math.max(map.getZoom(), 16), {
        animate: true,
        duration: 1.2,
      });
    } else {
      if (markerRef.current) {
        markerRef.current.remove();
        markerRef.current = null;
      }
    }
  }, [latitude, longitude, hasCoordinates, onChange]);

  const handleResetLocation = () => {
    onChange("", "");
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(DEFAULT_CENTER, DEFAULT_ZOOM);
    }
  };

  return (
    <div className="space-y-3">
      {/* Tombol aksi atas */}
      <div className="flex flex-col justify-between gap-2.5 sm:flex-row sm:items-center">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <MapPin className="h-4 w-4 text-emerald-800" />
            Peta Titik Lokasi Kejadian
          </p>
          <p className="mt-0.5 text-xs text-slate-600">
            Klik atau ketuk pada peta untuk menaruh pin titik kejadian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasCoordinates && (
            <button
              type="button"
              onClick={handleResetLocation}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
              title="Hapus titik yang sudah dipilih"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset Pin
            </button>
          )}

          {onGetLocation && (
            <button
              type="button"
              onClick={onGetLocation}
              disabled={isLocating}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-emerald-800 bg-emerald-50/70 px-3 py-1.5 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:opacity-60"
            >
              {isLocating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Navigation className="h-3.5 w-3.5" />
              )}
              {isLocating ? "Mencari titik Anda..." : "Gunakan lokasi saya (GPS)"}
            </button>
          )}
        </div>
      </div>

      {/* Container Peta */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-inner">
        <div ref={mapContainerRef} className="h-72 w-full z-0 sm:h-80" />

        {/* Petunjuk melayang di bagian bawah peta agar tidak menghalangi tombol zoom (+ -) */}
        <div className="pointer-events-none absolute bottom-3 left-3 z-[400] rounded-lg border border-slate-200/80 bg-white/95 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-md backdrop-blur-sm">
          {hasCoordinates ? (
            <span className="flex items-center gap-1.5 font-semibold text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
              Titik lokasi terpasang (dapat digeser)
            </span>
          ) : (
            <span>📍 Ketuk peta untuk memasang pin lokasi</span>
          )}
        </div>
      </div>

      {/* Accordion detail koordinat (opsional & rapi) */}
      <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Status Koordinat:</span>
            {hasCoordinates ? (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700 text-[11px]">
                Tersimpan otomatis
              </span>
            ) : (
              <span className="text-slate-400">Belum dipilih (opsional)</span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowCoordinateDetails((prev) => !prev)}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800"
          >
            {showCoordinateDetails ? "Tutup angka koordinat" : "Lihat angka koordinat"}
            {showCoordinateDetails ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {showCoordinateDetails && (
          <div className="mt-3 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
            <div>
              <span className="block text-[11px] font-semibold text-slate-600">Lintang (Latitude):</span>
              <input
                type="text"
                readOnly
                value={latitude || "-"}
                className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-700"
              />
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-slate-600">Bujur (Longitude):</span>
              <input
                type="text"
                readOnly
                value={longitude || "-"}
                className="mt-1 block w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs text-slate-700"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
