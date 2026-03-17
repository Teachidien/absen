'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();

    useEffect(() => {
        // Arahkan langsung ke login
        router.replace('/login');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
            <div className="animate-pulse flex items-center gap-3 text-[#3F4E4F]">
                <div className="w-6 h-6 border-4 border-[#3F4E4F] border-t-[#D4A017] rounded-full animate-spin"></div>
                <span className="font-bold tracking-widest text-sm uppercase">Memuat Sistem...</span>
            </div>
        </div>
    );
}
