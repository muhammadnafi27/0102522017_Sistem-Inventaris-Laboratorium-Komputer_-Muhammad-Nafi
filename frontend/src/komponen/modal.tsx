"use client";

import { useEffect } from "react";

import { IkonTutup } from "@/komponen/ikon";

interface PropsModal {
  terbuka: boolean;
  judul: string;
  onTutup: () => void;
  children: React.ReactNode;
  lebar?: "md" | "lg";
}

const KELAS_LEBAR: Record<NonNullable<PropsModal["lebar"]>, string> = {
  md: "max-w-md",
  lg: "max-w-2xl",
};

// Modal generik: overlay gelap, kartu putih di tengah, dapat ditutup lewat tombol X,
// klik area luar, atau tombol Escape. Dipakai untuk form tambah/edit dan detail barang.
export function Modal({ terbuka, judul, onTutup, children, lebar = "lg" }: PropsModal) {
  // Menutup modal dengan Escape + mengunci scroll body selagi modal terbuka.
  useEffect(() => {
    if (!terbuka) return;

    function tanganiTombol(event: KeyboardEvent) {
      if (event.key === "Escape") onTutup();
    }
    document.addEventListener("keydown", tanganiTombol);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", tanganiTombol);
      document.body.style.overflow = "";
    };
  }, [terbuka, onTutup]);

  if (!terbuka) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center">
      {/* Backdrop: klik di luar kartu menutup modal. */}
      <div className="absolute inset-0" onClick={onTutup} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        className={`relative w-full ${KELAS_LEBAR[lebar]} animate-[muncul_0.15s_ease-out] rounded-xl bg-surface shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">{judul}</h2>
          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className="rounded-md p-1.5 text-inactive transition-colors hover:bg-slate-100 hover:text-foreground"
          >
            <IkonTutup className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  );
}
