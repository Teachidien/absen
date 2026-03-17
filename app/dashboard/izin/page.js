'use client';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Camera, Send, Navigation, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, ImagePlus } from 'lucide-react';
import Swal from 'sweetalert2';

export default function HalamanIzin() {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [locLoading, setLocLoading] = useState(false);
    const [riwayat, setRiwayat] = useState([]);
    const [riwayatLoading, setRiwayatLoading] = useState(true);

    // Form fields
    const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
    const [alasan, setAlasan] = useState('');
    const [foto, setFoto] = useState(null);
    const [fotoPreview, setFotoPreview] = useState(null);
    const [lokasi, setLokasi] = useState(null); // { lat, lng }

    const fileInputRef = useRef(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const u = JSON.parse(userStr);
            setCurrentUser(u);
            fetchRiwayat(u.id);
        }
    }, []);

    const fetchRiwayat = async (userId) => {
        setRiwayatLoading(true);
        const { data } = await supabase
            .from('izin_requests')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        setRiwayat(data || []);
        setRiwayatLoading(false);
    };

    const handleAmbilLokasi = () => {
        if (!navigator.geolocation) {
            Swal.fire({ title: 'Tidak Didukung', text: 'Browser Anda tidak mendukung GPS.', icon: 'error', customClass: { popup: 'glass-swal' } });
            return;
        }
        setLocLoading(true);
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLokasi({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocLoading(false);
            },
            (err) => {
                setLocLoading(false);
                Swal.fire({ title: 'Gagal Ambil Lokasi', text: err.message || 'Izinkan akses lokasi di browser Anda.', icon: 'error', customClass: { popup: 'glass-swal' } });
            },
            { enableHighAccuracy: true, timeout: 15000 }
        );
    };

    const handleFotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            Swal.fire({ title: 'File Terlalu Besar', text: 'Maksimal ukuran foto adalah 5MB.', icon: 'warning', customClass: { popup: 'glass-swal' } });
            return;
        }
        setFoto(file);
        setFotoPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!foto) {
            Swal.fire({ title: 'Foto Wajib', text: 'Anda harus menyertakan foto saat mengajukan izin.', icon: 'warning', customClass: { popup: 'glass-swal' } });
            return;
        }
        if (!lokasi) {
            Swal.fire({ title: 'Lokasi Belum Diambil', text: 'Silakan tekan tombol "Ambil Lokasi Saya" terlebih dahulu.', icon: 'warning', customClass: { popup: 'glass-swal' } });
            return;
        }

        setLoading(true);
        try {
            // Upload foto ke Supabase Storage
            const ext = foto.name.split('.').pop();
            const fileName = `${currentUser.id}-${Date.now()}.${ext}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('izin-photos')
                .upload(fileName, foto, { cacheControl: '3600', upsert: false });

            if (uploadError) throw new Error('Gagal upload foto: ' + uploadError.message);

            const { data: publicUrl } = supabase.storage.from('izin-photos').getPublicUrl(uploadData.path);

            // Simpan ke tabel izin_requests
            const { error: insertError } = await supabase.from('izin_requests').insert({
                user_id: currentUser.id,
                tanggal,
                alasan,
                foto_url: publicUrl.publicUrl,
                latitude: lokasi.lat,
                longitude: lokasi.lng,
                status: 'menunggu'
            });

            if (insertError) throw insertError;

            Swal.fire({ title: 'Izin Diajukan!', text: 'Pengajuan izin Anda telah terkirim. Tunggu persetujuan komandan.', icon: 'success', customClass: { popup: 'glass-swal' } });

            // Reset form
            setAlasan('');
            setFoto(null);
            setFotoPreview(null);
            setLokasi(null);
            setTanggal(new Date().toISOString().split('T')[0]);
            fetchRiwayat(currentUser.id);
        } catch (err) {
            Swal.fire({ title: 'Gagal', text: err.message, icon: 'error', customClass: { popup: 'glass-swal' } });
        } finally {
            setLoading(false);
        }
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
                    <h2 className="text-xl lg:text-3xl font-black text-white text-glow leading-tight">Pengajuan Izin</h2>
                    <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium mt-0.5">
                        <MapPin size={11} className="text-amber-400" />
                        <span>Lokasi & foto wajib disertakan</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Form Pengajuan */}
                <div className="glass-card p-5 lg:p-8 rounded-[2rem]">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Send size={14} /> Form Pengajuan Baru
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Tanggal */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Tanggal Izin</label>
                            <input
                                type="date"
                                required
                                value={tanggal}
                                onChange={e => setTanggal(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-bold"
                            />
                        </div>

                        {/* Alasan */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Alasan Izin</label>
                            <textarea
                                required
                                rows={3}
                                placeholder="Jelaskan keperluan izin Anda..."
                                value={alasan}
                                onChange={e => setAlasan(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all font-medium resize-none"
                            />
                        </div>

                        {/* Upload Foto */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                Foto Bukti <span className="text-rose-400 ml-1">* Wajib</span>
                            </label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative cursor-pointer border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl transition-all overflow-hidden"
                            >
                                {fotoPreview ? (
                                    <div className="relative">
                                        {/* eslint-disable-next-line */}
                                        <img src={fotoPreview} alt="Preview foto izin" className="w-full h-48 object-cover rounded-2xl" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl">
                                            <p className="text-white text-xs font-black uppercase tracking-widest">Ganti Foto</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2 py-7 text-slate-500">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                            <ImagePlus size={22} className="text-emerald-500/50" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest">Tap untuk Upload Foto</p>
                                        <p className="text-[9px]">JPG, PNG — Maks. 5MB</p>
                                    </div>
                                )}
                                <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleFotoChange} className="hidden" />
                            </div>
                            {foto && <p className="text-[10px] text-emerald-400 mt-2 font-bold">✓ {foto.name}</p>}
                        </div>

                        {/* Ambil Lokasi GPS */}
                        <div>
                            <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                                Lokasi GPS <span className="text-rose-400 ml-1">* Wajib</span>
                            </label>
                            <button
                                type="button"
                                onClick={handleAmbilLokasi}
                                disabled={locLoading}
                                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${lokasi
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                                    }`}
                            >
                                {locLoading ? (
                                    <><Loader2 size={18} className="animate-spin" /> Mendeteksi Lokasi...</>
                                ) : lokasi ? (
                                    <><CheckCircle2 size={18} /> Lokasi Terdeteksi ✓</>
                                ) : (
                                    <><Navigation size={18} /> Ambil Lokasi Saya</>
                                )}
                            </button>
                            {lokasi && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-[10px] text-slate-500 font-mono text-center">
                                        {lokasi.lat.toFixed(6)}, {lokasi.lng.toFixed(6)}
                                    </p>
                                    <iframe
                                        title="Peta Lokasi"
                                        width="100%"
                                        height="200"
                                        className="rounded-2xl border border-white/10"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lokasi.lng - 0.005},${lokasi.lat - 0.005},${lokasi.lng + 0.005},${lokasi.lat + 0.005}&layer=mapnik&marker=${lokasi.lat},${lokasi.lng}`}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? <><Loader2 size={15} className="animate-spin" /> Mengirim...</> : <><Send size={15} /> Kirim Pengajuan Izin</>}
                        </button>
                    </form>
                </div>

                {/* Riwayat Pengajuan */}
                <div className="glass-card p-5 lg:p-8 rounded-[2rem] flex flex-col">
                    <h3 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                        <Clock size={14} /> Riwayat Pengajuan Saya
                    </h3>
                    {riwayatLoading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                        </div>
                    ) : riwayat.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
                            <AlertCircle className="w-12 h-12 text-slate-700 opacity-30" />
                            <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Belum ada pengajuan izin</p>
                        </div>
                    ) : (
                        <div className="space-y-4 overflow-auto custom-scrollbar flex-1">
                            {riwayat.map(item => {
                                const badge = getStatusBadge(item.status);
                                return (
                                    <div key={item.id} className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-black text-white text-sm">{new Date(item.tanggal).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.alasan}</p>
                                            </div>
                                            <span className={`flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border whitespace-nowrap ${badge.cls}`}>
                                                {badge.icon} {badge.label}
                                            </span>
                                        </div>
                                        {item.foto_url && (
                                            // eslint-disable-next-line
                                            <img src={item.foto_url} alt="Foto izin" className="w-full h-32 object-cover rounded-2xl border border-white/10" />
                                        )}
                                        {item.latitude && item.longitude && (
                                            <iframe
                                                title="Lokasi pengajuan"
                                                width="100%"
                                                height="140"
                                                className="rounded-2xl border border-white/10"
                                                src={`https://www.openstreetmap.org/export/embed.html?bbox=${item.longitude - 0.003},${item.latitude - 0.003},${item.longitude + 0.003},${item.latitude + 0.003}&layer=mapnik&marker=${item.latitude},${item.longitude}`}
                                            />
                                        )}
                                        {item.catatan_komandan && (
                                            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Catatan Komandan</p>
                                                <p className="text-xs text-slate-300">{item.catatan_komandan}</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
