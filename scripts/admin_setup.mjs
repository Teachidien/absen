import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aitfgajpqinkcaaqevrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdGZnYWpwcWlua2NhYXFldnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDQ4NjUsImV4cCI6MjA4ODEyMDg2NX0.d5fq_We2QYFmIDg9i6N29ARS5Xmv_xXaOAcPI4W1SEA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const { data, error } = await supabase
    .from('users')
    .select('name, nrp, pangkat, satuan, role, password, created_at')
    .order('created_at', { ascending: true });

if (error) {
    console.error('ERROR:', error.message);
} else {
    console.log(JSON.stringify(data, null, 2));
}
