"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { panggilApi } from '../layanan-api/panggil-api';
import { useRouter } from 'next/navigation';

// Tipe profil user yang diterima dari backend
export interface UserProfile {
  id: number;
  nama: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

// Tipe generik untuk respons API backend
interface ApiResponse<T> {
  sukses: boolean;
  pesan?: string;
  data?: T;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  masuk: (user: UserProfile) => void;
  keluar: () => Promise<void>;
  cekSesiAktif: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  /**
   * Memeriksa validitas sesi aktif dengan memanggil /auth/saya.
   * Dipanggil saat komponen pertama kali di-mount dan setelah event tertentu.
   * Dibungkus useCallback agar bisa disertakan di dependency array useEffect dengan aman.
   */
  const cekSesiAktif = useCallback(async (): Promise<void> => {
    try {
      const respons = await panggilApi<ApiResponse<UserProfile>>('/auth/saya');
      if (respons.sukses && respons.data) {
        setUser(respons.data);
      } else {
        setUser(null);
      }
    } catch {
      // Token tidak ada atau tidak valid — user dianggap belum login
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // Tidak ada dependensi eksternal

  useEffect(() => {
    // cekSesiAktif adalah operasi async yang dipanggil sekali saat mount.
    // setState di dalamnya berjalan secara async (setelah await), bukan synchronous.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cekSesiAktif();
  }, [cekSesiAktif]);

  const masuk = (profil: UserProfile): void => {
    setUser(profil);
    router.push('/dashboard');
  };

  const keluar = async (): Promise<void> => {
    try {
      await panggilApi('/auth/logout', { method: 'POST' });
    } catch (error) {
      // Tetap lanjutkan proses logout meski panggilan API gagal
      console.warn('[auth] Panggilan logout ke server gagal:', error);
    } finally {
      setUser(null);
      router.push('/masuk');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, masuk, keluar, cekSesiAktif }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook untuk mengakses konteks autentikasi.
 * Melempar error deskriptif jika digunakan di luar AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('[useAuth] Hook ini harus digunakan di dalam komponen yang dibungkus AuthProvider');
  }
  return context;
}
