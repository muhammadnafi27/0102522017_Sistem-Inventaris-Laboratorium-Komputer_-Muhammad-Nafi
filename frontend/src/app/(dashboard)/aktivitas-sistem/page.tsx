import type { Metadata } from "next";

import { AksesDitolak } from "@/komponen/akses-ditolak";
import { HalamanSegera } from "@/komponen/halaman-segera";
import { RoleGuard } from "@/komponen/role-guard";

export const metadata: Metadata = { title: "Aktivitas Sistem - LabInventory" };

// Dibatasi admin saja - konsisten dengan backend (GET /api/aktivitas authorizeRoles("admin")).
export default function HalamanAktivitasSistem() {
  return (
    <RoleGuard roles={["admin"]} fallback={<AksesDitolak />}>
      <HalamanSegera judul="Aktivitas Sistem" />
    </RoleGuard>
  );
}
