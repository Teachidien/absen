'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn, KeyRound, User, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Login() {
    const [formData, setFormData] = useState({
        nrp: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('nrp', formData.nrp)
                .single();

            if (error || !data) {
                throw new Error('NRP tidak ditemukan atau salah.');
            }

            // Check password. If column doesn't exist yet (null), accept any password
            // as a graceful fallback until the schema is migrated.
            if (data.password !== null && data.password !== undefined) {
                if (data.password !== formData.password) {
                    throw new Error('Password salah. Gunakan password yang telah didaftarkan.');
                }
            }

            // Apply default role and status if column doesn't exist yet
            const userWithRole = {
                ...data,
                role: data.role || 'anggota',
                status: data.status || 'approved'
            };

            if (userWithRole.status === 'pending') {
                throw new Error('Akun Anda masih dalam tinjauan. Silakan hubungi Admin atau pimpinan.');
            }

            // Save user session locally
            localStorage.setItem('user', JSON.stringify(userWithRole));

            Swal.fire({
                title: 'Login Berhasil',
                text: `Selamat datang, ${data.name}`,
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                customClass: { popup: 'glass-swal' }
            }).then(() => {
                router.push('/dashboard');
            });

        } catch (error) {
            Swal.fire({
                title: 'Akses Ditolak',
                text: error.message,
                icon: 'error',
                customClass: { popup: 'glass-swal' }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        const { value: nrp_input } = await Swal.fire({
            title: 'Lupa Password?',
            text: 'Masukkan NRP Anda untuk meminta reset password ke Admin.',
            icon: 'question',
            input: 'text',
            inputPlaceholder: 'NRP Anda',
            showCancelButton: true,
            confirmButtonText: 'Ajukan Reset',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#10b981',
            customClass: { popup: 'glass-swal', input: 'bg-white/10 text-white font-bold text-center mt-4 border-white/20 focus:ring-emerald-500' },
            inputValidator: (value) => {
                if (!value) return 'NRP tidak boleh kosong!';
            }
        });

        if (nrp_input) {
            Swal.fire({
                title: 'Memproses...',
                text: 'Mencari NRP Anda di sistem.',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
                customClass: { popup: 'glass-swal' }
            });

            try {
                // 1. Check if user exists
                const { data: user, error: userError } = await supabase
                    .from('users')
                    .select('id, name')
                    .eq('nrp', nrp_input)
                    .single();

                if (userError || !user) {
                    throw new Error('NRP tidak terdaftar di sistem.');
                }

                // 2. Set reset_requested flag
                const { error: updateError } = await supabase
                    .from('users')
                    .update({ reset_requested: true })
                    .eq('id', user.id);

                if (updateError) throw updateError;

                Swal.fire({
                    title: 'Berhasil Diajukan',
                    html: `Permintaan reset password untuk NRP <b>${nrp_input}</b> (${user.name}) telah dikirim.<br><br>Silakan tunggu persetujuan Admin/Pimpinan.`,
                    icon: 'success',
                    customClass: { popup: 'glass-swal' }
                });

            } catch (error) {
                Swal.fire({
                    title: 'Gagal',
                    text: error.message,
                    icon: 'error',
                    customClass: { popup: 'glass-swal' }
                });
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#111611]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform -rotate-12 translate-x-1/4 -translate-y-1/4">
                <img src="/logos/sba-alpha.png" alt="SBA Background" className="w-[800px] h-[800px] object-contain opacity-20" />
            </div>

            <div className="glass-card relative w-full max-w-md rounded-[2.5rem] p-10 border border-white/10 shadow-2xl z-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-28 h-28 mb-6 relative bg-white/5 rounded-3xl p-3 shadow-2xl shadow-emerald-500/20 border border-white/10">
                        <img src="/logos/sba-alpha.png" alt="SBA Logo" className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(45,212,191,0.6)]" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">SBA DIGITAL</h1>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Portal Otentikasi Personel</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type="text"
                            required
                            placeholder="Masukkan NRP..."
                            value={formData.nrp}
                            onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                        />
                    </div>

                    <div className="relative">
                        <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <div className="relative">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Kata Sandi</label>
                            <input
                                type={showPassword ? "text" : "password"} required
                                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold"
                                placeholder="Masukkan password Anda"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-[38px] text-slate-500 hover:text-emerald-500 transition-colors"
                            >
                                {showPassword ? <span className="text-xs font-bold uppercase">Sembunyikan</span> : <span className="text-xs font-bold uppercase">Lihat</span>}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-black tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Memverifikasi...' : <><LogIn size={18} /> Masuk Sistem</>}
                    </button>

                    <div className="flex flex-col items-center gap-4 mt-6">
                        <button type="button" onClick={handleForgotPassword} className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                            Lupa Password?
                        </button>
                        <a href="/register" className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                            Belum Punya Akun? Daftar Disini
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
