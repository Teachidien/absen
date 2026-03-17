const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function check() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const urlMatch = env.match(/NEXT_PUBLIC_SUPABASE_URL=\"(.*?)\"/) || env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*?)$ /m);
        const keyMatch = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=\"(.*?)\"/) || env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*?)$ /m);
        
        const url = urlMatch ? urlMatch[1] : null;
        const key = keyMatch ? keyMatch[1] : null;

        if (!url || !key) {
            console.log('Error: Could not parse URL or Key from .env.local');
            return;
        }

        const supabase = createClient(url, key);
        
        console.log('Checking column reset_requested on table users...');
        const { data, error } = await supabase.from('users').select('id, reset_requested').limit(1);
        
        if (error) {
            console.log('API Error:', error.message);
            if (error.message.includes('column \"reset_requested\" does not exist') || error.message.includes('Could not find the \'reset_requested\' column')) {
                 console.log('\nRESULT: Column \"reset_requested\" is MISSING.');
                 console.log('Please run the following SQL in your Supabase Dashboard:');
                 console.log('---------------------------------------------------------');
                 console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_requested BOOLEAN DEFAULT false;');
                 console.log('---------------------------------------------------------');
            }
        } else {
            console.log('RESULT: SUCCESS! API sees the column.');
        }
    } catch (e) {
        console.log('Script error:', e.message);
    }
}
check();
