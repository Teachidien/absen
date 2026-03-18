import { useState, useEffect } from 'react';
import { X, Save, User, Shield } from 'lucide-react';

const PANGKAT_LIST = ['Prada', 'Pratu', 'Praka', 'Kopda', 'Koptu', 'Kopka', 'Serda', 'Sertu', 'Serka', 'Serma', 'Pelda', 'Peltu', 'Letda', 'Lettu', 'Kapten', 'Mayor', 'Letkol', 'Kolonel', 'Brigjen', 'Mayjen', 'Letjen', 'Jenderal'];
const SATUAN_LIST = ['Kompi A', 'Kompi B', 'Kompi C', 'Kompi Markas', 'Kompi Bantuan'];

// Role yang bisa dipilih admin saat menambah personel (bukan anggota)
const ADMIN_ADD_ROLE_LIST = ['piket', 'pimpinan', 'admin'];
// Role lengkap untuk keperluan edit
const ROLE_LIST_FULL = ['anggota', 'piket', 'pimpinan', 'admin'];

// Role yang tidak tergabung dalam kompi manapun
const ROLES_OUTSIDE_KOMPI = ['piket', 'pimpinan', 'admin'];

export default function PersonnelFormModal({ isOpen, onClose, initialData, onSave, currentUser }) {
    // Saat admin tambah baru, default role = piket (bukan anggota)
    const defaultRole = currentUser?.role === 'admin' && !initialData ? 'piket' : 'anggota';

    const [formData, setFormData] = useState({
        name: '', nrp: '', pangkat: 'Prada', satuan: 'Kompi A', role: defaultRole, password: ''
    });

    // Apakah role ini di luar kompi (piket/pimpinan/admin)?
    const isOutsideKompi = ROLES_OUTSIDE_KOMPI.includes(formData.role);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(initialData);
            } else {
                // Saat modal dibuka untuk tambah baru, tentukan default role
                const defRole = currentUser?.role === 'admin' ? 'piket' : 'anggota';
                setFormData({ name: '', nrp: '', pangkat: 'Prada', satuan: 'Kompi A', role: defRole, password: '' });
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, initialData]);

    // Ketika role berubah: jika ke role luar kompi, hapus satuan; jika kembali ke anggota, restore satuan
    const handleRoleChange = (e) => {
        const newRole = e.target.value;
        const outsideKompi = ROLES_OUTSIDE_KOMPI.includes(newRole);
        setFormData({ ...formData, role: newRole, satuan: outsideKompi ? null : (formData.satuan || 'Kompi A') });
    };

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    // Daftar role yang ditampilkan di dropdown
    // Admin tambah baru: hanya piket/pimpinan/admin
    // Admin edit existing: semua role
    const roleOptions = (currentUser?.role === 'admin' && !initialData)
        ? ADMIN_ADD_ROLE_LIST
        : ROLE_LIST_FULL;

    // Label judul form
    const subtitle = (!initialData && currentUser?.role === 'admin')
        ? 'Tambah Akun Staf / Pimpinan'
        : initialData ? 'Edit Data Personel' : 'Tambah Personel Baru';

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
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOutsideKompi ? 'bg-violet-500/10' : 'bg-emerald-500/10'}`}>
                        {isOutsideKompi
                            ? <Shield className="text-violet-400" size={24} />
                            : <User className="text-emerald-400" size={24} />
                        }
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white">{subtitle}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                            {isOutsideKompi ? 'Akun Di Luar Kesatuan Kompi' : 'Form Registrasi Personel'}
                        </p>
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
                                disabled={!!initialData}
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

                    {/* Pangkat + Satuan + Role */}
                    <div className={`grid gap-4 ${isOutsideKompi ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
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

                        {/* Satuan hanya muncul jika role BUKAN piket/pimpinan/admin */}
                        {!isOutsideKompi && (
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

                        {/* Role hanya bisa diubah oleh admin */}
                        {currentUser?.role === 'admin' && (
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 px-1">Hak Akses</label>
                                <select
                                    value={formData.role || 'anggota'}
                                    onChange={handleRoleChange}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold appearance-none"
                                >
                                    {roleOptions.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Badge info untuk role luar kompi */}
                    {isOutsideKompi && (
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-[9px] font-black uppercase tracking-widest text-violet-400/80 bg-violet-500/10 border border-violet-500/20 px-3 py-1.5 rounded-xl">
                                ★ {formData.role === 'admin' ? 'Admin' : formData.role === 'pimpinan' ? 'Pimpinan' : 'Piket'} tidak tergabung dalam kompi
                            </span>
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`w-full mt-4 text-white rounded-2xl py-4 font-black tracking-widest uppercase text-sm flex items-center justify-center gap-3 transition-all hover:shadow-lg active:scale-95 ${isOutsideKompi
                            ? 'bg-violet-600 hover:bg-violet-700 hover:shadow-violet-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/20'
                        }`}
                    >
                        <Save size={18} /> {initialData ? 'Simpan Perubahan' : 'Daftarkan Personel'}
                    </button>
                </form>
            </div>
        </div>
    );
}
