'use client';
import { Search, Plus, RotateCcw } from 'lucide-react';

export default function ActionBar({ searchQuery, setSearchQuery, onMarkAllHadir, onUndoApel }) {
    return (
        <div className="glass-morphism rounded-2xl p-3 mb-4 flex flex-row gap-2 items-center border-l-4 border-l-emerald-500/50">
            <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={13} />
                <input
                    type="text"
                    placeholder="Cari NRP atau Nama..."
                    className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white/10 transition-all font-medium"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="flex gap-2 shrink-0">
                <button
                    onClick={onUndoApel}
                    className="w-10 h-10 bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 rounded-xl text-xs font-black transition-all flex items-center justify-center active:scale-95"
                    title="Batalkan Seluruh Absensi"
                >
                    <RotateCcw size={14} />
                </button>
                <button
                    onClick={onMarkAllHadir}
                    className="px-4 h-10 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black tracking-widest uppercase transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 active:scale-95"
                >
                    <Plus size={13} /> Mulai Apel
                </button>
            </div>
        </div>
    );
}
