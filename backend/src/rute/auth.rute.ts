import { Router } from "express";
import rateLimit from "express-rate-limit";

import { authController } from "@/controller/auth.controller";
import { autentikasi } from "@/middleware/autentikasi";
import { tanganiHasilValidasi } from "@/middleware/validasi-hasil";
import { responsGagal } from "@/utilitas/respons";
import { validasiLogin, validasiRegister } from "@/validasi/auth.validasi";

const rute = Router();

// Rate limit khusus login untuk memperlambat percobaan brute force menebak password.
// 10 percobaan per 15 menit per IP sudah cukup longgar untuk pengguna sah yang salah ketik,
// tetapi menyulitkan automated credential guessing.
const batasLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    responsGagal(res, 429, "Terlalu banyak percobaan login. Silakan coba lagi beberapa menit lagi.");
  },
});

rute.post("/register", validasiRegister, tanganiHasilValidasi, authController.register);
rute.post("/login", batasLogin, validasiLogin, tanganiHasilValidasi, authController.login);
rute.get("/me", autentikasi, authController.me);
rute.post("/logout", autentikasi, authController.logout);

export default rute;
