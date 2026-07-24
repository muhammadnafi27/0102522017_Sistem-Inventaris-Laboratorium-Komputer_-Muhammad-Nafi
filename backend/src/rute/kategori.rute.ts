import { Router } from "express";

import { kategoriController } from "@/controller/kategori.controller";
import { autentikasi } from "@/middleware/autentikasi";
import { authorizeRoles } from "@/middleware/otorisasi";
import { tanganiHasilValidasi } from "@/middleware/validasi-hasil";
import { validasiParamId } from "@/validasi/bersama.validasi";
import { validasiKategori } from "@/validasi/kategori.validasi";

const rute = Router();

// Seluruh endpoint kategori membutuhkan login; menu kategori sendiri hanya untuk admin/operator.
rute.use(autentikasi);

rute.get("/", authorizeRoles("admin", "operator"), kategoriController.daftar);

rute.post(
  "/",
  authorizeRoles("admin", "operator"),
  validasiKategori,
  tanganiHasilValidasi,
  kategoriController.buat,
);

rute.put(
  "/:id",
  authorizeRoles("admin", "operator"),
  validasiParamId,
  validasiKategori,
  tanganiHasilValidasi,
  kategoriController.perbarui,
);

// Hapus kategori hanya admin - operator boleh create/update tetapi tidak boleh delete.
rute.delete(
  "/:id",
  authorizeRoles("admin"),
  validasiParamId,
  tanganiHasilValidasi,
  kategoriController.hapus,
);

export default rute;
