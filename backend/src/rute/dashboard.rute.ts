import { Router } from "express";

import { dashboardController } from "@/controller/dashboard.controller";
import { autentikasi } from "@/middleware/autentikasi";

const rute = Router();

// Dashboard terbuka untuk seluruh role yang sudah login (admin, operator, viewer) sesuai PRD 4.4.
rute.get("/", autentikasi, dashboardController.ringkasan);

export default rute;
