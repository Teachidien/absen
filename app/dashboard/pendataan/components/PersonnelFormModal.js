import { useState, useEffect } from 'react';
import { X, Save, User } from 'lucide-react';

const PANGKAT_LIST = ['Prada', 'Pratu', 'Praka', 'Kopda', 'Koptu', 'Kopka', 'Serda', 'Sertu', 'Serka', 'Serma', 'Pelda', 'Peltu', 'Letda', 'Lettu', 'Kapten', 'Mayor', 'Letkol', 'Kolonel', 'Brigjen', 'Mayjen', 'Letjen', 'Jenderal'];
const SATUAN_LIST = ['Kompi A', 'Kompi B', 'Kompi C', 'Kompi Markas', 'Kompi Bantuan'];
const ROLE_LIST = ['anggota', 'piket', 'pimpinan', 'admin'];

export default function PersonnelFormModal({ isOpen, onClose, initialData, onSave, currentUser }) {
    const [formData, setFormData] = useState({ name: '', nrp: '', pangkat: 'Prada', satuan: 'Kompi A', role: 'anggota', password: '' });

    const isPimpinan = formData.role === 'pimpinan';

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // eslint-disable-next-line
                setFormData(initialData);
            } else {
                // eslint-disable-next-line
                setFormData({ name: '', nrp: '', pangkat: 'Prada', satuan: 'Kompi A', role: 'anggota', password: '' });
            }
        }
    }, [isOpen, initialData]);

    // Ketika role berubah ke pimpinan, hapus satuan
    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        setFormData({ ...formData, role: newRole, satuan: newRole === 'pimpinan' ? null : (formData.satuan || 'Kompi A') });
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
            <div className="glass-card relative w-full max-w-lg rounded-[2rem] p-8 border border-white/10 shadow-2xl animate-in fade-in zoom-in duration-300">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                        <User className="text-emerald-400" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">{initialData ? 'Edit Data Personel' : 'Tambah Personel Baru'}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Form Registrasi</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Nama Lengkap</label>
                        <input
                            type="text"
                            required
                            value={formData.name || ''}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                            placeholder="M. Hasnawi"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">NRP</label>
                            <input
                                type="text"
                                required
                                value={formData.nrp || ''}
                                onChange={(e) => setFormData({ ...formData, nrp: e.target.value })}
                                disabled={!!initialData} // Disallow changing NRP on edit
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold disabled:opacity-50"
                                placeholder="Ketik NRP..."
                            />
                        </div>
                        {!initialData && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Password</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.password || ''}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold"
                                    placeholder="Password Default"
                                />
                            </div>
                        )}
                    </div>
                    <div className={`grid gap-4 ${isPimpinan ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Pangkat</label>
                            <select
                                value={formData.pangkat || 'Prada'}
                                onChange={(e) => setFormData({ ...formData, pangkat: e.target.value })}
                                className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold appearance-none"
                            >
                                {PANGKAT_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        {!isPimpinan && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Satuan / Kompi</label>
                                <select
                                    value={formData.satuan || 'Kompi A'}
                                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold appearance-none"
                                >
                                    {SATUAN_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                        {currentUser?.role === 'admin' && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Hak Akses</label>
                                <select
                                    value={formData.role || 'anggota'}
                                    onChange={handleRoleChange}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold appearance-none"
                                >
                                    {ROLE_LIST.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                </select>
                            </div>
                        )}
                    </div>
                    {isPimpinan && (
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-amber-400/70 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
                                ★ Pimpinan tidak tergabung dalam kompi
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-4 font-black tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all hover:shadow-lg hover:shadow-emerald-500/20 active:scale-95"
                    >
                        <Save size={18} /> {initialData ? 'Simpan Perubahan' : 'Daftarkan Personel'}
                    </button>
                </form>
            </div>
        </div>
    );
}
