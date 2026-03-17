-- ============================================
-- Supabase Schema Update v2 (Registration Flow)
-- ============================================

-- 1. Tambahkan kolom status untuk membedakan akun yang disetujui dan yang belum
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- 2. Jadikan semua user yang sudah ada saat ini sebagai 'approved' agar bisa langsung login
UPDATE users SET status = 'approved' WHERE status = 'pending' OR status IS NULL;
