"use server";

import prisma from "@/lib/prisma";
import { generateTicketCode } from "@/lib/utils";
import { ActionResult, CreateTicketDTO, Ticket, TicketStatus } from "@/types";

/**
 * Server Action: Pembuatan Pengaduan Baru oleh Warga
 */
export async function createTicket(data: CreateTicketDTO): Promise<ActionResult<{ nomor_tiket: string }>> {
  try {
    // Validasi dasar
    if (!data.judul || !data.deskripsi || !data.lokasi || !data.lampiran_url) {
      return {
        success: false,
        message: "Semua kolom wajib (termasuk foto bukti) harus diisi lengkap.",
      };
    }

    const nomorTiket = generateTicketCode();

    const newTicket = await prisma.ticket.create({
      data: {
        nomor_tiket: nomorTiket,
        nama_pelapor: data.is_anonim ? null : data.nama_pelapor,
        is_anonim: data.is_anonim ?? false,
        nik: data.is_anonim ? null : data.nik,
        nomor_telepon: data.is_anonim ? null : data.nomor_telepon,
        judul: data.judul,
        deskripsi: data.deskripsi,
        kategori: data.kategori,
        jorong: data.jorong,
        lokasi: data.lokasi,
        lampiran_url: data.lampiran_url,
        status: "MENUNGGU",
      },
    });

    return {
      success: true,
      message: "Laporan berhasil dikirim.",
      data: { nomor_tiket: newTicket.nomor_tiket },
    };
  } catch (error) {
    console.error("Error creating ticket:", error);
    return {
      success: false,
      message: "Terjadi kesalahan sistem saat mengirim laporan.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Server Action: Pelacakan Tiket Mandiri oleh Warga
 */
export async function getTicketByCode(nomorTiket: string): Promise<ActionResult<Ticket>> {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { nomor_tiket: nomorTiket.trim().toUpperCase() },
    });

    if (!ticket) {
      return {
        success: false,
        message: `Tiket dengan kode "${nomorTiket}" tidak ditemukan.`,
      };
    }

    return {
      success: true,
      message: "Tiket ditemukan.",
      data: ticket as unknown as Ticket,
    };
  } catch (error) {
    console.error("Error finding ticket:", error);
    return {
      success: false,
      message: "Gagal mengambil data tiket.",
    };
  }
}

/**
 * Server Action: Pembaruan Status & Tanggapan Tiket oleh Admin Nagari
 */
export async function updateTicketStatus(
  ticketId: string,
  status: TicketStatus,
  tanggapan?: string,
  petugasId?: string
): Promise<ActionResult> {
  try {
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        status,
        tanggapan: tanggapan ?? undefined,
        petugas_id: petugasId ?? undefined,
      },
    });

    return {
      success: true,
      message: `Status tiket berhasil diubah menjadi ${status}.`,
    };
  } catch (error) {
    console.error("Error updating ticket status:", error);
    return {
      success: false,
      message: "Gagal memperbarui status tiket.",
    };
  }
}

/**
 * Server Action: Mengambil Daftar Seluruh Laporan (Untuk Admin & Wali Nagari)
 */
export async function getAllTickets(filters?: {
  status?: TicketStatus;
  kategori?: string;
  jorong?: string;
}): Promise<ActionResult<Ticket[]>> {
  try {
    const tickets = await prisma.ticket.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.kategori && { kategori: filters.kategori }),
        ...(filters?.jorong && { jorong: filters.jorong }),
      },
      orderBy: { created_at: "desc" },
    });

    return {
      success: true,
      message: "Data laporan berhasil dimuat.",
      data: tickets as unknown as Ticket[],
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
    return {
      success: false,
      message: "Gagal memuat daftar laporan.",
      data: [],
    };
  }
}
