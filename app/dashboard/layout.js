'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import Sidebar from './components/Sidebar';

export default function DashboardLayout({ children }) {
    const [authorized, setAuthorized] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (!userStr) {
            router.replace('/login');
            return;
        }

        const user = JSON.parse(userStr);
        // eslint-disable-next-line
        setAuthorized(true);

        // Basic RBAC: anggota can only access certain pages
        if (user.role === 'anggota' && pathname === '/dashboard') {
            router.replace('/dashboard/pendataan');
        }
    }, [router, pathname]);

    if (!authorized) {
        return (
            <div className="min-h-screen bg-[#0f1714] flex items-center justify-center">
                <div className="animate-pulse flex items-center gap-3 text-emerald-500">
                    <ShieldCheck className="w-8 h-8 animate-bounce" />
                    <span className="font-black tracking-widest text-sm uppercase">Memverifikasi Otoritas...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-transparent">
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                activePath={pathname}
            />
            <div className="flex-1 flex flex-col min-w-0 relative">
                {/* Mobile sidebar toggle */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="fixed top-4 left-4 z-40 lg:hidden w-9 h-9 glass-card rounded-xl flex items-center justify-center text-slate-400 hover:text-white border border-white/10 shadow-xl transition-all"
                >
                    <div className="space-y-1">
                        <div className={`w-4 h-0.5 bg-current transition-transform ${sidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
                        <div className={`w-4 h-0.5 bg-current transition-opacity ${sidebarOpen ? 'opacity-0' : ''}`} />
                        <div className={`w-4 h-0.5 bg-current transition-transform ${sidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
                    </div>
                </button>
                {children}
            </div>
        </div>
    );
}
