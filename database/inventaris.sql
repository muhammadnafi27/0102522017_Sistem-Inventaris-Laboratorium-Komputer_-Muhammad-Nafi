-- ============================================================================
-- Database Sistem Inventaris Laboratorium Komputer
-- Nama database : inventaris_laboratorium
-- DBMS          : MySQL / MariaDB (XAMPP)
-- Akses aplikasi: mysql2 dengan prepared statement, tanpa ORM
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+07:00';
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS inventaris_laboratorium;
CREATE DATABASE inventaris_laboratorium
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE inventaris_laboratorium;

-- Menyimpan kategori utama barang inventaris.
CREATE TABLE kategori_barang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    deskripsi VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_kategori_barang_nama UNIQUE (nama_kategori)
) ENGINE=InnoDB;

-- Menyimpan akun pengguna dan data reset password.
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nama VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL,
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

-- Menyimpan data barang dan menghubungkannya dengan kategori.
CREATE TABLE barang (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    kode_barang VARCHAR(50) NOT NULL,
    nama_barang VARCHAR(160) NOT NULL,
    kategori_id BIGINT UNSIGNED NOT NULL,
    kondisi ENUM('Baik', 'Perlu Perawatan', 'Rusak', 'Tidak Aktif') NOT NULL DEFAULT 'Baik',
    lokasi VARCHAR(120) NOT NULL,
    jumlah INT UNSIGNED NOT NULL DEFAULT 0,
    foto VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_barang_kode UNIQUE (kode_barang),
    CONSTRAINT fk_barang_kategori
        FOREIGN KEY (kategori_id)
        REFERENCES kategori_barang(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    INDEX idx_barang_nama (nama_barang),
    INDEX idx_barang_kategori (kategori_id),
    INDEX idx_barang_kondisi (kondisi),
    INDEX idx_barang_lokasi (lokasi),
    INDEX idx_barang_pencarian (kode_barang, nama_barang)
) ENGINE=InnoDB;

-- Menyimpan aktivitas penting untuk kebutuhan audit sederhana.
CREATE TABLE aktivitas_sistem (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    aksi VARCHAR(80) NOT NULL,
    entitas VARCHAR(80) NOT NULL,
    entitas_id BIGINT UNSIGNED NULL,
    detail VARCHAR(500) NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_aktivitas_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON UPDATE CASCADE
        ON DELETE SET NULL,
    INDEX idx_aktivitas_user (user_id),
    INDEX idx_aktivitas_entitas (entitas, entitas_id),
    INDEX idx_aktivitas_waktu (created_at)
) ENGINE=InnoDB;

-- Menambahkan enam kategori awal sesuai rancangan antarmuka.
INSERT INTO kategori_barang (nama_kategori, deskripsi) VALUES
('Komputer', 'Komputer desktop, workstation, dan server laboratorium.'),
('Monitor', 'Monitor komputer untuk kegiatan praktikum.'),
('Proyektor', 'Perangkat proyeksi untuk presentasi dan pembelajaran.'),
('Printer', 'Perangkat pencetak dokumen laboratorium.'),
('Jaringan', 'Router, switch, access point, dan perangkat jaringan.'),
('Aksesoris', 'Keyboard, mouse, kabel, headset, dan aksesori pendukung.');

-- Menambahkan tiga akun demo dengan password bcrypt cost 10.
-- Kredensial awal:
-- Admin              : admin@uai.ac.id / admin12345
-- Staff Universitas  : staff@uai.ac.id / staff12345
-- Muhammad Nafi      : nafiazka2003@gmail.com / Nafi12345
-- Catatan: email staff dinormalisasi menjadi staff@uai.ac.id agar valid.
INSERT INTO users (nama, email, password, role) VALUES
('Admin', 'admin@uai.ac.id', '$2b$10$UOzwu7IxdlKaFxtZ32IRr.Ouw3fXv07TyIlQ7hTen.GxC2yNzVKb2', 'admin'),
('Staff Universitas', 'staff@uai.ac.id', '$2b$10$5UKGzNyyar96bKx578/5GOPhDN2EUn61KuHPrX4chHoi2dSWpXG56', 'operator'),
('Muhammad Nafi', 'nafiazka2003@gmail.com', '$2b$10$TOKUmMSqM2kACQrqBAalruZyeHX9u0hyg.gtoN0bXQIHNZfxesjku', 'viewer');

-- Menambahkan sepuluh barang contoh untuk kebutuhan demonstrasi.
-- Nilai foto mengarah ke placeholder yang perlu tersedia pada folder upload backend.
INSERT INTO barang
(kode_barang, nama_barang, kategori_id, kondisi, lokasi, jumlah, foto)
VALUES
('PC-008', 'PC Desktop Core i5 Gen12', 1, 'Baik', 'Lab Komputer 3', 14, 'default-barang.png'),
('NET-002', 'Access Point Ubiquiti UniFi', 5, 'Baik', 'Lab Komputer 1', 5, 'default-barang.png'),
('PC-003', 'PC Desktop Core i5 Gen11', 1, 'Perlu Perawatan', 'Lab Komputer 2', 18, 'default-barang.png'),
('NET-005', 'Access Point TP-Link EAP225', 5, 'Baik', 'Lab Komputer 2', 4, 'default-barang.png'),
('PC-006', 'Server Rack Dell T140', 1, 'Baik', 'Ruang Server', 2, 'default-barang.png'),
('MON-005', 'Monitor LED 19 Inci AOC', 2, 'Perlu Perawatan', 'Lab Komputer 3', 14, 'default-barang.png'),
('NET-001', 'Switch 24 Port TP-Link', 5, 'Baik', 'Ruang Server', 6, 'default-barang.png'),
('PRJ-003', 'Proyektor Epson EB-X06', 3, 'Rusak', 'Lab Komputer 1', 2, 'default-barang.png'),
('PRN-002', 'Printer LaserJet HP M404dn', 4, 'Baik', 'Ruang Administrasi', 2, 'default-barang.png'),
('ACC-006', 'Keyboard dan Mouse Logitech', 6, 'Tidak Aktif', 'Gudang Perangkat', 10, 'default-barang.png');

-- Menambahkan aktivitas awal agar halaman aktivitas tidak kosong.
INSERT INTO aktivitas_sistem (user_id, aksi, entitas, entitas_id, detail, ip_address) VALUES
(1, 'LOGIN', 'auth', NULL, 'Admin melakukan login awal sistem.', '127.0.0.1'),
(1, 'CREATE', 'barang', 1, 'Menambahkan data awal PC-008.', '127.0.0.1'),
(2, 'UPDATE', 'barang', 3, 'Memperbarui kondisi PC-003 menjadi Perlu Perawatan.', '127.0.0.1');

SET FOREIGN_KEY_CHECKS = 1;

-- Ringkasan data setelah impor.
SELECT 'kategori_barang' AS tabel, COUNT(*) AS jumlah_data FROM kategori_barang
UNION ALL
SELECT 'barang', COUNT(*) FROM barang
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'aktivitas_sistem', COUNT(*) FROM aktivitas_sistem;
