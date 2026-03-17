-- ============================================
-- Supabase Schema untuk Aplikasi Absensi TNI
-- ============================================

-- 1. Tabel users (Daftar Personel)
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    nrp VARCHAR(255) NOT NULL UNIQUE,
    pangkat VARCHAR(255) NOT NULL,
    satuan VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabel attendances (Data Absensi)
CREATE TABLE attendances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    apel_type VARCHAR(255) NOT NULL, -- Contoh: 'Apel Pagi', 'Apel Siang', dsb.
    status VARCHAR(50) NOT NULL,     -- Contoh: 'hadir', 'izin', 'sakit', 'terlambat', 'alfa'
    description TEXT,                -- Alasan izin/sakit
    late_duration VARCHAR(50),       -- Durasi jika terlambat (contoh: '15 Menit')
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint agar satu personel hanya punya 1 status per jenis apel per hari
    UNIQUE(user_id, date, apel_type)
);

-- ============================================
-- Insert Data Dummy untuk Testing Awal (Opsional)
-- ============================================

INSERT INTO users (name, nrp, pangkat, satuan) VALUES 
('Prada Budi', '312019', 'Prada', 'Kompi A'),
('Kopda Santoso', '312020', 'Kopral Dua', 'Kompi A'),
('Letda Tiar', '312021', 'Letda', 'Kompi Markas'),
('Serka Agus', '312022', 'Sersan Kepala', 'Kompi Bantuan');

-- ============================================
-- Setup Row Level Security (RLS) - Basic
-- ============================================
-- Izinkan akses baca dan tulis penuh untuk testing via API keys (anon key)
-- Catatan: Di level produksi, atur kebijakan RLS yang lebih ketat sesuai auth.uid()

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read/write access to users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write access to attendances" ON attendances FOR ALL USING (true) WITH CHECK (true);
