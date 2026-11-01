import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Default 1 MB terlalu kecil: foto bukti hingga 5 MB dikirim ke createLaporan sebagai data URL
      // base64 (~6,7 MB). Catatan: fungsi serverless Vercel membatasi body request ~4,5 MB, jadi untuk
      // produksi unggah foto sebaiknya langsung dari browser ke object storage (mis. Vercel Blob)
      // dan createLaporan hanya menerima URL-nya (sudah didukung oleh lampiranSchema).
      bodySizeLimit: "8mb",
    },
  },
};

export default nextConfig;
