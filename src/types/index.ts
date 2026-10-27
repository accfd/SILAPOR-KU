/**
 * Tipe data & antarmuka TypeScript untuk SILAPOR-KU
 */

export type Role = "ADMIN" | "WALI_NAGARI";

export type TicketStatus = "MENUNGGU" | "DIPROSES" | "SELESAI" | "DITOLAK";

export interface User {
  id: string;
  nama: string;
  email: string;
  role: Role;
  created_at: Date;
  updated_at: Date;
}

export interface Ticket {
  id: string;
  nomor_tiket: string;
  nama_pelapor?: string | null;
  is_anonim: boolean;
  nik?: string | null;
  nomor_telepon?: string | null;
  judul: string;
  deskripsi: string;
  kategori: string;
  jorong?: string | null;
  lokasi: string;
  lampiran_url: string;
  status: TicketStatus;
  tanggapan?: string | null;
  petugas_id?: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface CreateTicketDTO {
  nama_pelapor?: string;
  is_anonim?: boolean;
  nik?: string;
  nomor_telepon?: string;
  judul: string;
  deskripsi: string;
  kategori: string;
  jorong?: string;
  lokasi: string;
  lampiran_url: string;
}

export interface UpdateTicketStatusDTO {
  ticket_id: string;
  status: TicketStatus;
  tanggapan?: string;
  petugas_id: string;
}

export interface ActionResult<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
