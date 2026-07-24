import { Router } from "express";

import { aktivitasController } from "@/controller/aktivitas.controller";
import { autentikasi } from "@/middleware/autentikasi";
import { authorizeRoles } from "@/middleware/otorisasi";
import { tanganiHasilValidasi } from "@/middleware/validasi-hasil";
import { validasiQueryAktivitas } from "@/validasi/aktivitas.validasi";

const rute = Router();

// Khusus admin sesuai Prompt Master 6. Akses read-only untuk operator bersifat opsional
// pada PRD dan belum diaktifkan pada tahap ini.
rute.use(autentikasi, authorizeRoles("admin"));

rute.get("/", validasiQueryAktivitas, tanganiHasilValidasi, aktivitasController.daftar);

export default rute;
