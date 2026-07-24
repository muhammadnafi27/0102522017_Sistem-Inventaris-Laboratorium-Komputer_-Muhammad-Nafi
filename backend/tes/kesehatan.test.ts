import request from "supertest";

import { buatAplikasi } from "@/aplikasi";

// Pengujian dasar untuk memastikan fondasi Express dapat menerima request dan
// mengembalikan format respons baku sebelum fitur domain dibangun.
describe("GET /api/health", () => {
  it("mengembalikan status sukses dan status ok", async () => {
    const aplikasi = buatAplikasi();

    const respons = await request(aplikasi).get("/api/health");

    expect(respons.status).toBe(200);
    expect(respons.body.sukses).toBe(true);
    expect(respons.body.data.status).toBe("ok");
  });
});
