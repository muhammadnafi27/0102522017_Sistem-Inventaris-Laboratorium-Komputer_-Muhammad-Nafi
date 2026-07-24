"use client";

import { useState } from "react";

import { Header } from "@/komponen/header";
import { Sidebar } from "@/komponen/sidebar";

const KUNCI_SIDEBAR_TERTUTUP = "labinventory:sidebar-tertutup";

// Membaca status ciutkan sidebar dari localStorage. Dibungkus fungsi agar bisa dipakai sebagai
// lazy initializer useState - saat SSR (window belum ada) selalu mengembalikan false, sehingga
// HTML dari server dan hasil hydration awal di client tetap konsisten (tidak ada mismatch).
function bacaStatusTertutupTersimpan(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.localStorage.getItem(KUNCI_SIDEBAR_TERTUTUP) === "1";
}

// Shell dashboard: menggabungkan Sidebar + Header + konten halaman, sekaligus memegang dua
// state UI murni (ciutkan sidebar desktop yang persisten, dan buka/tutup drawer mobile yang
// sementara) agar Sidebar dan Header bisa saling berkoordinasi tanpa Context tambahan.
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [tertutup, setTertutup] = useState(bacaStatusTertutupTersimpan);
  const [drawerMobileTerbuka, setDrawerMobileTerbuka] = useState(false);

  function toggleTertutup() {
    setTertutup((sebelumnya) => {
      const nilaiBaru = !sebelumnya;
      window.localStorage.setItem(KUNCI_SIDEBAR_TERTUTUP, nilaiBaru ? "1" : "0");
      return nilaiBaru;
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        tertutup={tertutup}
        onToggleTertutup={toggleTertutup}
        drawerMobileTerbuka={drawerMobileTerbuka}
        onTutupDrawerMobile={() => setDrawerMobileTerbuka(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onBukaDrawerMobile={() => setDrawerMobileTerbuka(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
