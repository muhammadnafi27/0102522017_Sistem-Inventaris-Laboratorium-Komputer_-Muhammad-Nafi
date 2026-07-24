import { Router } from "express";

import { responsSukses } from "@/utilitas/respons";

const rute = Router();

// Endpoint sederhana untuk memastikan server backend hidup dan menerima request.
// Dipakai pada tahap fondasi sebelum fitur domain lain dibangun.
rute.get("/health", (req, res) => {
  responsSukses(res, 200, "Server LabInventory berjalan normal.", {
    status: "ok",
    waktu: new Date().toISOString(),
  });
});

export default rute;
