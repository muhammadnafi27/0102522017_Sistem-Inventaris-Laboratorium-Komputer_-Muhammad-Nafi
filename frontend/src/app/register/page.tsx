import type { Metadata } from "next";

import { FormRegister } from "@/fitur/auth/form-register";
import { LayoutAuth } from "@/komponen/tata-letak/layout-auth";

export const metadata: Metadata = {
  title: "Daftar - LabInventory",
};

export default function HalamanRegister() {
  return (
    <LayoutAuth
      judul="Satu Akun untuk Seluruh Tim Laboratorium"
      deskripsi="Daftar sebagai Viewer untuk melihat ketersediaan dan kondisi perangkat. Hubungi admin bila membutuhkan akses tambah/ubah data."
    >
      <FormRegister />
    </LayoutAuth>
  );
}
