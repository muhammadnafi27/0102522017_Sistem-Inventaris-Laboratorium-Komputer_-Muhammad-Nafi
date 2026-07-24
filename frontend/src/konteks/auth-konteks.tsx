"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { ambilPenggunaAktif, logout as logoutApi } from "@/layanan-api/auth";
import type { Pengguna } from "@/tipe/pengguna";

interface NilaiKonteksAuth {
  pengguna: Pengguna | null;
  // true selama pemeriksaan sesi awal (/auth/me) berlangsung - dipakai layout terproteksi
  // dan halaman login/register untuk menghindari redirect prematur.
  memuat: boolean;
  aturPengguna: (pengguna: Pengguna | null) => void;
  muatUlang: () => Promise<void>;
  logout: () => Promise<void>;
}

const KonteksAuth = createContext<NilaiKonteksAuth | undefined>(undefined);

// AuthProvider memanggil GET /auth/me sekali saat aplikasi dimuat untuk memeriksa apakah
// cookie JWT yang tersimpan di browser masih valid, lalu menyimpan hasilnya di satu tempat
// agar seluruh komponen (sidebar, header, route guard) tidak perlu fetch berulang.
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [pengguna, setPengguna] = useState<Pengguna | null>(null);
  const [memuat, setMemuat] = useState(true);

  // Efek pemeriksaan sesi awal ditulis inline (bukan memanggil fungsi useCallback dari luar)
  // dengan flag "dibatalkan" ala rekomendasi React untuk data fetching di useEffect, supaya
  // setState tidak pernah dipanggil setelah komponen unmount (mis. navigasi cepat).
  useEffect(() => {
    let dibatalkan = false;

    async function periksaSesiAwal() {
      try {
        const penggunaAktif = await ambilPenggunaAktif();
        if (!dibatalkan) {
          setPengguna(penggunaAktif);
        }
      } catch {
        // Wajar terjadi bila belum login/token invalid/expired - bukan error yang perlu ditampilkan.
        if (!dibatalkan) {
          setPengguna(null);
        }
      } finally {
        if (!dibatalkan) {
          setMemuat(false);
        }
      }
    }

    void periksaSesiAwal();
    return () => {
      dibatalkan = true;
    };
  }, []);

  // muatUlang tetap diekspor lewat konteks agar komponen lain bisa memicu pemeriksaan ulang
  // sesi secara manual (mis. setelah reconnect), terpisah dari efek pemeriksaan awal di atas.
  const muatUlang = useCallback(async () => {
    try {
      const penggunaAktif = await ambilPenggunaAktif();
      setPengguna(penggunaAktif);
    } catch {
      setPengguna(null);
    } finally {
      setMemuat(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      // State lokal tetap dibersihkan meski request logout ke backend gagal (mis. jaringan
      // putus), supaya pengguna tidak terjebak dalam tampilan seolah masih login.
      setPengguna(null);
    }
  }, []);

  const nilai = useMemo<NilaiKonteksAuth>(
    () => ({ pengguna, memuat, aturPengguna: setPengguna, muatUlang, logout }),
    [pengguna, memuat, muatUlang, logout],
  );

  return <KonteksAuth.Provider value={nilai}>{children}</KonteksAuth.Provider>;
}

export function useAuth(): NilaiKonteksAuth {
  const konteks = useContext(KonteksAuth);
  if (!konteks) {
    throw new Error("useAuth harus dipakai di dalam <AuthProvider>.");
  }
  return konteks;
}
