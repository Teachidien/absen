'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { UserPlus, Fingerprint } from 'lucide-react';
import Swal from 'sweetalert2';

const PANGKAT_LIST = ['Prada', 'Pratu', 'Praka', 'Kopda', 'Koptu', 'Kopka', 'Serda', 'Sertu', 'Serka', 'Serma', 'Pelda', 'Peltu', 'Letda', 'Lettu', 'Kapten', 'Mayor', 'Letkol', 'Kolonel', 'Brigjen', 'Mayjen', 'Letjen', 'Jenderal'];
const SATUAN_LIST = ['Kompi A', 'Kompi B', 'Kompi C', 'Banpur', 'Kompi Markas'];
const ROLE_LIST = ['anggota', 'piket', 'pimpinan', 'admin'];

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        nrp: '',
        pangkat: 'Prada',
        satuan: 'Kompi A',
        password: '',
        role: 'anggota'
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Check if NRP exists
            const { data: existingUser } = await supabase.from('users').select('id').eq('nrp', formData.nrp).single();
            if (existingUser) {
                throw new Error('NRP ini sudah terdaftar.');
            }

            const { error } = await supabase
                .from('users')
                .insert([formData])
                .select()
                .single();

            if (error) throw error;

            Swal.fire({
                title: 'Registrasi Berhasil',
                text: 'Akun Anda telah dibuat. Silakan login.',
                icon: 'success',
                customClass: { popup: 'glass-swal' }
            }).then(() => {
                router.push('/login');
            });

        } catch (error) {
            Swal.fire({
                title: 'Registrasi Gagal',
                text: error.message,
                icon: 'error',
                customClass: { popup: 'glass-swal' }
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#111611]">
            <div className="absolute bottom-0 left-0 p-12 opacity-5 pointer-events-none transform rotate-12 -translate-x-1/4 translate-y-1/4">
                <Fingerprint size={600} className="text-emerald-500" />
            </div>

            <div className="glass-card relative w-full max-w-2xl rounded-[2.5rem] p-10 border border-white/10 shadow-2xl z-10">
                <div className="flex items-center gap-6 mb-10">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/40 -rotate-3">
                        <UserPlus className="text-white" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Daftar Akun Baru</h1>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sistem Basis Personel (SBA)</p>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nama Lengkap</label>
                        <input
                            type="text" required
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold"
                            placeholder="Contoh: M. Hasnawi"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">NRP / NIK</label>
                        <input
                            type="text" required
                            value={formData.nrp} onChange={e => setFormData({ ...formData, nrp: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold"
                            placeholder="Nomor NRP"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Kata Sandi (Password)</label>
                        <input
                            type="password" required
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold"
                            placeholder="Buat sandi yang kuat"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Pangkat</label>
                        <select value={formData.pangkat} onChange={e => setFormData({ ...formData, pangkat: e.target.value })} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold appearance-none">
                            {PANGKAT_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Satuan / Kompi</label>
                        <select value={formData.satuan} onChange={e => setFormData({ ...formData, satuan: e.target.value })} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold appearance-none">
                            {SATUAN_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>

                    <div className="col-span-1 md:col-span-2">
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Hak Akses (Role)</label>
                        <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold appearance-none">
                            {ROLE_LIST.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                        </select>
                        <p className="text-[10px] text-slate-500 mt-2 ml-1">Catatan: Pastikan Anda memilih hak akses yang sesuai dengan otoritas Anda.</p>
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-4">
                        <button
                            type="submit" disabled={loading}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-black tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan Data...' : 'Selesaikan Pendaftaran'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8">
                    <a href="/login" className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                        Sudah punya akun? Kembali ke Login
                    </a>
                </div>
            </div>
        </div>
    );
}
