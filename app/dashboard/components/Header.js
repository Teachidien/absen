'use client';
import { Activity } from 'lucide-react';

export default function Header({ selectedApel, setSelectedApel, apelTypes }) {
    return (
        <header className="flex items-center justify-between mb-4 lg:mb-8 px-1 lg:px-4 gap-2 pt-0">
            <div className="min-w-0 flex-1 lg:flex-none">
                <h2 className="text-lg lg:text-3xl font-black text-white text-glow leading-tight truncate">Live Feed</h2>
                <div className="flex items-center gap-1.5 text-slate-400 text-[10px] lg:text-xs font-medium">
                    <Activity size={11} className="text-emerald-400 animate-pulse shrink-0" />
                    <span className="hidden sm:inline truncate">Real-time persistence layer active</span>
                    <span className="sm:hidden">Real-time aktif</span>
                </div>
            </div>

            {/* Apel tabs — horizontal scroll on mobile */}
            <div className="flex glass-morphism p-1 rounded-xl lg:rounded-2xl gap-0.5 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
                {apelTypes.map(type => (
                    <button
                        key={type}
                        onClick={() => setSelectedApel(type)}
                        className={`px-2.5 lg:px-6 py-1.5 lg:py-2.5 rounded-lg lg:rounded-xl text-[9px] lg:text-[11px] font-black tracking-widest uppercase transition-all duration-500 whitespace-nowrap ${selectedApel === type ? 'bg-emerald-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                        {type.replace('Apel ', '').replace('Mendadak', 'Mendadak')}
                    </button>
                ))}
            </div>
        </header>
    );
}
