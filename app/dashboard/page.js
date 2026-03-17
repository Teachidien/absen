'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle2, HeartPulse, ClipboardList, Clock, XCircle, RefreshCw, Activity, ChevronDown } from 'lucide-react';
import Swal from 'sweetalert2';
import Header from './components/Header';
import StatCard from './components/StatCard';
import ActionBar from './components/ActionBar';
import PersonnelCard from './components/PersonnelCard';
import AttendanceModal from './components/AttendanceModal';
import Link from 'next/link';

const APEL_TYPES = ['Apel Pagi', 'Apel Siang', 'Apel Malam', 'Mendadak'];
const SATUAN_ORDER = ['Kompi A', 'Kompi B', 'Kompi C', 'Kompi Markas', 'Banpur'];

const SATUAN_LOGOS = {
    'Kompi A': '/logos/kompi-a-alpha.png',
    'Kompi B': '/logos/kompi-b-alpha.png',
    'Kompi C': '/logos/kompi-c-alpha.png',
    'Kompi Markas': '/logos/kompi-markas-alpha.png',
    'Kompi Bantuan': '/logos/banpur-alpha.png'
};

export default function Dashboard() {
  const [personnel, setPersonnel] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [selectedApel, setSelectedApel] = useState('Apel Pagi');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedKompi, setExpandedKompi] = useState(new Set([SATUAN_ORDER[0]])); // kompi pertama terbuka

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) setCurrentUser(JSON.parse(userStr));
  }, []);

  const isAnggota = currentUser?.role === 'anggota';

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState({ userId: null, status: '', desc: '', duration: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    let mockPersonnel = [];

    try {
      const { data: users, error: errUsers } = await supabase.from('users').select('*').neq('role', 'admin');
      if (!errUsers && users?.length > 0) mockPersonnel = users;
      else {
        mockPersonnel = [
          { id: '1', name: 'Prada Budi', nrp: '312019', pangkat: 'Prada', satuan: 'Kompi A' },
          { id: '2', name: 'Kopda Santoso', nrp: '312020', pangkat: 'Kopda', satuan: 'Kompi A' },
          { id: '3', name: 'Letda Tiar', nrp: '312021', pangkat: 'Letda', satuan: 'Kompi M' },
          { id: '4', name: 'Serka Agus', nrp: '312022', pangkat: 'Serka', satuan: 'Kompi B' },
          { id: '5', name: 'Pratu Doni', nrp: '312023', pangkat: 'Pratu', satuan: 'Kompi C' },
          { id: '6', name: 'Praka Ahmad', nrp: '312024', pangkat: 'Praka', satuan: 'Banpur' },
          { id: '7', name: 'Serda Wawan', nrp: '312025', pangkat: 'Serda', satuan: 'Kompi A' },
        ];
      }

      const today = new Date().toISOString().split('T')[0];
      const { data: attData } = await supabase
        .from('attendances')
        .select('*')
        .eq('date', today)
        .eq('apel_type', selectedApel);

      setPersonnel(mockPersonnel);
      setAttendances(attData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => setLoading(false), 500); // Smooth loading feel
    }
  }, [selectedApel]);

  useEffect(() => { loadData(); }, [loadData]);

  const stats = useMemo(() => {
    const counts = { Hadir: 0, Sakit: 0, Izin: 0, Terlambat: 0, Alfa: 0 };
    attendances.forEach(att => {
      const s = att.status ? att.status.charAt(0).toUpperCase() + att.status.slice(1) : '';
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [attendances]);

  const filteredPersonnel = personnel.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.nrp.includes(searchQuery)
  );

  // Group by satuan
  const groupedBySatuan = useMemo(() => {
    const groups = {};
    filteredPersonnel.forEach(p => {
      const key = p.satuan || 'Lainnya';
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    // Sort keys by SATUAN_ORDER, then alphabetically for unknown ones
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
  }, [filteredPersonnel]);

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

  const handleStatusChange = async (userId, targetStatus) => {
    if (['sakit', 'izin', 'terlambat'].includes(targetStatus)) {
      setModalData({ userId, status: targetStatus, desc: '', duration: '' });
      setModalOpen(true);
    } else {
      await saveAttendance(userId, targetStatus, '', '');
    }
  };

  const saveAttendance = async (userId, status, desc, duration) => {
    const today = new Date().toISOString().split('T')[0];
    const existingIndex = attendances.findIndex(a => a.user_id === userId);

    let newAttData = [...attendances];
    const newEntry = { user_id: userId, date: today, apel_type: selectedApel, status, description: desc, late_duration: duration };

    if (existingIndex > -1) newAttData[existingIndex] = newEntry;
    else newAttData.push(newEntry);

    setAttendances(newAttData);

    try {
      await supabase.from('attendances').upsert({
        user_id: userId, date: today, apel_type: selectedApel, status: status,
        description: desc || null, late_duration: duration || null, updated_at: new Date().toISOString()
      }, { onConflict: 'user_id,date,apel_type' });

      Swal.fire({
        toast: true, position: 'top-end', icon: 'success',
        title: 'Tersimpan', showConfirmButton: false, timer: 1500,
        customClass: { popup: 'glass-swal' }
      });
    } catch (err) { console.error('Save error', err); }
  };

  const confirmModal = async () => {
    setModalOpen(false);
    await saveAttendance(modalData.userId, modalData.status, modalData.desc, modalData.duration);
  };

  const markAllHadir = () => {
    Swal.fire({
      title: 'Konfirmasi Apel',
      text: "Personel yang belum absen akan otomatis HADIR.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Mulai!',
      cancelButtonText: 'Batal',
      customClass: { popup: 'glass-swal' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];
        const unmarked = personnel.filter(p => !attendances.some(a => a.user_id === p.id));
        const upserts = unmarked.map(p => ({ user_id: p.id, date: today, apel_type: selectedApel, status: 'hadir' }));

        if (upserts.length > 0) {
          await supabase.from('attendances').upsert(upserts);
          setAttendances(prev => [...prev, ...upserts]);
        }
        setLoading(false);
        Swal.fire({ title: 'Berhasil', text: 'Absensi massal selesai.', icon: 'success', customClass: { popup: 'glass-swal' } });
      }
    });
  };

  const undoApel = () => {
    Swal.fire({
      title: 'Batal Apel?',
      text: `Anda yakin ingin menghapus seluruh rekaman absensi untuk ${selectedApel} pada hari ini? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48', // rose-600
      confirmButtonText: 'Ya, Batalkan Apel!',
      cancelButtonText: 'Kembali',
      customClass: { popup: 'glass-swal' }
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        const today = new Date().toISOString().split('T')[0];

        try {
          const { error } = await supabase
            .from('attendances')
            .delete()
            .eq('date', today)
            .eq('apel_type', selectedApel);

          if (error) throw error;

          setAttendances([]); // Clear local state fully for this apel type
          Swal.fire({ title: 'Dibatalkan', text: 'Seluruh data absensi telah dihapus.', icon: 'success', customClass: { popup: 'glass-swal' } });
        } catch (err) {
          console.error("Undo error", err);
          Swal.fire({ title: 'Gagal', text: 'Terjadi kesalahan saat menghapus data.', icon: 'error', customClass: { popup: 'glass-swal' } });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <main className="flex-1 flex flex-col p-3 lg:p-8 relative pt-14 lg:pt-8">
      <Header
        sidebarOpen={false}
        setSidebarOpen={() => { }}
        selectedApel={selectedApel}
        setSelectedApel={setSelectedApel}
        apelTypes={APEL_TYPES}
      />

      <div className="grid grid-cols-5 gap-2 lg:gap-4 mb-4 lg:mb-8">
        <StatCard label="HADIR" value={stats.Hadir} color="emerald" icon={<CheckCircle2 />} />
        <StatCard label="SAKIT" value={stats.Sakit} color="rose" icon={<HeartPulse />} />
        <StatCard label="IZIN" value={stats.Izin} color="amber" icon={<ClipboardList />} />
        <StatCard label="TELAT" value={stats.Terlambat} color="orange" icon={<Clock />} />
        <StatCard label="ALFA" value={stats.Alfa} color="red" icon={<XCircle />} />
      </div>

      {isAnggota ? (
        <div className="glass-morphism rounded-2xl p-3 mb-4 flex items-center gap-3 border-l-4 border-l-amber-500/50">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
            <ClipboardList className="text-amber-400" size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-white">Mode Lihat Saja</p>
            <p className="text-[9px] text-slate-400 font-medium">Tidak ada akses ubah data absensi.</p>
          </div>
          <Link href="/dashboard/izin" className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/40 border border-amber-500/30 text-amber-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shrink-0">
            Izin
          </Link>
        </div>
      ) : (
        <ActionBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onMarkAllHadir={markAllHadir}
          onUndoApel={undoApel}
        />
      )}

      <div className="flex-1 glass-card rounded-[2rem] p-3 lg:p-5 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full" />
              <RefreshCw className="w-12 h-12 text-emerald-400 animate-spin" />
            </div>
            <p className="text-slate-400 font-black text-xs tracking-widest uppercase animate-pulse">Syncing Database...</p>
          </div>
        ) : (
          <div className="w-full h-full overflow-auto" style={{ scrollbarWidth: 'none' }}>
            {/* Expand/Collapse controls */}
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{groupedBySatuan.length} Kesatuan · {filteredPersonnel.length} Personel</p>
              <div className="flex gap-2">
                <button onClick={expandAll} className="text-[9px] font-black text-emerald-400 hover:text-emerald-300 uppercase tracking-widest transition-colors">Buka Semua</button>
                <span className="text-slate-700">·</span>
                <button onClick={collapseAll} className="text-[9px] font-black text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors">Tutup Semua</button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {groupedBySatuan.map(({ satuan, members }) => {
                const isOpen = expandedKompi.has(satuan);
                const hadirCount = members.filter(m => attendances.some(a => a.user_id === m.id && a.status === 'hadir')).length;
                const absenCount = members.filter(m => attendances.some(a => a.user_id === m.id && a.status !== 'hadir')).length;
                const totalAbsen = members.length;
                const pctHadir = totalAbsen > 0 ? Math.round((hadirCount / totalAbsen) * 100) : 0;

                return (
                  <div key={satuan} className="rounded-2xl border border-white/10 overflow-hidden bg-white/[0.02]">
                    {/* Accordion Header */}
                    <button
                      onClick={() => toggleKompi(satuan)}
                      className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-all group"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden shadow-lg shadow-emerald-500/10">
                        {SATUAN_LOGOS[satuan] ? (
                           <img src={SATUAN_LOGOS[satuan]} alt={satuan} className="w-full h-full object-contain p-1 transform transition-transform group-hover:scale-110" />
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
                      {/* Mini stat badges */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {hadirCount > 0 && <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-md">{hadirCount} HDR</span>}
                        {absenCount > 0 && <span className="text-[8px] font-black bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded-md">{absenCount} TDK</span>}
                        {/* Progress bar */}
                        <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden hidden sm:block">
                          <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pctHadir}%` }} />
                        </div>
                      </div>
                    </button>

                    {/* Accordion Content */}
                    {isOpen && (
                      <div className="border-t border-white/5 p-3 grid grid-cols-1 xl:grid-cols-2 gap-3">
                        {members.map(p => (
                          <PersonnelCard
                            key={p.id}
                            person={p}
                            attendance={attendances.find(a => a.user_id === p.id)}
                            onStatusChange={handleStatusChange}
                            readOnly={isAnggota}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <AttendanceModal
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        modalData={modalData}
        setModalData={setModalData}
        onConfirm={confirmModal}
      />

      <div className="fixed bottom-0 right-0 p-10 pointer-events-none opacity-20">
        <Activity size={300} className="text-emerald-500 animate-pulse-slow stroke-[0.1]" />
      </div>
    </main>
  );
}
