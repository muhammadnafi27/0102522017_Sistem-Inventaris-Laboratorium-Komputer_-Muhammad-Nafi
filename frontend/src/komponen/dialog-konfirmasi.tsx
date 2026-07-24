"use client";

import { IkonPeringatan } from "@/komponen/ikon";
import { Modal } from "@/komponen/modal";

interface PropsDialogKonfirmasi {
  terbuka: boolean;
  judul: string;
  pesan: string;
  labelKonfirmasi?: string;
  sedangProses?: boolean;
  onKonfirmasi: () => void;
  onBatal: () => void;
}

// Dialog konfirmasi untuk aksi destruktif (mis. hapus barang). Tombol konfirmasi berwarna
// merah dan dinonaktifkan selama proses berlangsung (PRD: delete wajib confirmation dialog).
export function DialogKonfirmasi({
  terbuka,
  judul,
  pesan,
  labelKonfirmasi = "Hapus",
  sedangProses = false,
  onKonfirmasi,
  onBatal,
}: PropsDialogKonfirmasi) {
  return (
    <Modal terbuka={terbuka} judul={judul} onTutup={onBatal} lebar="md">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-delete">
          <IkonPeringatan className="h-6 w-6" />
        </div>
        <p className="pt-1.5 text-sm text-foreground">{pesan}</p>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button
          type="button"
          onClick={onBatal}
          disabled={sedangProses}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onKonfirmasi}
          disabled={sedangProses}
          className="rounded-md bg-delete px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-60"
        >
          {sedangProses ? "Memproses..." : labelKonfirmasi}
        </button>
      </div>
    </Modal>
  );
}
