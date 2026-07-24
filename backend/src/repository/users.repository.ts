import type { ResultSetHeader } from "mysql2";
import type { PoolConnection } from "mysql2/promise";

import { pool } from "@/konfigurasi/database";
import type { HitungRow, RolePengguna, UserRow } from "@/tipe/basis-data";

// Parameter pembuatan user. Password yang masuk ke repository ini wajib sudah dalam
// bentuk hash bcrypt - hashing dilakukan pada lapisan service, bukan di sini.
export interface DataBuatUser {
  nama: string;
  email: string;
  password: string;
  role: RolePengguna;
}

// Parameter perubahan data dasar user (tanpa password - reset password punya method sendiri).
export interface DataPerbaruiUser {
  nama: string;
  email: string;
  role: RolePengguna;
}

export interface FilterUser {
  search?: string;
  role?: RolePengguna;
}

export interface OpsiDaftarUser extends FilterUser {
  halaman: number;
  batas: number;
}

type Konektor = PoolConnection | typeof pool;

// Membangun klausa WHERE + nilai placeholder dari filter user yang aktif saja.
function bangunKlausaWhereUser(filter: FilterUser): { where: string; nilai: (string | number)[] } {
  const klausa: string[] = [];
  const nilai: (string | number)[] = [];

  if (filter.search) {
    klausa.push("(nama LIKE ? OR email LIKE ?)");
    const kataKunci = `%${filter.search}%`;
    nilai.push(kataKunci, kataKunci);
  }
  if (filter.role) {
    klausa.push("role = ?");
    nilai.push(filter.role);
  }

  return { where: klausa.length > 0 ? `WHERE ${klausa.join(" AND ")}` : "", nilai };
}

export const usersRepository = {
  async cariSemua(konektor: Konektor = pool): Promise<UserRow[]> {
    const [baris] = await konektor.execute<UserRow[]>("SELECT * FROM users ORDER BY nama ASC");
    return baris;
  },

  // Daftar user dengan search (nama/email) dan filter role, dipakai GET /api/users.
  async cariDenganFilter(opsi: OpsiDaftarUser, konektor: Konektor = pool): Promise<UserRow[]> {
    const { where, nilai } = bangunKlausaWhereUser(opsi);
    const offset = (opsi.halaman - 1) * opsi.batas;

    const [baris] = await konektor.execute<UserRow[]>(
      `SELECT * FROM users ${where} ORDER BY nama ASC LIMIT ? OFFSET ?`,
      [...nilai, opsi.batas, offset],
    );
    return baris;
  },

  async hitungDenganFilter(filter: FilterUser, konektor: Konektor = pool): Promise<number> {
    const { where, nilai } = bangunKlausaWhereUser(filter);
    const [baris] = await konektor.execute<HitungRow[]>(
      `SELECT COUNT(*) AS total FROM users ${where}`,
      nilai,
    );
    return Number(baris[0]?.total ?? 0);
  },

  async cariById(id: number, konektor: Konektor = pool): Promise<UserRow | null> {
    const [baris] = await konektor.execute<UserRow[]>("SELECT * FROM users WHERE id = ? LIMIT 1", [id]);
    return baris[0] ?? null;
  },

  // email dinormalisasi lowercase oleh pemanggil sebelum masuk ke sini (lihat aturan bisnis PRD 3.2).
  async cariByEmail(email: string, konektor: Konektor = pool): Promise<UserRow | null> {
    const [baris] = await konektor.execute<UserRow[]>("SELECT * FROM users WHERE email = ? LIMIT 1", [
      email,
    ]);
    return baris[0] ?? null;
  },

  async hitungSemua(konektor: Konektor = pool): Promise<number> {
    const [baris] = await konektor.execute<HitungRow[]>("SELECT COUNT(*) AS total FROM users");
    return Number(baris[0]?.total ?? 0);
  },

  // Menghitung admin yang masih aktif. Dipakai untuk aturan "sistem tidak boleh kehilangan admin terakhir".
  async hitungAdmin(konektor: Konektor = pool): Promise<number> {
    const [baris] = await konektor.execute<HitungRow[]>(
      "SELECT COUNT(*) AS total FROM users WHERE role = 'admin'",
    );
    return Number(baris[0]?.total ?? 0);
  },

  async buat(data: DataBuatUser, konektor: Konektor = pool): Promise<number> {
    const [hasil] = await konektor.execute<ResultSetHeader>(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [data.nama, data.email, data.password, data.role],
    );
    return hasil.insertId;
  },

  async perbarui(id: number, data: DataPerbaruiUser, konektor: Konektor = pool): Promise<boolean> {
    const [hasil] = await konektor.execute<ResultSetHeader>(
      "UPDATE users SET nama = ?, email = ?, role = ? WHERE id = ?",
      [data.nama, data.email, data.role, id],
    );
    return hasil.affectedRows > 0;
  },

  // Mengganti password (hash baru) sekaligus mengosongkan token reset yang mungkin masih tersimpan.
  async perbaruiPassword(id: number, passwordHash: string, konektor: Konektor = pool): Promise<boolean> {
    const [hasil] = await konektor.execute<ResultSetHeader>(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expired_at = NULL WHERE id = ?",
      [passwordHash, id],
    );
    return hasil.affectedRows > 0;
  },

  async hapus(id: number, konektor: Konektor = pool): Promise<boolean> {
    const [hasil] = await konektor.execute<ResultSetHeader>("DELETE FROM users WHERE id = ?", [id]);
    return hasil.affectedRows > 0;
  },
};
