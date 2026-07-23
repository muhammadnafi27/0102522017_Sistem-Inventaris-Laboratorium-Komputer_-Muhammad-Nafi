import { Request } from 'express';

// Struktur data payload yang akan disimpan di dalam JWT
export interface UserPayload {
  id: number;
  nama: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
}

// Memperluas tipe Express Request agar mengenali properti user yang disuntikkan oleh middleware
export interface AppRequest extends Request {
  user?: UserPayload;
}
