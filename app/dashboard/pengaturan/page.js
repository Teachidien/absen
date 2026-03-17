'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Settings, Lock, ShieldCheck, User as UserIcon, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Pengaturan() {
    const [user, setUser] = useState(null);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (formData.newPassword !== formData.confirmPassword) {
            Swal.fire({
                title: 'Gagal',
                text: 'Password baru dan konfirmasi tidak cocok.',
                icon: 'error',
                customClass: { popup: 'glass-swal' }
            });
            return;
        }

        if (formData.newPassword.length < 6) {
            Swal.fire({
                title: 'Gagal',
                text: 'Password harus terdiri minimal 6 karakter.',
                icon: 'warning',
                customClass: { popup: 'glass-swal' }
            });
            return;
        }

        setLoading(true);

        try {
            // Verifikasi password lama
            const { data: currentUser, error: userError } = await supabase
                .from('users')
                .select('password')
                .eq('id', user.id)
                .single();

            if (userError) throw userError;

            if (currentUser.password !== null && currentUser.password !== formData.currentPassword) {
                throw new Error('Password lama yang Anda masukkan salah.');
            }

            // Update ke password baru
            const { error: updateError } = await supabase
                .from('users')
                .update({ password: formData.newPassword })
                .eq('id', user.id);

            if (updateError) throw updateError;

            // Perbarui cache local
            const updatedUser = { ...user, password: formData.newPassword };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);

            // Bersihkan form
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });

            Swal.fire({
                title: 'Berhasil',
                text: 'Password Anda telah berhasil diubah.',
                icon: 'success',
                customClass: { popup: 'glass-swal' }
            });

        } catch (error) {
            Swal.fire({
                title: 'Perubahan Gagal',
                text: error.message,
                icon: 'error',
                customClass: { popup: 'glass-swal' }
            });
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="flex-1 flex flex-col p-3 lg:p-8 relative min-h-screen">
            <header className="flex items-center gap-3 mb-8 pt-14 lg:pt-4 px-1">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Settings className="text-emerald-400" size={24} />
                </div>
                <div>
                    <h2 className="text-xl lg:text-3xl font-black text-white text-glow leading-tight">Pengaturan Akun</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Kelola Profil & Keamanan</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 x-1">
                {/* Profile Card */}
                <div className="lg:col-span-1 glass-card rounded-[2rem] p-6 flex flex-col items-center border border-white/5 relative overflow-hidden h-fit">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
                        <ShieldCheck size={200} />
                    </div>
                    
                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center font-black text-white text-4xl shadow-2xl shadow-emerald-500/30 mb-5 relative z-10 border border-white/20">
                        {user.name?.charAt(0)}
                    </div>
                    
                    <h3 className="text-xl font-black text-white text-center">{user.name}</h3>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                        <span className="text-[10px] font-black bg-white/10 text-slate-300 px-2 py-1 rounded border border-white/5">{user.pangkat}</span>
                        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded border border-emerald-500/20">{user.nrp}</span>
                    </div>
                    
                    <div className="w-full mt-8 space-y-3">
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Kesatuan</span>
                            <span className="text-xs font-bold text-white">{user.satuan}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hak Akses</span>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* Security Settings */}
                <div className="lg:col-span-2 glass-card rounded-[2rem] p-6 lg:p-8 border border-white/5 relative z-10">
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                            <Lock className="text-rose-400" size={18} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-white">Ubah Password</h3>
                            <p className="text-[10px] font-medium text-slate-400">Pastikan akun Anda selau menggunakan kata sandi yang kuat.</p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                        <div className="relative">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Password Lama</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? "text" : "password"} required
                                    value={formData.currentPassword}
                                    onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-3.5 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                                    placeholder="Masukkan password saat ini"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500 transition-colors"
                                >
                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Password Baru</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? "text" : "password"} required
                                    value={formData.newPassword}
                                    onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-3.5 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                                    placeholder="Minimal 6 karakter"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500 transition-colors"
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                        <div className="relative">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Konfirmasi Password Baru</label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? "text" : "password"} required
                                    value={formData.confirmPassword}
                                    onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-3.5 pr-12 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                                    placeholder="Ketik ulang password baru"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500 transition-colors"
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3.5 font-black tracking-widest uppercase text-xs flex items-center justify-center gap-2 transition-all hover:shadow-xl hover:shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? 'Memproses...' : 'Simpan Password Baru'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
