-- ============================================
-- Supabase Schema Update v4 (Pimpinan Without Kompi)
-- ============================================

-- Ubah kolom satuan menjadi nullable, karena pimpinan tidak tergabung dalam kompi manapun
ALTER TABLE users ALTER COLUMN satuan DROP NOT NULL;
