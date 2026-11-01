import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diatur. Salin .env.example menjadi .env lalu isi connection string Neon.");
}

// Driver HTTP Neon: stateless per query, cocok untuk fungsi serverless Vercel (tanpa pool yang harus dijaga).
// Transaksi interaktif tidak tersedia di driver ini, jadi operasi multi-tabel memakai db.batch() (atomik).
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
