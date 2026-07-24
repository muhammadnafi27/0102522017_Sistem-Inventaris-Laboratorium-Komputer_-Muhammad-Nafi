import { Router } from "express";

import { profilController } from "@/controller/profil.controller";
import { autentikasi } from "@/middleware/autentikasi";
import { tanganiHasilValidasi } from "@/middleware/validasi-hasil";
import { validasiPerbaruiProfil } from "@/validasi/profil.validasi";

const rute = Router();

// Profil terbuka untuk seluruh role yang sudah login - setiap pengguna hanya melihat/mengubah miliknya sendiri.
rute.use(autentikasi);

rute.get("/", profilController.lihat);

rute.put("/", validasiPerbaruiProfil, tanganiHasilValidasi, profilController.perbarui);

export default rute;
