'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Activity, Users, BookOpen, LogOut, FileText, MapPin } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Sidebar({ sidebarOpen, setSidebarOpen, activePath = '/dashboard' }) {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) setUser(JSON.parse(userStr));
    }, []);

    const allMenuItems = [
        { icon: <Activity className="w-4 h-4" />, label: 'Monitoring', href: '/dashboard', roles: ['admin', 'pimpinan', 'piket'] },
        { icon: <Users className="w-4 h-4" />, label: 'Personel', href: '/dashboard/pendataan', roles: ['admin', 'pimpinan', 'piket', 'anggota'] },
        { icon: <BookOpen className="w-4 h-4" />, label: 'Laporan', href: '/dashboard/laporan', roles: ['admin', 'pimpinan', 'anggota'] },
        { icon: <FileText className="w-4 h-4" />, label: 'Ajukan Izin', href: '/dashboard/izin', roles: ['anggota'] },
        { icon: <MapPin className="w-4 h-4" />, label: 'Pantau Izin', href: '/dashboard/pantau-izin', roles: ['admin', 'pimpinan'] },
    ];

    const menuItems = user ? allMenuItems.filter(i => i.roles.includes(user.role)) : [];

    const handleLogout = () => {
        Swal.fire({
            title: 'Keluar dari Sistem?',
            text: 'Anda akan logout dari SBA Digital.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal',
            customClass: { popup: 'glass-swal' }
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('user');
                router.push('/login');
            }
        });
    };

    const close = () => setSidebarOpen?.(false);

    return (
        <>
            {/* Backdrop overlay — tap untuk tutup sidebar di mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={close}
                />
            )}

            <aside className={`fixed lg:relative z-50 w-60 h-[calc(100vh-1.5rem)] m-3 glass-card rounded-[2rem] flex flex-col transition-all duration-400 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}`}>
                <div className="p-5 flex flex-col h-full">

                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/40 rotate-3">
                            <ShieldCheck className="text-white" size={18} />
                        </div>
                        <div>
                            <h1 className="text-base font-black tracking-tight text-white leading-tight">SBA Digital</h1>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Yonif 763/SBA</p>
                        </div>
                        {/* Tombol tutup sidebar di mobile */}
                        <button
                            onClick={close}
                            className="lg:hidden ml-auto p-1.5 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 space-y-1">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 ml-3">Main System</p>
                        {menuItems.map((item, i) => {
                            const isActive = activePath === item.href;
                            return (
                                <Link
                                    key={i}
                                    href={item.href}
                                    onClick={close}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${isActive ? 'nav-link-active shadow-lg shadow-emerald-500/10' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                >
                                    <span className={`${isActive ? 'text-emerald-400' : 'group-hover:text-emerald-400 transition-colors'}`}>{item.icon}</span>
                                    <span className="font-bold text-xs tracking-wide">{item.label}</span>
                                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User info */}
                    <div className="mt-auto pt-5 border-t border-white/5">
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 flex items-center justify-center font-black text-white text-sm shadow-lg shrink-0">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{user?.name || 'Loading...'}</p>
                                <p className="text-[9px] text-emerald-400 uppercase tracking-widest font-black">{user?.role || 'Guest'}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                title="Logout"
                                className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all shrink-0"
                            >
                                <LogOut size={15} />
                            </button>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
