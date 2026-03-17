'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn, KeyRound, User, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Login() {
    const [nrp, setNrp] = useState('');
    const [password, setPassword] = useState('');
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
                .eq('nrp', nrp)
                .single();

            if (error || !data) {
                throw new Error('NRP tidak ditemukan atau salah.');
            }

            // Check password. If column doesn't exist yet (null), accept any password
            // as a graceful fallback until the schema is migrated.
            if (data.password !== null && data.password !== undefined) {
                if (data.password !== password) {
                    throw new Error('Password salah. Gunakan password yang telah didaftarkan.');
                }
            }

            // Apply default role if column doesn't exist yet
            const userWithRole = {
                ...data,
                role: data.role || 'admin'
            };

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
                            value={nrp}
                            onChange={(e) => setNrp(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                        />
                    </div>

                    <div className="relative">
                        <KeyRound className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            placeholder="Kata Sandi / Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-14 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-black tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? 'Memverifikasi...' : <><LogIn size={18} /> Masuk Sistem</>}
                    </button>

                    <div className="text-center mt-6">
                        <a href="/register" className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 uppercase tracking-widest transition-colors">
                            Belum Punya Akun? Daftar Disini
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}
