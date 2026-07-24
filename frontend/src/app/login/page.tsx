import type { Metadata } from "next";

import { FormLogin } from "@/fitur/auth/form-login";
import { LayoutAuth } from "@/komponen/tata-letak/layout-auth";

export const metadata: Metadata = {
  title: "Masuk - LabInventory",
};

export default function HalamanLogin() {
  return (
    <LayoutAuth
      judul="Kelola Inventaris Laboratorium dengan Lebih Mudah"
      deskripsi="Pantau perangkat, kategori, kondisi, dan lokasi seluruh laboratorium komputer dalam satu dashboard yang rapi dan mudah dipahami."
    >
      <FormLogin />
    </LayoutAuth>
  );
}
