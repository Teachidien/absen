'use client';
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import {
    Users, Search, Activity,
    Filter, UserPlus, XCircle, Trash2, ChevronDown
} from 'lucide-react';
import Swal from 'sweetalert2';
import PersonnelFormModal from './components/PersonnelFormModal';

const SATUAN_ORDER = ['Kompi A', 'Kompi B', 'Kompi C', 'Kompi Markas', 'Banpur'];

const SATUAN_LOGOS = {
    'Kompi A': '/logos/kompi-a-alpha.png',
    'Kompi B': '/logos/kompi-b-alpha.png',
    'Kompi C': '/logos/kompi-c-alpha.png',
    'Kompi Markas': '/logos/kompi-markas-alpha.png',
    'Kompi Bantuan': '/logos/banpur-alpha.png'
};

export default function DaftarPersonel() {
    const [personnel, setPersonnel] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedSatuan, setSelectedSatuan] = useState('Semua');
    const [expandedKompi, setExpandedKompi] = useState(new Set([SATUAN_ORDER[0]]));

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setCurrentUser(JSON.parse(userStr));
    }, []);

    const isAnggota = currentUser?.role === 'anggota';

    useEffect(() => {
        async function fetchPersonnel() {
            setLoading(true);
            try {
                const { data: users, error } = await supabase.from('users').select('*').neq('role', 'admin');
                if (!error && users?.length > 0) {
                    setPersonnel(users);
                } else {
                    setPersonnel([
                        { id: '1', name: 'Prada Budi', nrp: '312019', pangkat: 'Prada', satuan: 'Kompi A' },
                        { id: '2', name: 'Kopda Santoso', nrp: '312020', pangkat: 'Kopda', satuan: 'Kompi A' },
                        { id: '3', name: 'Letda Tiar', nrp: '312021', pangkat: 'Letda', satuan: 'Kompi M' },
                        { id: '4', name: 'Serka Agus', nrp: '312022', pangkat: 'Serka', satuan: 'Kompi B' },
                        { id: '5', name: 'Pratu Doni', nrp: '312023', pangkat: 'Pratu', satuan: 'Kompi C' },
                        { id: '6', name: 'Praka Ahmad', nrp: '312024', pangkat: 'Praka', satuan: 'Banpur' },
                    ]);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setTimeout(() => setLoading(false), 400);
            }
        }
        fetchPersonnel();
    }, []);

    const satuan_options = ['Semua', ...SATUAN_ORDER];

    // Filter first by search + satuan
    const filtered = personnel.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.nrp.includes(searchQuery);
        const matchesSatuan = selectedSatuan === 'Semua' || p.satuan === selectedSatuan;
        return matchesSearch && matchesSatuan;
    });

    // Group by satuan
    const groupedBySatuan = useMemo(() => {
        const groups = {};
        filtered.forEach(p => {
            const key = p.satuan || 'Lainnya';
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });
        return Object.keys(groups)
            .sort((a, b) => {
                const ai = SATUAN_ORDER.indexOf(a);
                const bi = SATUAN_ORDER.indexOf(b);
                if (ai === -1 && bi === -1) return a.localeCompare(b);
                if (ai === -1) return 1;
                if (bi === -1) return -1;
                return ai - bi;
            })
            .map(key => ({ satuan: key, members: groups[key] }));
    }, [filtered]);

    const toggleKompi = (satuan) => {
        setExpandedKompi(prev => {
            const next = new Set(prev);
            if (next.has(satuan)) next.delete(satuan);
            else next.add(satuan);
            return next;
        });
    };

    const expandAll = () => setExpandedKompi(new Set(groupedBySatuan.map(g => g.satuan)));
    const collapseAll = () => setExpandedKompi(new Set());

    const handleSavePersonnel = async (data) => {
        setLoading(true);
        setIsModalOpen(false);
        try {
            const payload = data.id
                ? { id: data.id, name: data.name, nrp: data.nrp, pangkat: data.pangkat, satuan: data.satuan }
                : { name: data.name, nrp: data.nrp, pangkat: data.pangkat, satuan: data.satuan };

            const { data: savedData, error } = await supabase.from('users').upsert(payload).select().single();
            if (error) throw error;

            if (data.id) {
                setPersonnel(prev => prev.map(p => p.id === data.id ? savedData : p));
                Swal.fire({ title: 'Diperbarui', text: 'Data personel berhasil diubah.', icon: 'success', customClass: { popup: 'glass-swal' } });
            } else {
                setPersonnel(prev => [...prev, savedData]);
                Swal.fire({ title: 'Ditambahkan', text: 'Personel baru berhasil didaftarkan.', icon: 'success', customClass: { popup: 'glass-swal' } });
            }
        } catch (err) {
            Swal.fire({ title: 'Gagal', text: err.message || 'Terjadi kesalahan.', icon: 'error', customClass: { popup: 'glass-swal' } });
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePersonnel = (id, name) => {
        Swal.fire({
            title: 'Hapus Personel?',
            text: `Hapus ${name} dari sistem?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal',
            customClass: { popup: 'glass-swal' }
        }).then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    const { error } = await supabase.from('users').delete().eq('id', id);
                    if (error) throw error;
                    setPersonnel(prev => prev.filter(p => p.id !== id));
                    Swal.fire({ title: 'Dihapus', icon: 'success', customClass: { popup: 'glass-swal' } });
                } catch (err) {
                    Swal.fire({ title: 'Gagal', text: 'Gagal menghapus data.', icon: 'error', customClass: { popup: 'glass-swal' } });
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="flex-1 flex flex-col p-3 lg:p-8 relative min-h-screen">

            {/* Header */}
            <header className="flex items-center justify-between mb-4 px-1 pt-14 lg:pt-4">
                <div>
                    <h2 className="text-xl lg:text-3xl font-black text-white text-glow leading-tight">Manajemen Personel</h2>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium mt-0.5">
                        <Users size={11} className="text-emerald-400" />
                        <span>{personnel.length} personel aktif</span>
                    </div>
                </div>
                {!isAnggota && (
                    <button
                        onClick={() => { setModalData(null); setIsModalOpen(true); }}
                        className="flex bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 lg:px-6 lg:py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 items-center gap-2 active:scale-95"
                    >
                        <UserPlus size={14} />
                        <span className="hidden sm:inline">Tambah</span>
                    </button>
                )}
            </header>

            {/* Search */}
            <div className="relative mb-3 px-1">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari nama atau NRP..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all font-medium"
                />
            </div>

            {/* Filter satuan — collapsible chip on mobile */}
            <div className="mb-3 px-1">
                <button
                    onClick={() => setFilterOpen(!filterOpen)}
                    className="xl:hidden w-full flex items-center justify-between px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[9px] font-black uppercase tracking-widest"
                >
                    <span className="flex items-center gap-2"><Filter size={12} /> Filter: <span className="text-emerald-400">{selectedSatuan}</span></span>
                    {filterOpen ? <ChevronDown size={13} className="rotate-180" /> : <ChevronDown size={13} />}
                </button>
                <div className={`${filterOpen ? 'flex' : 'hidden'} xl:flex flex-wrap gap-1.5 mt-2 xl:mt-0`}>
                    {satuan_options.map(b => (
                        <button
                            key={b}
                            onClick={() => { setSelectedSatuan(b); setFilterOpen(false); }}
                            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${selectedSatuan === b
                                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            {b}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="glass-card rounded-[2rem] flex flex-col overflow-hidden flex-1">
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[200px]">
                        <Activity className="w-8 h-8 text-emerald-400 animate-spin" />
                        <p className="text-slate-400 font-black text-[9px] tracking-widest uppercase animate-pulse">Memuat Data...</p>
                    </div>
                ) : (
                    <div className="flex-1 overflow-auto p-3" style={{ scrollbarWidth: 'none' }}>
                        {/* Expand/Collapse controls */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{groupedBySatuan.length} Kesatuan · {filtered.length} Personel</p>
                            <div className="flex gap-2">
                                <button onClick={expandAll} className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors">Buka Semua</button>
                                <span className="text-slate-700">·</span>
                                <button onClick={collapseAll} className="text-[9px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors">Tutup Semua</button>
                            </div>
                        </div>

                        {/* Accordion groups */}
                        <div className="flex flex-col gap-3">
                            {groupedBySatuan.map(({ satuan, members }) => {
                                const isOpen = expandedKompi.has(satuan);
                                return (
                                    <div key={satuan} className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
                                        {/* Header kompi */}
                                        <button
                                            onClick={() => toggleKompi(satuan)}
                                            className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden shadow-lg shadow-emerald-500/10 transition-transform duration-300 group-hover:scale-105">
                                                {SATUAN_LOGOS[satuan] ? (
                                                    <img src={SATUAN_LOGOS[satuan]} alt={satuan} className="w-full h-full object-contain p-1" />
                                                ) : (
                                                    <div className={`w-full h-full flex items-center justify-center transition-all ${isOpen ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500'}`}>
                                                        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-xs font-black text-white uppercase tracking-wide">{satuan}</p>
                                                <p className="text-[9px] text-slate-500 font-bold">{members.length} personel</p>
                                            </div>
                                            <span className="text-[9px] font-black bg-white/5 text-slate-400 px-2 py-1 rounded-lg shrink-0">{members.length}</span>
                                        </button>

                                        {/* Personel list */}
                                        {isOpen && (
                                            <div className="border-t border-white/5 p-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {members.map(p => (
                                                    <div key={p.id} className="group p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/[0.08] transition-all duration-300">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-base border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shrink-0">
                                                                {p.name.charAt(0)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-black text-white text-xs tracking-tight uppercase truncate">{p.name}</h4>
                                                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                                                    <span className="text-[9px] font-black bg-white/10 text-slate-400 px-1.5 py-0.5 rounded">{p.pangkat}</span>
                                                                    <span className="text-[9px] font-bold text-slate-500">{p.nrp}</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-1 shrink-0">
                                                                {!isAnggota && (
                                                                    <>
                                                                        <button
                                                                            onClick={() => { setModalData(p); setIsModalOpen(true); }}
                                                                            className="text-[9px] font-black text-emerald-400 hover:text-white bg-emerald-500/5 px-2.5 py-1.5 rounded-xl border border-emerald-500/10 hover:bg-emerald-500/20 transition-all"
                                                                        >
                                                                            Edit
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleDeletePersonnel(p.id, p.name)}
                                                                            className="p-1.5 text-rose-500/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                                                                        >
                                                                            <Trash2 size={13} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {groupedBySatuan.length === 0 && (
                                <div className="py-16 text-center">
                                    <XCircle className="w-10 h-10 text-slate-700 mx-auto mb-3 opacity-20" />
                                    <p className="text-slate-500 font-black uppercase tracking-widest text-[10px]">Tidak ada personel ditemukan</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <PersonnelFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={modalData}
                onSave={handleSavePersonnel}
            />
        </div>
    );
}
