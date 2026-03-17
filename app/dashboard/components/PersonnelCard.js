'use client';
import { ChevronRight } from 'lucide-react';

export default function PersonnelCard({ person, attendance, onStatusChange, readOnly = false }) {
    const activeStatus = attendance?.status || '';

    const statusButtons = [
        { v: 'hadir', label: 'HDR', color: 'emerald' },
        { v: 'sakit', label: 'SKT', color: 'rose' },
        { v: 'izin', label: 'IZN', color: 'amber' },
        { v: 'terlambat', label: 'TLT', color: 'orange' },
        { v: 'alfa', label: 'ALF', color: 'red' }
    ];

    const getStatusColorClass = (btn) => {
        if (activeStatus !== btn.v) {
            return readOnly
                ? 'bg-white/5 text-slate-600 border-white/5 cursor-not-allowed'
                : 'bg-white/5 text-slate-500 border-white/5 hover:bg-white/10 hover:text-slate-300';
        }
        const colors = {
            emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-lg shadow-emerald-500/10',
            rose: 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/10',
            amber: 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-500/10',
            orange: 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-lg shadow-orange-500/10',
            red: 'bg-red-500/20 text-red-400 border-red-500/40 shadow-lg shadow-red-500/10'
        };
        return colors[btn.color] + ' scale-[1.02]';
    };

    return (
        <div className="group p-4 lg:p-6 rounded-2xl lg:rounded-3xl bg-white/5 border border-white/5 hover:bg-white/[0.08] hover:border-white/10 transition-all duration-300 flex flex-col gap-3 lg:gap-6">
            <div className="flex items-center gap-3">
                <div className="w-11 h-11 lg:w-14 lg:h-14 rounded-xl lg:rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-black text-lg border border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-500 shrink-0">
                    {person.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-black text-white text-sm lg:text-lg leading-tight uppercase tracking-tight truncate">{person.name}</h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded uppercase">{person.pangkat}</span>
                        <span className="text-[9px] font-bold text-slate-500">{person.nrp}</span>
                        <span className="text-[9px] text-slate-500 hidden sm:inline">• {person.satuan}</span>
                    </div>
                </div>
                <button className="w-8 h-8 lg:w-10 lg:h-10 glass-morphism rounded-xl flex items-center justify-center text-slate-500 hover:text-white transition-colors shrink-0">
                    <ChevronRight size={15} />
                </button>
            </div>

            <div className="flex gap-1.5">
                {statusButtons.map(btn => (
                    <button
                        key={btn.v}
                        onClick={() => !readOnly && onStatusChange(person.id, btn.v)}
                        disabled={readOnly}
                        className={`flex-1 py-2 lg:py-3 px-0.5 rounded-xl text-[9px] lg:text-[10px] font-black tracking-widest uppercase transition-all duration-300 border ${getStatusColorClass(btn)}`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            {readOnly && (
                <p className="text-[8px] text-slate-600 uppercase tracking-widest text-center font-bold -mt-1">Hanya Lihat</p>
            )}

            {attendance?.description && (
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${activeStatus === 'sakit' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        {attendance.description}
                        {attendance.late_duration && <span className="text-emerald-400 font-bold ml-1">({attendance.late_duration})</span>}
                    </p>
                </div>
            )}
        </div>
    );
}
