import { Router } from "express";

import { userController } from "@/controller/user.controller";
import { autentikasi } from "@/middleware/autentikasi";
import { authorizeRoles } from "@/middleware/otorisasi";
import { tanganiHasilValidasi } from "@/middleware/validasi-hasil";
import { validasiParamId } from "@/validasi/bersama.validasi";
import {
  validasiBuatUser,
  validasiPerbaruiUser,
  validasiQueryDaftarUser,
  validasiResetPassword,
} from "@/validasi/user.validasi";

const rute = Router();

// Seluruh endpoint manajemen user khusus admin.
rute.use(autentikasi, authorizeRoles("admin"));

rute.get("/", validasiQueryDaftarUser, tanganiHasilValidasi, userController.daftar);

rute.get("/:id", validasiParamId, tanganiHasilValidasi, userController.detail);

rute.post("/", validasiBuatUser, tanganiHasilValidasi, userController.buat);

rute.put("/:id", validasiParamId, validasiPerbaruiUser, tanganiHasilValidasi, userController.perbarui);

rute.delete("/:id", validasiParamId, tanganiHasilValidasi, userController.hapus);

rute.patch(
  "/:id/reset-password",
  validasiParamId,
  validasiResetPassword,
  tanganiHasilValidasi,
  userController.resetPassword,
);

export default rute;
