import type { Metadata } from "next";
import { Suspense } from "react";

import { IsiInventaris } from "@/fitur/barang/isi-inventaris";
import { SkeletonBaris } from "@/komponen/keadaan";

export const metadata: Metadata = { title: "Inventaris Barang - LabInventory" };

// IsiInventaris memakai useSearchParams sehingga wajib dibungkus Suspense agar Next.js dapat
// menangani prerender dengan benar.
export default function HalamanInventarisBarang() {
  return (
    <Suspense fallback={<SkeletonBaris jumlah={6} />}>
      <IsiInventaris />
    </Suspense>
  );
}
