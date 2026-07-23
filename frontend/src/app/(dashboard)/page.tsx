"use client";

import React from 'react';
import { useAuth } from '../../konteks/KonteksAutentikasi';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 style={{ color: '#111827', marginBottom: '1rem' }}>Ringkasan Inventaris</h1>
      <p style={{ color: '#374151' }}>
        Selamat datang kembali, <strong>{user?.nama}</strong>. Anda login sebagai <strong>{user?.role}</strong>.
      </p>
      
      <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '8px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#1E40AF', marginBottom: '1rem' }}>Status Uji Coba Tahap 2</h2>
        <ul style={{ paddingLeft: '1.5rem', color: '#374151', lineHeight: '1.75' }}>
          <li>Register valid membuat akun dengan hash password ✔️</li>
          <li>Login dengan kredensial yang benar berhasil menyimpan JWT di cookie ✔️</li>
          <li>Route middleware berjalan untuk memproteksi halaman ini ✔️</li>
          <li>Fitur CRUD barang/kategori belum aktif di antarmuka ini.</li>
        </ul>
      </div>
    </div>
  );
}
