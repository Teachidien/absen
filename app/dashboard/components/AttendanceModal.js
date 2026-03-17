'use client';
import { ClipboardList, Clock } from 'lucide-react';

export default function AttendanceModal({ modalOpen, setModalOpen, modalData, setModalData, onConfirm }) {
    if (!modalOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-3 sm:p-6">
            <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-xl" onClick={() => setModalOpen(false)} />
            <div className="w-full max-w-md glass-card rounded-[2rem] p-6 relative z-10 border border-white/10 shadow-2xl">
                <div className="mb-6 text-center">
                    <div className="w-14 h-14 bg-emerald-500/10 rounded-[1.5rem] flex items-center justify-center text-emerald-400 mx-auto mb-4 border border-emerald-500/20">
                        <ClipboardList size={24} />
                    </div>
                    <h3 className="text-xl font-black text-white text-glow">Laporan Khusus</h3>
                    <p className="text-slate-500 text-xs mt-1">Status <span className="text-emerald-400 font-black uppercase">{modalData.status}</span></p>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Detail / Alasan</label>
                        <textarea
                            className="w-full bg-white/5 border border-white/5 rounded-2xl p-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white/10 transition-all resize-none min-h-[100px] font-medium"
                            value={modalData.desc}
                            onChange={e => setModalData({ ...modalData, desc: e.target.value })}
                            placeholder="Ketik rincian alasan..."
                        />
                    </div>

                    {modalData.status === 'terlambat' && (
                        <div>
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Estimasi Waktu</label>
                            <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium"
                                    value={modalData.duration}
                                    onChange={e => setModalData({ ...modalData, duration: e.target.value })}
                                    placeholder="Contoh: 30 Menit"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button onClick={() => setModalOpen(false)} className="flex-1 py-3.5 rounded-2xl font-black text-xs text-slate-400 uppercase tracking-widest hover:bg-white/5 transition-all">Batal</button>
                        <button onClick={onConfirm} className="flex-[2] py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95">Kirim</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
