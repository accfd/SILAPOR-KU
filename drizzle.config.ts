import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// drizzle-kit berjalan di luar Next.js, jadi file env dimuat manual (.env.local diutamakan).
config({ path: [".env.local", ".env"] });

// Migrasi sebaiknya lewat koneksi langsung (non-pooler) bila DIRECT_URL tersedia.
const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL (atau DIRECT_URL) belum diatur di .env.local / .env");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
