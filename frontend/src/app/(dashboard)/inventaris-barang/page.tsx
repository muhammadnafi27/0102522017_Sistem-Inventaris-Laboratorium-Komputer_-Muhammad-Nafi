import type { Metadata } from "next";

import { HalamanSegera } from "@/komponen/halaman-segera";

export const metadata: Metadata = { title: "Inventaris Barang - LabInventory" };

export default function HalamanInventarisBarang() {
  return <HalamanSegera judul="Inventaris Barang" />;
}
