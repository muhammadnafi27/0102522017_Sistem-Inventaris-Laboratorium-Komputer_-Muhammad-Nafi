import { z } from 'zod';

export const skemaBuatUser = z.object({
  nama: z
    .string({ message: 'Nama wajib diisi dan harus berupa teks' })
    .trim()
    .min(2, { message: 'Nama minimal 2 karakter' })
    .max(100, { message: 'Nama maksimal 100 karakter' }),
  email: z
    .string({ message: 'Email wajib diisi' })
    .trim()
    .toLowerCase()
    .email({ message: 'Format email tidak valid' })
    .max(150, { message: 'Email maksimal 150 karakter' }),
  password: z
    .string({ message: 'Password wajib diisi' })
    .min(8, { message: 'Password minimal 8 karakter' }),
  role: z.enum(['admin', 'operator', 'viewer'] as const, {
    message: 'Role harus berupa admin, operator, atau viewer',
  }),
});

export const skemaEditUser = z.object({
  nama: z
    .string({ message: 'Nama wajib diisi dan harus berupa teks' })
    .trim()
    .min(2, { message: 'Nama minimal 2 karakter' })
    .max(100, { message: 'Nama maksimal 100 karakter' }),
  email: z
    .string({ message: 'Email wajib diisi' })
    .trim()
    .toLowerCase()
    .email({ message: 'Format email tidak valid' })
    .max(150, { message: 'Email maksimal 150 karakter' }),
  role: z.enum(['admin', 'operator', 'viewer'] as const, {
    message: 'Role harus berupa admin, operator, atau viewer',
  }),
});

export const skemaResetPassword = z.object({
  password_baru: z
    .string({ message: 'Password baru wajib diisi' })
    .min(8, { message: 'Password baru minimal 8 karakter' }),
  konfirmasi_password: z
    .string({ message: 'Konfirmasi password wajib diisi' }),
}).refine((data) => data.password_baru === data.konfirmasi_password, {
  message: 'Konfirmasi password tidak cocok dengan password baru',
  path: ['konfirmasi_password'],
});

export type TipeBuatUser = z.infer<typeof skemaBuatUser>;
export type TipeEditUser = z.infer<typeof skemaEditUser>;
export type TipeResetPassword = z.infer<typeof skemaResetPassword>;
