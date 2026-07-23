import bcrypt from 'bcrypt';

// Tingkat kerumitan hashing sesuai dengan PRD (cost = 12)
const BCRYPT_COST = 12;

/**
 * Meng-hash password menggunakan bcrypt.
 * @param password Password teks mentah
 * @returns Hash password yang aman
 */
export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, BCRYPT_COST);
};

/**
 * Membandingkan password teks mentah dengan hash di database.
 * @param password Password mentah yang diinputkan pengguna
 * @param hash Hash dari database
 * @returns true jika cocok, false jika tidak
 */
export const bandingkanPassword = async (password: string, hash: string): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
