import type { Metadata } from "next";

import { HalamanSegera } from "@/komponen/halaman-segera";

export const metadata: Metadata = { title: "Profil - LabInventory" };

export default function HalamanProfil() {
  return <HalamanSegera judul="Profil" />;
}
