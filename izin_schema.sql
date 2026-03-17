-- ============================================
-- Tabel izin_requests untuk Sistem Pengajuan Izin
-- ============================================

CREATE TABLE IF NOT EXISTS izin_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tanggal DATE NOT NULL,
    alasan TEXT NOT NULL,
    foto_url TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status VARCHAR(20) DEFAULT 'menunggu', -- menunggu / disetujui / ditolak
    catatan_komandan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE izin_requests ENABLE ROW LEVEL SECURITY;

-- Policy: izinkan akses penuh via anon key
CREATE POLICY "Allow anon read/write access to izin_requests"
ON izin_requests FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Setup Supabase Storage Bucket untuk foto izin
-- ============================================
-- Jalankan ini di Supabase SQL Editor:

INSERT INTO storage.buckets (id, name, public)
VALUES ('izin-photos', 'izin-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Policy untuk storage bucket
CREATE POLICY "Allow public read izin-photos"
ON storage.objects FOR SELECT USING (bucket_id = 'izin-photos');

CREATE POLICY "Allow anon upload to izin-photos"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'izin-photos');
