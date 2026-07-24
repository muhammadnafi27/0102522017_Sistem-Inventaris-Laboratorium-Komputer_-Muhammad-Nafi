"use client";

import { BadgeKondisi } from "@/komponen/badge-kondisi";
import { FotoBarang } from "@/komponen/foto-barang";
import { Modal } from "@/komponen/modal";
import type { Barang } from "@/tipe/barang";
import { formatTanggal } from "@/utilitas/tanggal";

interface PropsModalDetailBarang {
  barang: Barang | null;
  onTutup: () => void;
}

function BarisDetail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium uppercase tracking-wide text-inactive">{label}</dt>
      <dd className="text-sm text-foreground">{children}</dd>
    </div>
  );
}

// Modal detail barang (read-only) - dapat diakses seluruh role.
export function ModalDetailBarang({ barang, onTutup }: PropsModalDetailBarang) {
  return (
    <Modal terbuka={barang !== null} judul="Detail Barang" onTutup={onTutup} lebar="lg">
      {barang && (
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="mx-auto h-40 w-40 shrink-0 sm:mx-0">
            <FotoBarang namaFile={barang.foto} namaBarang={barang.nama_barang} ukuran="lg" />
          </div>

          <dl className="grid flex-1 grid-cols-2 gap-4">
            <BarisDetail label="Kode Barang">
              <span className="font-semibold">{barang.kode_barang}</span>
            </BarisDetail>
            <BarisDetail label="Kondisi">
              <BadgeKondisi kondisi={barang.kondisi} />
            </BarisDetail>
            <div className="col-span-2">
              <BarisDetail label="Nama Barang">{barang.nama_barang}</BarisDetail>
            </div>
            <BarisDetail label="Kategori">{barang.nama_kategori}</BarisDetail>
            <BarisDetail label="Jumlah">{barang.jumlah}</BarisDetail>
            <BarisDetail label="Lokasi">{barang.lokasi}</BarisDetail>
            <BarisDetail label="Ditambahkan">{formatTanggal(barang.created_at)}</BarisDetail>
          </dl>
        </div>
      )}
    </Modal>
  );
}
