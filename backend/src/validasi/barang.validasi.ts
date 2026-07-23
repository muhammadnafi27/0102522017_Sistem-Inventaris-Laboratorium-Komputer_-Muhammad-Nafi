import { z } from 'zod';

export const skemaBarang = z.object({
  kode_barang: z
    .string({ message: 'Kode barang wajib diisi dan harus berupa teks' })
    .trim()
    .min(3, { message: 'Kode barang minimal 3 karakter' })
    .max(50, { message: 'Kode barang maksimal 50 karakter' }),
  nama_barang: z
    .string({ message: 'Nama barang wajib diisi dan harus berupa teks' })
    .trim()
    .min(3, { message: 'Nama barang minimal 3 karakter' })
    .max(150, { message: 'Nama barang maksimal 150 karakter' }),
  kategori_id: z.coerce
    .number({ message: 'Kategori ID wajib diisi dan harus berupa angka' })
    .positive({ message: 'Kategori ID tidak valid' }),
  kondisi: z.enum(['Baik', 'Perlu Perawatan', 'Rusak', 'Dalam Perbaikan'] as const, {
    message: 'Kondisi barang tidak valid',
  }),
  lokasi: z
    .string({ message: 'Lokasi wajib diisi dan harus berupa teks' })
    .trim()
    .min(3, { message: 'Lokasi minimal 3 karakter' })
    .max(150, { message: 'Lokasi maksimal 150 karakter' }),
  jumlah: z.coerce
    .number({ message: 'Jumlah wajib diisi dan harus berupa angka' })
    .int({ message: 'Jumlah harus bilangan bulat' })
    .nonnegative({ message: 'Jumlah tidak boleh negatif' }),
});

export type TipeInputBarang = z.infer<typeof skemaBarang>;
