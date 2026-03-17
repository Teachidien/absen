
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700', '900'] });

export const metadata = {
    title: 'SBA Digital - Yonif 763/SBA',
    description: 'Modern Attendance System for Yonif 763/Sanetia Buerat Aksa',
};

export default function RootLayout({ children }) {
    return (
        <html lang="id" className="scroll-smooth">
            <body className={`${outfit.className} min-h-screen bg-[#0f172a] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200`}>
                {/* Global Background Elements */}
                <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px] animate-pulse-slow" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-rose-500/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
                </div>
                <main className="relative z-0">
                    {children}
                </main>
            </body>
        </html>
    );
}

