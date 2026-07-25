import request from "supertest";

import { buatAplikasi } from "@/aplikasi";
import { NAMA_FOTO_DEFAULT } from "@/konfigurasi/unggahan";

const aplikasi = buatAplikasi();

// Foto barang disajikan backend (port 3000) tetapi ditampilkan lewat <img> di frontend
// (port 3001). Pengujian ini mengunci perilaku tersebut karena helmet() secara default
// memasang Cross-Origin-Resource-Policy: same-origin yang membuat browser memblokir gambar
// dengan ERR_BLOCKED_BY_RESPONSE.NotSameOrigin - bug yang pernah terjadi dan sulit terlihat
// karena komponen foto diam-diam jatuh ke placeholder tanpa pesan error.
describe("Penyajian berkas statis /uploads", () => {
  it("menyajikan foto default dengan status 200 dan content-type gambar", async () => {
    const respons = await request(aplikasi).get(`/uploads/barang/${NAMA_FOTO_DEFAULT}`);

    expect(respons.status).toBe(200);
    expect(respons.headers["content-type"]).toContain("image/");
  });

  it("mengizinkan foto dimuat lintas origin oleh frontend", async () => {
    const respons = await request(aplikasi).get(`/uploads/barang/${NAMA_FOTO_DEFAULT}`);

    expect(respons.headers["cross-origin-resource-policy"]).toBe("cross-origin");
  });

  it("endpoint API tetap memakai kebijakan ketat bawaan helmet", async () => {
    const respons = await request(aplikasi).get("/api/health");

    expect(respons.headers["cross-origin-resource-policy"]).toBe("same-origin");
  });

  it("berkas yang tidak ada tetap menghasilkan 404 berformat baku", async () => {
    const respons = await request(aplikasi).get("/uploads/barang/tidak-ada-file-ini.png");

    expect(respons.status).toBe(404);
    expect(respons.body.sukses).toBe(false);
  });
});
