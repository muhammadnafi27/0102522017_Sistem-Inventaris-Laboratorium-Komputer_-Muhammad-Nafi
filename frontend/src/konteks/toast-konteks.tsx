"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type JenisToast = "sukses" | "gagal";

interface Toast {
  id: number;
  jenis: JenisToast;
  pesan: string;
}

interface NilaiKonteksToast {
  tampilkanSukses: (pesan: string) => void;
  tampilkanGagal: (pesan: string) => void;
}

const KonteksToast = createContext<NilaiKonteksToast | undefined>(undefined);

const DURASI_TOAST = 3500;

// Provider toast global: menampilkan notifikasi sukses/gagal singkat di pojok kanan bawah,
// dipakai setelah aksi mutasi (tambah/edit/hapus) sesuai kebutuhan PRD (toast sukses/gagal).
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [daftar, setDaftar] = useState<Toast[]>([]);

  const hapus = useCallback((id: number) => {
    setDaftar((sebelumnya) => sebelumnya.filter((t) => t.id !== id));
  }, []);

  const tambah = useCallback(
    (jenis: JenisToast, pesan: string) => {
      const id = Date.now() + Math.random();
      setDaftar((sebelumnya) => [...sebelumnya, { id, jenis, pesan }]);
      // Toast hilang otomatis setelah beberapa detik.
      setTimeout(() => hapus(id), DURASI_TOAST);
    },
    [hapus],
  );

  const nilai = useMemo<NilaiKonteksToast>(
    () => ({
      tampilkanSukses: (pesan) => tambah("sukses", pesan),
      tampilkanGagal: (pesan) => tambah("gagal", pesan),
    }),
    [tambah],
  );

  return (
    <KonteksToast.Provider value={nilai}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {daftar.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={[
              "pointer-events-auto flex items-start gap-2 rounded-lg px-4 py-3 text-sm font-medium shadow-lg",
              "animate-[masuk_0.15s_ease-out] max-w-xs",
              toast.jenis === "sukses"
                ? "bg-success text-white"
                : "bg-delete text-white",
            ].join(" ")}
          >
            <span>{toast.pesan}</span>
          </div>
        ))}
      </div>
    </KonteksToast.Provider>
  );
}

export function useToast(): NilaiKonteksToast {
  const konteks = useContext(KonteksToast);
  if (!konteks) {
    throw new Error("useToast harus dipakai di dalam <ToastProvider>.");
  }
  return konteks;
}
