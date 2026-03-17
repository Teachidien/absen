-- ============================================
-- Supabase Schema Update v3 (Password Reset)
-- ============================================

-- 1. Tambahkan kolom reset_requested untuk menandakan user yang butuh reset password
ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_requested BOOLEAN DEFAULT false;
