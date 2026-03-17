/* eslint-disable @typescript-eslint/no-require-imports */
// run_migration.js - Run this to add role/password columns to the users table
// Usage: node run_migration.js
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://aitfgajpqinkcaaqevrn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdGZnYWpwcWlua2NhYXFldnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDQ4NjUsImV4cCI6MjA4ODEyMDg2NX0.d5fq_We2QYFmIDg9i6N29ARS5Xmv_xXaOAcPI4W1SEA';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runMigration() {
    console.log('Running migration...');

    // Try to update an existing user with password and role
    // This will fail if columns don't exist, and succeed after ALTER TABLE is run
    const { data, error } = await supabase
        .from('users')
        .update({ password: 'password123', role: 'anggota', reset_requested: false })
        .eq('id', '00000000-0000-0000-0000-000000000000')  // Non-existent UUID
        .select();

    if (error && error.message.includes('column')) {
        console.log('Columns dont exist yet. Please run update_schema_v3.sql in your Supabase SQL editor.');
        console.log('Copy the following SQL and paste into: https://supabase.com/dashboard/project/aitfgajpqinkcaaqevrn/sql/new');
        console.log('\n---SQL TO RUN---\n');
        const fs = require('fs');
        console.log(fs.readFileSync('./update_schema_v3.sql', 'utf8'));
    } else {
        console.log('Schema already has role/password columns!');
        // Now update existing users with default values
        const users = [
            { nrp: '312019', password: 'password123', role: 'admin' },
            { nrp: '312020', password: 'password123', role: 'piket' },
            { nrp: '312021', password: 'password123', role: 'pimpinan' },
            { nrp: '312022', password: 'password123', role: 'anggota' },
        ];

        for (const user of users) {
            const { error: updateErr } = await supabase
                .from('users')
                .update({ password: user.password, role: user.role })
                .eq('nrp', user.nrp);
            if (updateErr) {
                console.error(`Failed updating ${user.nrp}:`, updateErr.message);
            } else {
                console.log(`Updated ${user.nrp}: role=${user.role}`);
            }
        }
        console.log('Migration complete!');
    }
}

runMigration().catch(console.error);
