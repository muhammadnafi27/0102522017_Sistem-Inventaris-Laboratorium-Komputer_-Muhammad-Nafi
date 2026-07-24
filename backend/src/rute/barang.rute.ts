import { Router } from "express";

import { barangController } from "@/controller/barang.controller";
import { autentikasi } from "@/middleware/autentikasi";
import { authorizeRoles } from "@/middleware/otorisasi";
import { unggahFotoBarang } from "@/middleware/unggah";
import { tanganiHasilValidasi } from "@/middleware/validasi-hasil";
import { validasiBarang, validasiQueryDaftarBarang } from "@/validasi/barang.validasi";
import { validasiParamId } from "@/validasi/bersama.validasi";

const rute = Router();

// Seluruh endpoint barang membutuhkan login; daftar/detail terbuka untuk semua role (termasuk viewer).
rute.use(autentikasi);

rute.get("/", validasiQueryDaftarBarang, tanganiHasilValidasi, barangController.daftar);

// Wajib didaftarkan SEBELUM "/:id" agar path statis ini tidak tertangkap sebagai parameter id
// (validasiParamId hanya menerima angka, sehingga "opsi-lokasi" akan ditolak 422 bila salah urutan).
rute.get("/opsi-lokasi", barangController.daftarLokasi);

rute.get("/:id", validasiParamId, tanganiHasilValidasi, barangController.detail);

// unggahFotoBarang (Multer) wajib berjalan sebelum validator body karena field non-file
// pada multipart/form-data baru terisi ke req.body setelah Multer memprosesnya. Request
// JSON biasa (tanpa foto) tetap kompatibel - Multer melewatkannya begitu saja.
rute.post(
  "/",
  authorizeRoles("admin", "operator"),
  unggahFotoBarang,
  validasiBarang,
  tanganiHasilValidasi,
  barangController.buat,
);

rute.put(
  "/:id",
  authorizeRoles("admin", "operator"),
  unggahFotoBarang,
  validasiParamId,
  validasiBarang,
  tanganiHasilValidasi,
  barangController.perbarui,
);

// Hapus barang hanya admin - operator boleh create/update tetapi tidak boleh delete.
rute.delete(
  "/:id",
  authorizeRoles("admin"),
  validasiParamId,
  tanganiHasilValidasi,
  barangController.hapus,
);

export default rute;
