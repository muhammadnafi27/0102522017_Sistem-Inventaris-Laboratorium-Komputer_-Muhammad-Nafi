"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { IkonGambar, IkonTutup, IkonUnggah } from "@/komponen/ikon";
import { urlFotoBarang } from "@/utilitas/foto";

interface PropsAreaUploadFoto {
  // File yang sedang dipilih (null = belum memilih / tidak mengubah).
  file: File | null;
  onPilihFile: (file: File | null) => void;
  // Nama file foto lama (mode edit) untuk ditampilkan sebagai preview awal.
  fotoLama?: string | null;
}

const MAKS_UKURAN_MB = 2;
const TIPE_DIIZINKAN = ["image/jpeg", "image/png", "image/webp"];

// Area unggah foto dengan drag-and-drop + preview. Validasi tipe/ukuran dilakukan di sini
// untuk umpan balik cepat; backend tetap memvalidasi ulang saat submit (PRD: preview + fallback).
export function AreaUploadFoto({ file, onPilihFile, fotoLama }: PropsAreaUploadFoto) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [seret, setSeret] = useState(false);
  const [pesanError, setPesanError] = useState("");

  // Object URL preview diturunkan langsung dari file (tanpa state) agar tidak ada setState di
  // dalam efek; efek di bawah hanya membebaskan URL lama saat berganti untuk mencegah bocor memori.
  const urlPreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (urlPreview) URL.revokeObjectURL(urlPreview);
    };
  }, [urlPreview]);

  function validasiDanPilih(fileTerpilih: File | undefined) {
    setPesanError("");
    if (!fileTerpilih) return;

    if (!TIPE_DIIZINKAN.includes(fileTerpilih.type)) {
      setPesanError("Format harus JPG, PNG, atau WebP.");
      return;
    }
    if (fileTerpilih.size > MAKS_UKURAN_MB * 1024 * 1024) {
      setPesanError(`Ukuran foto maksimal ${MAKS_UKURAN_MB} MB.`);
      return;
    }
    onPilihFile(fileTerpilih);
  }

  function hapusPilihan() {
    onPilihFile(null);
    setPesanError("");
    if (inputRef.current) inputRef.current.value = "";
  }

  // Preview: prioritaskan file baru, jatuh ke foto lama (mode edit) bila belum memilih.
  const urlTampil = urlPreview ?? urlFotoBarang(fotoLama);

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setSeret(true);
        }}
        onDragLeave={() => setSeret(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSeret(false);
          validasiDanPilih(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={[
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors",
          seret ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary/50 hover:bg-slate-50",
        ].join(" ")}
      >
        {urlTampil ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={urlTampil}
              alt="Pratinjau foto"
              className="h-28 w-28 rounded-lg border border-slate-200 object-cover"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                hapusPilihan();
              }}
              aria-label="Hapus foto terpilih"
              className="absolute -right-2 -top-2 rounded-full bg-delete p-1 text-white shadow"
            >
              <IkonTutup className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <IkonGambar className="h-6 w-6" />
          </span>
        )}

        <div className="flex items-center gap-1.5 text-sm font-medium text-primary">
          <IkonUnggah className="h-4 w-4" />
          Seret &amp; lepas atau klik untuk pilih file
        </div>
        <p className="text-xs text-inactive">Format JPG/PNG/WebP · Maksimum {MAKS_UKURAN_MB} MB</p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => validasiDanPilih(e.target.files?.[0])}
        />
      </div>

      {pesanError && <p className="text-xs text-delete">{pesanError}</p>}
    </div>
  );
}
