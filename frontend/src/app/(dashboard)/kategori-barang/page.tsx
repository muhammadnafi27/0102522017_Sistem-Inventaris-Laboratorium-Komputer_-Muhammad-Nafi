import type { Metadata } from "next";

import { AksesDitolak } from "@/komponen/akses-ditolak";
import { HalamanSegera } from "@/komponen/halaman-segera";
import { RoleGuard } from "@/komponen/role-guard";

export const metadata: Metadata = { title: "Kategori Barang - LabInventory" };

// Kategori Barang hanya untuk admin/operator - konsisten dengan backend (GET /api/kategori
// authorizeRoles("admin","operator")). Viewer yang membuka URL ini langsung melihat 403,
// bukan hanya kehilangan menu di sidebar.
export default function HalamanKategoriBarang() {
  return (
    <RoleGuard roles={["admin", "operator"]} fallback={<AksesDitolak />}>
      <HalamanSegera judul="Kategori Barang" />
    </RoleGuard>
  );
}
