'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BookOpen, Search, Printer, FileText, Calendar, Users, ChevronDown, Activity, AlertCircle } from 'lucide-react';

const APEL_TYPES = ['Apel Pagi', 'Apel Siang', 'Apel Malam'];

export default function Laporan() {
    const [filterType, setFilterType] = useState('daily');
    const [selectedApel, setSelectedApel] = useState('Apel Pagi');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchLaporan = async () => {
        setLoading(true);
        try {
            let query = supabase.from('attendances').select(`*, users (name, nrp, pangkat, satuan)`).eq('apel_type', selectedApel);
            if (filterType === 'daily') {
                query = query.eq('date', selectedDate);
            } else {
                const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
                const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
                query = query.gte('date', startDate).lte('date', endDate);
            }
            const { data, error } = await query;
            if (error) throw error;
            setAttendances(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLaporan(); /* eslint-disable-next-line */ }, [filterType, selectedApel, selectedDate, selectedMonth, selectedYear]);

    const groupedAttendances = attendances.reduce((acc, curr) => {
        const date = curr.date;
        if (!acc[date]) acc[date] = [];
        acc[date].push(curr);
        return acc;
    }, {});

    const sortedDates = Object.keys(groupedAttendances).sort((a, b) => new Date(b) - new Date(a));

    const StatusBadge = ({ status }) => {
        const styles = {
            hadir: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            sakit: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            izin: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
            terlambat: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
            alfa: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        };
        return (
            <span className={`px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-wider ${styles[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="flex-1 p-3 lg:p-10 overflow-y-auto print:p-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 pt-14 lg:pt-0 print:hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 lg:w-14 lg:h-14 bg-white/5 border border-white/10 rounded-xl lg:rounded-2xl flex items-center justify-center">
                        <BookOpen size={18} className="text-emerald-400 lg:hidden" />
                        <BookOpen size={26} className="text-emerald-400 hidden lg:block" />
                    </div>
                    <div>
                        <h1 className="text-lg lg:text-3xl font-black text-white tracking-tight leading-tight">Laporan Absensi</h1>
                        <p className="text-[10px] text-slate-400 mt-0.5 hidden sm:block">Rekapitulasi Kehadiran Personel Yonif 763/SBA</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-3 py-2 rounded-xl font-bold text-[10px] lg:text-sm transition-all">
                        <Printer size={13} /> <span className="hidden sm:inline">Cetak</span>
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-xl font-bold text-[10px] lg:text-sm transition-all shadow-lg shadow-emerald-600/20">
                        <FileText size={13} /> PDF
                    </button>
                </div>
            </div>

            {/* Print header */}
            <div className="hidden print:block text-center mb-6 border-b-2 border-black pb-4 text-black">
                <h1 className="text-2xl font-black uppercase">Laporan Absensi Personel Yonif 763/SBA</h1>
                <p className="font-bold">{selectedApel} — {filterType === 'daily' ? selectedDate : `Bulan ${selectedMonth} Tahun ${selectedYear}`}</p>
            </div>

            {/* Filter Section */}
            <div className="glass-card rounded-2xl p-3 lg:p-5 mb-4 print:hidden">
                <div className="flex flex-col gap-3">
                    {/* Row 1: Tipe harian/bulanan + apel tabs */}
                    <div className="flex gap-2 flex-wrap">
                        <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/5">
                            {[['daily', 'Harian'], ['monthly', 'Bulanan']].map(([v, l]) => (
                                <button key={v} onClick={() => setFilterType(v)}
                                    className={`flex items-center gap-1 px-3 py-2 rounded-xl font-bold text-[10px] transition-all ${filterType === v ? 'bg-emerald-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}>
                                    {v === 'daily' ? <Calendar size={11} /> : <Activity size={11} />} {l}
                                </button>
                            ))}
                        </div>
                        <div className="flex bg-white/5 p-0.5 rounded-xl border border-white/5 overflow-x-auto">
                            {APEL_TYPES.map(type => (
                                <button key={type} onClick={() => setSelectedApel(type)}
                                    className={`px-3 py-2 rounded-xl font-bold text-[10px] whitespace-nowrap transition-all ${selectedApel === type ? 'bg-white/10 text-white border border-white/10' : 'text-slate-400 hover:text-white'}`}>
                                    {type.replace('Apel ', '')}
                                </button>
                            ))}
                        </div>
                    </div>
                    {/* Row 2: Date/month picker */}
                    <div className="flex gap-2 items-end">
                        {filterType === 'daily' ? (
                            <div className="flex-1">
                                <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tanggal</label>
                                <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 font-bold" />
                            </div>
                        ) : (
                            <>
                                <div className="flex-1">
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Bulan</label>
                                    <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold appearance-none">
                                        {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                                            <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('id', { month: 'short' })}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Tahun</label>
                                    <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-3 py-2 text-xs text-white focus:outline-none font-bold appearance-none">
                                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(y => (
                                            <option key={y} value={y}>{y}</option>
                                        ))}
                                    </select>
                                </div>
                            </>
                        )}
                        <button onClick={fetchLaporan} className="h-9 w-9 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center transition-colors shrink-0">
                            <Search size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <div className="glass-card rounded-2xl p-10 flex flex-col items-center justify-center min-h-[200px]">
                    <div className="w-8 h-8 border-4 border-slate-700 border-t-emerald-500 rounded-full animate-spin mb-3" />
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Mengambil Data...</p>
                </div>
            ) : (
                <div className="glass-card rounded-2xl overflow-hidden">
                    {filterType === 'daily' && (
                        <div className="overflow-x-auto">
                            <table className="w-full print:text-black">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        {['Personel / NRP', 'Kesatuan', 'Status', 'Keterangan'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {attendances.length > 0 ? attendances.map(att => (
                                        <tr key={att.id} className="hover:bg-white/[0.02] transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-white text-xs">{att.users?.name}</div>
                                                <div className="text-slate-500 text-[10px]">{att.users?.nrp}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-300 text-xs">{att.users?.pangkat}</div>
                                                <div className="text-slate-500 text-[10px]">{att.users?.satuan}</div>
                                            </td>
                                            <td className="px-4 py-3"><StatusBadge status={att.status} /></td>
                                            <td className="px-4 py-3">
                                                <div className="text-xs text-slate-300">{att.description || '-'}</div>
                                                {att.late_duration && <div className="text-[10px] text-rose-400 font-bold">Telat: {att.late_duration}</div>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan="4" className="px-4 py-16 text-center">
                                            <Users size={36} className="mx-auto text-slate-600 mb-3 opacity-30" />
                                            <p className="text-slate-400 font-bold text-sm">Tidak ada data absensi.</p>
                                            <p className="text-slate-500 text-xs mt-1">Belum ada apel atau ubah filter tanggal.</p>
                                        </td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filterType === 'monthly' && (
                        <div className="flex flex-col">
                            {sortedDates.length > 0 ? sortedDates.map(date => {
                                const dayData = groupedAttendances[date];
                                const statHadir = dayData.filter(d => d.status === 'hadir').length;
                                const statAbsen = dayData.length - statHadir;
                                return (
                                    <details key={date} className="group border-b border-white/5 last:border-0" open>
                                        <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/[0.03] transition-colors list-none">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                                    <Calendar size={14} className="text-emerald-400" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white text-xs">{new Date(date).toLocaleDateString('id', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                                    <div className="flex gap-3 text-[10px] mt-0.5 font-bold">
                                                        <span className="text-emerald-400">Hadir: {statHadir}</span>
                                                        <span className="text-rose-400">Absen: {statAbsen}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-open:rotate-180 transition-transform shrink-0">
                                                <ChevronDown size={13} className="text-slate-400" />
                                            </div>
                                        </summary>
                                        <div className="border-t border-white/5">
                                            <table className="w-full">
                                                <thead className="bg-black/20">
                                                    <tr>
                                                        {['Personel', 'Status', 'Keterangan'].map(h => (
                                                            <th key={h} className="px-4 py-2 text-left text-[9px] font-black text-slate-500 uppercase tracking-widest">{h}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-white/5">
                                                    {dayData.map(att => (
                                                        <tr key={att.id} className="hover:bg-white/[0.02]">
                                                            <td className="px-4 py-2">
                                                                <div className="font-bold text-white text-xs">{att.users?.name}</div>
                                                                <div className="text-slate-500 text-[10px]">{att.users?.nrp} — {att.users?.satuan}</div>
                                                            </td>
                                                            <td className="px-4 py-2"><StatusBadge status={att.status} /></td>
                                                            <td className="px-4 py-2">
                                                                <div className="text-xs text-slate-300">{att.description || '-'}</div>
                                                                {att.late_duration && <div className="text-[10px] text-rose-400 font-bold">Telat: {att.late_duration}</div>}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </details>
                                );
                            }) : (
                                <div className="px-6 py-16 text-center">
                                    <AlertCircle size={36} className="mx-auto text-slate-600 mb-3 opacity-30" />
                                    <p className="text-slate-400 font-bold text-sm">Tidak ada rekap bulanan.</p>
                                    <p className="text-slate-500 text-xs mt-1">Coba sesuaikan filter bulan dan tahun.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
