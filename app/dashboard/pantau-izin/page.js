'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, CheckCircle2, XCircle, Clock, Users, AlertCircle, Loader2, Filter } from 'lucide-react';
import Swal from 'sweetalert2';

const STATUS_FILTERS = ['Semua', 'menunggu', 'disetujui', 'ditolak'];

export default function PantauIzin() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('izin_requests')
            .select(`*, users(name, nrp, pangkat, satuan)`)
            .order('created_at', { ascending: false });

        if (!error) setRequests(data || []);
        setLoading(false);
    }, []);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const handleUpdateStatus = async (id, newStatus) => {
        const { value: catatan } = await Swal.fire({
            title: newStatus === 'disetujui' ? 'Setujui Izin?' : 'Tolak Izin?',
            input: 'textarea',
            inputLabel: 'Catatan untuk prajurit (opsional)',
            inputPlaceholder: 'Tulis catatan...',
            icon: newStatus === 'disetujui' ? 'question' : 'warning',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'disetujui' ? '#059669' : '#e11d48',
            confirmButtonText: newStatus === 'disetujui' ? 'Ya, Setujui' : 'Ya, Tolak',
            cancelButtonText: 'Batal',
            customClass: { popup: 'glass-swal' }
        });

        if (catatan === undefined) return; // Cancelled

        setUpdatingId(id);
        const { error } = await supabase
            .from('izin_requests')
            .update({ status: newStatus, catatan_komandan: catatan || null })
            .eq('id', id);

        if (error) {
            Swal.fire({ title: 'Gagal', text: error.message, icon: 'error', customClass: { popup: 'glass-swal' } });
        } else {
            setRequests(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, catatan_komandan: catatan || null } : r));
            Swal.fire({
                toast: true, position: 'top-end', icon: 'success',
                title: newStatus === 'disetujui' ? 'Izin Disetujui' : 'Izin Ditolak',
                showConfirmButton: false, timer: 2000, customClass: { popup: 'glass-swal' }
            });
        }
        setUpdatingId(null);
    };

    const filtered = requests.filter(r => filterStatus === 'Semua' || r.status === filterStatus);

    const stats = {
        menunggu: requests.filter(r => r.status === 'menunggu').length,
        disetujui: requests.filter(r => r.status === 'disetujui').length,
        ditolak: requests.filter(r => r.status === 'ditolak').length,
    };

    const getStatusBadge = (status) => {
        if (status === 'disetujui') return { label: 'Disetujui', cls: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', icon: <CheckCircle2 size={12} /> };
        if (status === 'ditolak') return { label: 'Ditolak', cls: 'text-rose-400 bg-rose-500/10 border-rose-500/30', icon: <XCircle size={12} /> };
        return { label: 'Menunggu', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/30', icon: <Clock size={12} /> };
    };

    return (
        <div className="flex-1 flex flex-col p-3 lg:p-8 relative min-h-screen">
            <header className="flex items-center justify-between mb-4 px-1 pt-14 lg:pt-4">
                <div>
                    <h2 className="text-xl lg:text-3xl font-black text-white text-glow leading-tight">Pantau Izin</h2>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium mt-0.5">
                        <Users size={11} className="text-amber-400" />
                        <span>Total: {requests.length} pengajuan</span>
                    </div>
                </div>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-3 gap-2 lg:gap-4 mb-4">
                {[
                    { label: 'Menunggu', value: stats.menunggu, color: 'amber', icon: <Clock size={20} /> },
                    { label: 'Disetujui', value: stats.disetujui, color: 'emerald', icon: <CheckCircle2 size={20} /> },
                    { label: 'Ditolak', value: stats.ditolak, color: 'rose', icon: <XCircle size={20} /> },
                ].map(s => (
                    <div key={s.label} className={`glass-card p-3 lg:p-5 rounded-2xl flex items-center gap-2 lg:gap-4 border-l-4 border-l-${s.color}-500/50`}>
                        <div className={`w-8 h-8 lg:w-11 lg:h-11 rounded-xl lg:rounded-2xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-400 [&>svg]:w-4 [&>svg]:h-4 lg:[&>svg]:w-5 lg:[&>svg]:h-5`}>{s.icon}</div>
                        <div>
                            <p className={`text-xl lg:text-2xl font-black text-${s.color}-400 leading-none`}>{s.value}</p>
                            <p className="text-[8px] lg:text-[10px] text-slate-500 uppercase tracking-widest font-bold">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="glass-morphism rounded-xl p-1 flex gap-1 mb-4 w-fit">
                {STATUS_FILTERS.map(f => (
                    <button
                        key={f}
                        onClick={() => setFilterStatus(f)}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black tracking-widest uppercase transition-all ${filterStatus === f ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-32">
                    <AlertCircle className="w-14 h-14 text-slate-700 opacity-20" />
                    <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Tidak ada pengajuan izin</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {filtered.map(r => {
                        const badge = getStatusBadge(r.status);
                        const user = r.users;
                        return (
                            <div key={r.id} className="glass-card p-4 lg:p-6 rounded-[1.75rem] space-y-4">
                                {/* Header prajurit */}
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-lg border border-emerald-500/20 shrink-0">
                                            {user?.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm uppercase tracking-tight">{user?.name || 'Tidak diketahui'}</p>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded">{user?.pangkat}</span>
                                                <span className="text-[9px] text-slate-500">{user?.nrp}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border whitespace-nowrap ${badge.cls}`}>
                                        {badge.icon} {badge.label}
                                    </span>
                                </div>

                                {/* Info izin */}
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Tanggal Izin</p>
                                        <p className="text-sm font-black text-white">{new Date(r.tanggal).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Alasan</p>
                                        <p className="text-sm text-slate-300 leading-relaxed">{r.alasan}</p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Diajukan</p>
                                        <p className="text-[10px] text-slate-400">{new Date(r.created_at).toLocaleString('id-ID')}</p>
                                    </div>
                                </div>

                                {/* Foto */}
                                {r.foto_url && (
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Filter size={10} /> Foto Bukti
                                        </p>
                                        {/* eslint-disable-next-line */}
                                        <img src={r.foto_url} alt="Foto bukti izin" className="w-full h-48 object-cover rounded-2xl border border-white/10" />
                                    </div>
                                )}

                                {/* Peta Lokasi */}
                                {r.latitude && r.longitude && (
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <MapPin size={10} /> Lokasi GPS — {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}
                                        </p>
                                        <iframe
                                            title={`Lokasi ${user?.name}`}
                                            width="100%"
                                            height="220"
                                            className="rounded-2xl border border-white/10"
                                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${r.longitude - 0.005},${r.latitude - 0.005},${r.longitude + 0.005},${r.latitude + 0.005}&layer=mapnik&marker=${r.latitude},${r.longitude}`}
                                        />
                                    </div>
                                )}

                                {/* Catatan komandan */}
                                {r.catatan_komandan && (
                                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                        <p className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest mb-1">Catatan Komandan</p>
                                        <p className="text-sm text-slate-300">{r.catatan_komandan}</p>
                                    </div>
                                )}

                                {/* Action buttons — hanya jika masih menunggu */}
                                {r.status === 'menunggu' && (
                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={() => handleUpdateStatus(r.id, 'disetujui')}
                                            disabled={updatingId === r.id}
                                            className="flex-1 py-3 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            {updatingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                                            Setujui
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(r.id, 'ditolak')}
                                            disabled={updatingId === r.id}
                                            className="flex-1 py-3 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            {updatingId === r.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                            Tolak
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
