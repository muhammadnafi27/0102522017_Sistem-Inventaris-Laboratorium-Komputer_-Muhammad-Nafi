"use client";

import React, { useState } from 'react';
import { panggilApi } from '../../../layanan-api/panggil-api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Tipe respons spesifik untuk endpoint register
interface RegisterResponse {
  sukses: boolean;
  pesan?: string;
}

export default function HalamanDaftar() {
  const router = useRouter();
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validasi di frontend sebelum mengirim ke server
    if (password.length < 8) {
      setError('Password minimal 8 karakter');
      return;
    }

    setLoading(true);

    try {
      const respons = await panggilApi<RegisterResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nama: nama.trim(), email: email.trim(), password }),
      });

      if (respons.sukses) {
        router.push('/masuk');
      } else {
        setError(respons.pesan ?? 'Gagal mendaftar. Coba lagi.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan jaringan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.halaman}>
      <div style={styles.kartu}>
        <h1 style={styles.judul}>Daftar Akun Baru</h1>
        <p style={styles.subjudul}>Inventaris Laboratorium Komputer</p>

        {error && (
          <div role="alert" style={styles.pesanError}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={styles.grupInput}>
            <label htmlFor="nama" style={styles.label}>Nama Lengkap</label>
            <input
              id="nama"
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              required
              disabled={loading}
              autoComplete="name"
              placeholder="Nama lengkap Anda"
              style={styles.input}
            />
          </div>

          <div style={styles.grupInput}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
              placeholder="nama@contoh.com"
              style={styles.input}
            />
          </div>

          <div style={styles.grupInput}>
            <label htmlFor="password" style={styles.label}>
              Password
              <span style={styles.petunjuk}> (minimal 8 karakter)</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              disabled={loading}
              autoComplete="new-password"
              placeholder="Buat password yang kuat"
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.tombol, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Sekarang'}
          </button>
        </form>

        <p style={styles.tautan}>
          Sudah punya akun?{' '}
          <Link href="/masuk" style={styles.linkBiru}>Login di sini</Link>
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  halaman: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#F0F4FF',
    padding: '1rem',
  },
  kartu: {
    padding: '2.5rem',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(37, 99, 235, 0.12)',
    width: '100%',
    maxWidth: '420px',
  },
  judul: {
    color: '#1E40AF',
    textAlign: 'center' as const,
    marginBottom: '0.25rem',
    fontSize: '1.5rem',
    fontWeight: 700,
  },
  subjudul: {
    color: '#6B7280',
    textAlign: 'center' as const,
    marginBottom: '2rem',
    fontSize: '0.875rem',
  },
  pesanError: {
    color: '#DC2626',
    backgroundColor: '#FEF2F2',
    border: '1px solid #FECACA',
    padding: '0.75rem 1rem',
    borderRadius: '6px',
    marginBottom: '1.25rem',
    fontSize: '0.875rem',
  },
  grupInput: {
    marginBottom: '1.25rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#374151',
    fontWeight: 500,
    fontSize: '0.875rem',
  },
  petunjuk: {
    color: '#9CA3AF',
    fontWeight: 400,
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid #D1D5DB',
    borderRadius: '6px',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box' as const,
    transition: 'border-color 0.2s',
  },
  tombol: {
    width: '100%',
    padding: '0.8rem',
    backgroundColor: '#2563EB',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    marginTop: '0.5rem',
    transition: 'background-color 0.2s',
  },
  tautan: {
    textAlign: 'center' as const,
    marginTop: '1.5rem',
    color: '#6B7280',
    fontSize: '0.875rem',
  },
  linkBiru: {
    color: '#2563EB',
    textDecoration: 'none',
    fontWeight: 500,
  },
};
