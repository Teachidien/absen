'use client';

export default function StatCard({ label, value, color, icon }) {
    const colorMap = {
        emerald: 'bg-emerald-500/10 text-emerald-400',
        rose: 'bg-rose-500/10 text-rose-400',
        amber: 'bg-amber-500/10 text-amber-400',
        orange: 'bg-orange-500/10 text-orange-400',
        red: 'bg-red-500/10 text-red-400',
    };

    const ringColor = {
        emerald: 'bg-emerald-500/10',
        rose: 'bg-rose-500/10',
        amber: 'bg-amber-500/10',
        orange: 'bg-orange-500/10',
        red: 'bg-red-500/10',
    };

    return (
        <div className="glass-card p-3 lg:p-6 rounded-[1.5rem] lg:rounded-[2rem] hover:scale-[1.02] transition-all duration-500 relative group overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 lg:w-24 lg:h-24 ${ringColor[color]} rounded-full -mr-8 -mt-8 lg:-mr-12 lg:-mt-12 blur-2xl group-hover:scale-150 transition-transform duration-700`} />
            {/* Mobile: horizontal | Desktop: vertical */}
            <div className="relative z-10 flex items-center gap-2 lg:flex-col lg:items-start lg:gap-4">
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-xl ${colorMap[color]} flex items-center justify-center shrink-0 [&>svg]:w-4 [&>svg]:h-4 lg:[&>svg]:w-5 lg:[&>svg]:h-5`}>
                    {icon}
                </div>
                <div className="flex-1 lg:flex-none">
                    <h3 className="text-[8px] lg:text-[10px] font-black text-slate-500 tracking-[0.15em]">{label}</h3>
                    <p className="text-xl lg:text-3xl font-black text-white leading-none">
                        {value}
                        <span className="text-[9px] lg:text-xs text-slate-500 ml-0.5 font-medium italic">pers.</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
