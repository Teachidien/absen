import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://aitfgajpqinkcaaqevrn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdGZnYWpwcWlua2NhYXFldnJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1NDQ4NjUsImV4cCI6MjA4ODEyMDg2NX0.d5fq_We2QYFmIDg9i6N29ARS5Xmv_xXaOAcPI4W1SEA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SATUAN_LIST = ['Kompi A', 'Kompi B', 'Kompi C', 'Banpur', 'Kompi Markas'];
const PANGKAT_LIST = ['Prada', 'Pratu', 'Praka', 'Kopda', 'Koptu', 'Kopka', 'Serda', 'Sertu', 'Serka'];

const namesPrefix = ['Ahmad', 'Budi', 'Chandra', 'Deni', 'Eko', 'Fajar', 'Gilang', 'Hadi', 'Iwan', 'Joko', 'Kevin', 'Luki', 'Maman', 'Rudi', 'Slamet', 'Tono', 'Wahyu', 'Yudi', 'Zainal', 'Andi', 'Reza', 'Surya', 'Rizky', 'Fikri', 'Tegar', 'Anton'];

function getRandomName() {
    const fn = namesPrefix[Math.floor(Math.random() * namesPrefix.length)];
    const ln = namesPrefix[Math.floor(Math.random() * namesPrefix.length)];
    return `${fn} ${ln}`;
}

async function insertDummyData() {
    const dummyUsers = [];
    let nrpBase = 500000;

    for (const satuan of SATUAN_LIST) {
        for (let i = 1; i <= 20; i++) {
            const pangkat = PANGKAT_LIST[Math.floor(Math.random() * PANGKAT_LIST.length)];
            const name = getRandomName();
            const nrp = (nrpBase++).toString();
            
            dummyUsers.push({
                name,
                nrp,
                pangkat,
                satuan,
                role: 'anggota',
                password: 'sba123'
            });
        }
    }

    console.log(`Menyiapkan ${dummyUsers.length} data dummy untuk di-insert...`);

    // Insert per batch if Supabase limits it, but 100 should be fine
    const { data, error } = await supabase
        .from('users')
        .insert(dummyUsers)
        .select();

    if (error) {
        console.error('ERROR inserting data:', error.message);
    } else {
        console.log(`Berhasil menambahkan ${data.length} anggota dummy.`);
    }
}

insertDummyData();
