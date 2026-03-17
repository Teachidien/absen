-- Add role and password columns to the existing users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'anggota';
ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- Set a default password ('password123') and role for existing dummy data
UPDATE users SET password = 'password123', role = 'anggota' WHERE password IS NULL;

-- Make specific users Admin or Pimpinan for testing
UPDATE users SET role = 'admin' WHERE nrp = '312019'; -- Prada Budi is Admin
UPDATE users SET role = 'pimpinan' WHERE nrp = '312021'; -- Letda Tiar is Pimpinan
UPDATE users SET role = 'piket' WHERE nrp = '312020'; -- Kopda Santoso is Piket
