import { permintaanApi } from "@/layanan-api/klien";
import type { RingkasanDashboard } from "@/tipe/dashboard";

export async function ambilRingkasanDashboard(): Promise<RingkasanDashboard> {
  const hasil = await permintaanApi<RingkasanDashboard>("/dashboard");
  return hasil.data;
}
