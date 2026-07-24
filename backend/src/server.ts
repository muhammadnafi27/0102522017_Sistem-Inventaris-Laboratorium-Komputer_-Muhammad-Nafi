import type { Server } from "node:http";

import { buatAplikasi } from "@/aplikasi";
import { environment } from "@/konfigurasi/environment";
import { tutupPoolDatabase, ujiKoneksiDatabase } from "@/konfigurasi/database";
import { logger } from "@/utilitas/logger";
import { pastikanFolderUnggahanAda } from "@/utilitas/berkas";

// Titik masuk utama proses backend. Server HTTP baru dibuka setelah koneksi database
// terverifikasi dan folder upload foto dipastikan tersedia, supaya kesalahan konfigurasi
// langsung terlihat saat start alih-alih muncul samar ketika request pertama masuk.
async function mulaiServer(): Promise<void> {
  await ujiKoneksiDatabase();
  await pastikanFolderUnggahanAda();

  const aplikasi = buatAplikasi();

  const server = aplikasi.listen(environment.port, () => {
    logger.info(
      `Server LabInventory backend berjalan pada http://localhost:${environment.port} (mode ${environment.nodeEnv})`,
    );
  });

  daftarkanGracefulShutdown(server);
}

// Graceful shutdown: menutup server HTTP terlebih dahulu agar request yang sedang berjalan
// selesai, baru menutup pool database, sebelum proses benar-benar berhenti.
function daftarkanGracefulShutdown(server: Server): void {
  function matikanServer(sinyal: string): void {
    logger.info(`Menerima sinyal ${sinyal}, mematikan server...`);
    server.close(() => {
      tutupPoolDatabase()
        .catch((error) => logger.error("Gagal menutup pool database dengan rapi", error))
        .finally(() => {
          logger.info("Server telah dimatikan dengan aman.");
          process.exit(0);
        });
    });
  }

  process.on("SIGINT", () => matikanServer("SIGINT"));
  process.on("SIGTERM", () => matikanServer("SIGTERM"));
}

mulaiServer().catch((error) => {
  logger.error("Server gagal dijalankan", error);
  process.exit(1);
});
