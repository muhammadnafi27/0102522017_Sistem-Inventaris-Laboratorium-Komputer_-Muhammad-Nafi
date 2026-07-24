import type { Metadata } from "next";

import { HalamanSegera } from "@/komponen/halaman-segera";

export const metadata: Metadata = { title: "Dashboard - LabInventory" };

export default function HalamanDashboard() {
  return <HalamanSegera judul="Dashboard" />;
}
