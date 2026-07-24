import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

import { pool } from "@/konfigurasi/database";
import type { AktivitasDenganUserRow, AktivitasSistemRow, HitungRow } from "@/tipe/basis-data";

// Parameter pencatatan aktivitas. entitas_id dan ip_address opsional karena tidak semua
// aksi (mis. LOGIN) berkaitan dengan satu baris entitas tertentu.
export interface DataAktivitas {
  user_id: number | null;
  aksi: string;
  entitas: string;
  entitas_id: number | null;
  detail: string | null;
  ip_address: string | null;
}

export interface FilterAktivitas {
  aksi?: string;
  entitas?: string;
}

export interface OpsiDaftarAktivitas extends FilterAktivitas {
  halaman: number;
  batas: number;
}

type Konektor = PoolConnection | typeof pool;

function bangunKlausaWhereAktivitas(filter: FilterAktivitas): {
  where: string;
  nilai: (string | number)[];
} {
  const klausa: string[] = [];
  const nilai: (string | number)[] = [];

  if (filter.aksi) {
    klausa.push("aksi = ?");
    nilai.push(filter.aksi);
  }
  if (filter.entitas) {
    klausa.push("entitas = ?");
    nilai.push(filter.entitas);
  }

  return { where: klausa.length > 0 ? `WHERE ${klausa.join(" AND ")}` : "", nilai };
}

export const aktivitasRepository = {
  // Mencatat satu baris aktivitas. Dipanggil dari service setelah aksi (login, create,
  // update, delete, reset password) berhasil dilakukan.
  async catat(data: DataAktivitas, konektor: Konektor = pool): Promise<number> {
    const [hasil] = await konektor.execute<ResultSetHeader>(
      `INSERT INTO aktivitas_sistem (user_id, aksi, entitas, entitas_id, detail, ip_address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.user_id, data.aksi, data.entitas, data.entitas_id, data.detail, data.ip_address],
    );
    return hasil.insertId;
  },

  // Daftar aktivitas terbaru sederhana (tanpa filter), dipakai kartu "Barang Terbaru" dsb
  // pada dashboard - bukan untuk halaman Aktivitas Sistem yang butuh filter dan pagination.
  async cariTerbaru(batas: number, konektor: Konektor = pool): Promise<AktivitasSistemRow[]> {
    const [baris] = await konektor.execute<AktivitasSistemRow[]>(
      "SELECT * FROM aktivitas_sistem ORDER BY created_at DESC LIMIT ?",
      [batas],
    );
    return baris;
  },

  // Daftar aktivitas dengan filter aksi/entitas + pagination + nama/email pelaku (LEFT JOIN
  // users), dipakai GET /api/aktivitas pada halaman Aktivitas Sistem.
  async cariDenganFilter(
    opsi: OpsiDaftarAktivitas,
    konektor: Konektor = pool,
  ): Promise<AktivitasDenganUserRow[]> {
    const { where, nilai } = bangunKlausaWhereAktivitas(opsi);
    const offset = (opsi.halaman - 1) * opsi.batas;

    const [baris] = await konektor.execute<AktivitasDenganUserRow[]>(
      `SELECT a.*, u.nama AS nama_pengguna, u.email AS email_pengguna
       FROM aktivitas_sistem a
       LEFT JOIN users u ON u.id = a.user_id
       ${where}
       ORDER BY a.created_at DESC
       LIMIT ? OFFSET ?`,
      [...nilai, opsi.batas, offset],
    );
    return baris;
  },

  async hitungDenganFilter(filter: FilterAktivitas, konektor: Konektor = pool): Promise<number> {
    const { where, nilai } = bangunKlausaWhereAktivitas(filter);
    const [baris] = await konektor.execute<HitungRow[]>(
      `SELECT COUNT(*) AS total FROM aktivitas_sistem ${where}`,
      nilai,
    );
    return Number(baris[0]?.total ?? 0);
  },

  async hitungSemua(konektor: Konektor = pool): Promise<number> {
    const [baris] = await konektor.execute<HitungRow[]>(
      "SELECT COUNT(*) AS total FROM aktivitas_sistem",
    );
    return Number(baris[0]?.total ?? 0);
  },
};
