import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// For admin ops, we ideally use service_role, but try anon first if RLS is fully open
const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    console.log('Running user status migration...');

    // 1. Try to read user data to make sure we're connected
    const { data: users, error: selectErr } = await supabase.from('users').select('id');
    if (selectErr) {
        console.error('Error connecting to users table:', selectErr);
        return;
    }
    
    console.log(`Found ${users.length} users. Applying 'approved' status...`);

    // 2. Since we cannot ALTER TABLE via the REST client directly, we will just start passing the 'status'
    // Actually, Supabase REST API doesn't support ALTER TABLE. We'll need to run this via SQL editor 
    // or perform an upsert if the column already exists (it won't).
    
    // We will instruct the user or use a direct SQL command if possible. But since I only have the REST client:
    console.log("WAIT! You must run this SQL query manually in Supabase SQL Editor:");
    console.log("  ALTER TABLE users ADD COLUMN status VARCHAR(50) DEFAULT 'pending';");
    console.log("  UPDATE users SET status = 'approved';");
    console.log("------------------------------------------");
}

migrate();
