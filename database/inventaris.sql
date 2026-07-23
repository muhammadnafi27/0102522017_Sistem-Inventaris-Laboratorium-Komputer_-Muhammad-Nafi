-- ============================================================================
-- Database Sistem Inventaris Laboratorium Komputer
-- Siap diimpor melalui phpMyAdmin/XAMPP.
-- Backend wajib memakai mysql2 dan prepared statement untuk semua query input.
-- ============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS inventaris_laboratorium
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE inventaris_laboratorium;

DROP TABLE IF EXISTS barang;
DROP TABLE IF EXISTS kategori_barang;
DROP TABLE IF EXISTS users;

-- Menyimpan akun dan role pengguna aplikasi.
CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'viewer') NOT NULL DEFAULT 'viewer',
  reset_token VARCHAR(255) NULL,
  reset_token_expired_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_users_email UNIQUE (email),
  INDEX idx_users_role (role),
  INDEX idx_users_reset_token (reset_token)
) ENGINE=InnoDB;

-- Menyimpan kategori perangkat laboratorium.
CREATE TABLE kategori_barang (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_kategori_nama UNIQUE (nama_kategori)
) ENGINE=InnoDB;

-- Menyimpan data inventaris dan relasinya ke kategori.
CREATE TABLE barang (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  kode_barang VARCHAR(50) NOT NULL,
  nama_barang VARCHAR(150) NOT NULL,
  kategori_id BIGINT UNSIGNED NOT NULL,
  kondisi ENUM('Baik', 'Perlu Perawatan', 'Rusak', 'Dalam Perbaikan') NOT NULL DEFAULT 'Baik',
  lokasi VARCHAR(150) NOT NULL,
  jumlah INT UNSIGNED NOT NULL DEFAULT 1,
  foto VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT uq_barang_kode UNIQUE (kode_barang),
  CONSTRAINT fk_barang_kategori
    FOREIGN KEY (kategori_id) REFERENCES kategori_barang(id)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT chk_barang_jumlah CHECK (jumlah >= 0),
  INDEX idx_barang_nama (nama_barang),
  INDEX idx_barang_kategori (kategori_id),
  INDEX idx_barang_kondisi (kondisi),
  INDEX idx_barang_pencarian (kode_barang, nama_barang)
) ENGINE=InnoDB;

-- Password demo disimpan sebagai hash bcrypt cost 12.
-- Admin: admin@uai.ac.id / admin 12345
-- Operator: staff@uai.ac.id / staff12345
-- Viewer: nafiazka2003@gmail.com / Nafi12345
INSERT INTO users (nama, email, password, role) VALUES
  ('Admin', 'admin@uai.ac.id', '$2b$12$8nTTLeA3OV3EjPCR5IWKb.e40lhiN9SHmEEV8hSpttS4GGJYlz142', 'admin'),
  ('Staff Universitas', 'staff@uai.ac.id', '$2b$12$zI/67n8ocE81BPnL9IqqTupPtmMhC8cKmPq9gSq7VcQYaHKGXlse.', 'operator'),
  ('Muhammad Nafi', 'nafiazka2003@gmail.com', '$2b$12$gzUbfHm6pmBVqyZWwWwexu6n/HNDaYyqRWDGE3hTzC5DluZkjYG3S', 'viewer');

INSERT INTO kategori_barang (nama_kategori) VALUES
  ('Laptop'),
  ('Komputer Desktop'),
  ('Proyektor'),
  ('Router'),
  ('Perangkat Jaringan'),
  ('Aksesoris'),
  ('UPS'),
  ('Server'),
  ('Monitor');

INSERT INTO barang
  (kode_barang, nama_barang, kategori_id, kondisi, lokasi, jumlah, foto)
VALUES
  ('INV-LAB-001', 'Dell Latitude 5420', 1, 'Baik', 'Laboratorium Komputer A', 12, 'uploads/barang/dell-latitude-5420.jpg'),
  ('INV-LAB-002', 'Lenovo ThinkPad E14', 1, 'Perlu Perawatan', 'Ruang Teknisi', 4, 'uploads/barang/lenovo-thinkpad-e14.jpg'),
  ('INV-LAB-003', 'PC Rakitan Intel Core i5', 2, 'Baik', 'Laboratorium Komputer A', 20, 'uploads/barang/pc-intel-core-i5.jpg'),
  ('INV-LAB-004', 'PC Rakitan AMD Ryzen 5', 2, 'Rusak', 'Gudang Inventaris', 3, 'uploads/barang/pc-amd-ryzen-5.jpg'),
  ('INV-LAB-005', 'Epson EB-X500 Projector', 3, 'Baik', 'Laboratorium Komputer B', 2, 'uploads/barang/epson-eb-x500.jpg'),
  ('INV-LAB-006', 'BenQ MX550 Projector', 3, 'Perlu Perawatan', 'Ruang Multimedia', 1, 'uploads/barang/benq-mx550.jpg'),
  ('INV-LAB-007', 'MikroTik RB750Gr3', 4, 'Baik', 'Rak Jaringan Utama', 5, 'uploads/barang/mikrotik-rb750gr3.jpg'),
  ('INV-LAB-008', 'Cisco RV340 Router', 4, 'Baik', 'Laboratorium Jaringan', 2, 'uploads/barang/cisco-rv340.jpg'),
  ('INV-LAB-009', 'TP-Link TL-SG1024 Switch', 5, 'Baik', 'Rak Jaringan Utama', 3, 'uploads/barang/tplink-tl-sg1024.jpg'),
  ('INV-LAB-010', 'Ubiquiti UniFi Access Point', 5, 'Rusak', 'Ruang Teknisi', 2, 'uploads/barang/unifi-access-point.jpg');

SET FOREIGN_KEY_CHECKS = 1;

-- Ringkasan data awal setelah impor.
SELECT COUNT(*) AS jumlah_user FROM users;
SELECT COUNT(*) AS jumlah_kategori FROM kategori_barang;
SELECT COUNT(*) AS jumlah_barang FROM barang;
