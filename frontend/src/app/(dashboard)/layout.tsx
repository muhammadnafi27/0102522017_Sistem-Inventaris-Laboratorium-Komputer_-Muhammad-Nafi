"use client";

import React from 'react';
import { useAuth } from '../../konteks/KonteksAutentikasi';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, keluar } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat profil...</div>;
  }

  // Fallback (seharusnya ditangani oleh middleware, tapi ini pencegahan ganda)
  if (!user) {
    router.push('/masuk');
    return null;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Sidebar sederhana sementara */}
      <aside style={{ width: '256px', backgroundColor: '#FFFFFF', borderRight: '1px solid #E5E7EB', padding: '1rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2rem', fontWeight: 'bold', color: '#2563EB', fontSize: '1.25rem' }}>
          Sistem Inventaris
        </div>
        
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: '#EFF6FF', color: '#1E40AF', borderRadius: '0.375rem', fontWeight: 500 }}>
            Dashboard
          </div>
          {/* Menu lainnya akan ditambahkan di Tahap 5 */}
        </nav>

        <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '1rem', marginTop: '1rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontWeight: 'bold', color: '#111827' }}>{user.nama}</div>
            <div style={{ fontSize: '0.875rem', color: '#6B7280' }}>Role: {user.role}</div>
          </div>
          <button 
            onClick={keluar}
            style={{ width: '100%', padding: '0.5rem', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
          >
            Keluar
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}
