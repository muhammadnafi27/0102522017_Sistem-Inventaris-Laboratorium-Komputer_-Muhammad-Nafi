import { z } from 'zod';

export const skemaKategori = z.object({
  nama_kategori: z
    .string({ message: 'Nama kategori wajib diisi dan harus berupa teks' })
    .trim()
    .min(2, { message: 'Nama kategori minimal 2 karakter' })
    .max(100, { message: 'Nama kategori maksimal 100 karakter' }),
});

export type TipeInputKategori = z.infer<typeof skemaKategori>;
