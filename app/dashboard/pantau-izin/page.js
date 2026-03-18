'use client';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, CheckCircle2, XCircle, Clock, Users, AlertCircle, Loader2, Filter, X, ExternalLink, ZoomIn } from 'lucide-react';
import Swal from 'sweetalert2';

const STATUS_FILTERS = ['Semua', 'menunggu', 'disetujui', 'ditolak'];

export default function PantauIzin() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [updatingId, setUpdatingId] = useState(null);

    // Lightbox state
    const [lightboxUrl, setLightboxUrl] = useState(null);
    // Map modal state
    const [mapModal, setMapModal] = useState(null); // { lat, lng, name }

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

    // Tutup modal dengan tombol Escape
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Escape') {
                setLightboxUrl(null);
                setMapModal(null);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

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

        if (catatan === undefined) return;

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

                                {/* Foto — klik untuk buka full screen */}
                                {r.foto_url && (
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Filter size={10} /> Foto Bukti
                                            <span className="text-emerald-400/60 normal-case tracking-normal font-medium">(klik untuk perbesar)</span>
                                        </p>
                                        <div
                                            className="relative group cursor-zoom-in"
                                            onClick={() => setLightboxUrl(r.foto_url)}
                                        >
                                            {/* eslint-disable-next-line */}
                                            <img
                                                src={r.foto_url}
                                                alt="Foto bukti izin"
                                                className="w-full h-48 object-cover rounded-2xl border border-white/10 transition-all duration-300 group-hover:brightness-75"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
                                                    <ZoomIn size={16} className="text-white" />
                                                    <span className="text-white text-xs font-black uppercase tracking-widest">Perbesar</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Peta Lokasi — klik untuk buka modal peta besar */}
                                {r.latitude && r.longitude && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <MapPin size={10} /> Lokasi GPS — {r.latitude.toFixed(5)}, {r.longitude.toFixed(5)}
                                            </p>
                                            <span className="text-emerald-400/60 text-[9px] font-medium">(klik untuk perbesar)</span>
                                        </div>
                                        <div
                                            className="relative group cursor-pointer"
                                            onClick={() => setMapModal({ lat: r.latitude, lng: r.longitude, name: user?.name || 'Personel' })}
                                        >
                                            <iframe
                                                title={`Lokasi ${user?.name}`}
                                                width="100%"
                                                height="220"
                                                className="rounded-2xl border border-white/10 pointer-events-none"
                                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${r.longitude - 0.005},${r.latitude - 0.005},${r.longitude + 0.005},${r.latitude + 0.005}&layer=mapnik&marker=${r.latitude},${r.longitude}`}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl bg-black/30">
                                                <div className="bg-black/60 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center gap-2">
                                                    <ExternalLink size={16} className="text-white" />
                                                    <span className="text-white text-xs font-black uppercase tracking-widest">Perbesar Peta</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Catatan komandan */}
                                {r.catatan_komandan && (
                                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                        <p className="text-[9px] font-black text-emerald-500/80 uppercase tracking-widest mb-1">Catatan Komandan</p>
                                        <p className="text-sm text-slate-300">{r.catatan_komandan}</p>
                                    </div>
                                )}

                                {/* Action buttons */}
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

            {/* ======= LIGHTBOX FOTO ======= */}
            {lightboxUrl && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
                    onClick={() => setLightboxUrl(null)}
                >
                    <button
                        className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-10"
                        onClick={() => setLightboxUrl(null)}
                    >
                        <X size={20} />
                    </button>
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest absolute top-5 left-1/2 -translate-x-1/2">
                        Tekan ESC atau klik di luar untuk tutup
                    </div>
                    {/* eslint-disable-next-line */}
                    <img
                        src={lightboxUrl}
                        alt="Foto bukti izin - full size"
                        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* ======= MODAL PETA BESAR ======= */}
            {mapModal && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
                    onClick={() => setMapModal(null)}
                >
                    <div
                        className="relative w-full max-w-3xl rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header modal peta */}
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/95 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                                    <MapPin size={16} className="text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">Lokasi {mapModal.name}</p>
                                    <p className="text-[9px] text-slate-500 font-mono">{mapModal.lat.toFixed(6)}, {mapModal.lng.toFixed(6)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href={`https://www.google.com/maps?q=${mapModal.lat},${mapModal.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-3 py-1.5 rounded-xl transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <ExternalLink size={12} /> Google Maps
                                </a>
                                <button
                                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
                                    onClick={() => setMapModal(null)}
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                        {/* Peta besar */}
                        <iframe
                            title="Lokasi GPS Personel"
                            width="100%"
                            height="500"
                            src={`https://www.openstreetmap.org/export/embed.html?bbox=${mapModal.lng - 0.008},${mapModal.lat - 0.008},${mapModal.lng + 0.008},${mapModal.lat + 0.008}&layer=mapnik&marker=${mapModal.lat},${mapModal.lng}`}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
