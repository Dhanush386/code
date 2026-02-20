'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    PlusCircle,
    BookOpen,
    Trophy,
    Users,
    Settings,
    LogOut,
    ChevronRight,
    Terminal,
    BarChart3
} from 'lucide-react';

const navItems = [
    { name: 'Overview', icon: LayoutDashboard, href: '/organizer/dashboard' },
    { name: 'Create Question', icon: PlusCircle, href: '/organizer/dashboard/questions/new' },
    { name: 'Question Bank', icon: BookOpen, href: '/organizer/dashboard/questions' },
    { name: 'Create Exam', icon: PlusCircle, href: '/organizer/dashboard/exams/new' },
    { name: 'Exam Bank', icon: BookOpen, href: '/organizer/dashboard/exams' },
    { name: 'Leaderboard', icon: Trophy, href: '/organizer/dashboard/leaderboard' },
    { name: 'Phasewise Marks', icon: BarChart3, href: '/organizer/dashboard/marks' },
    { name: 'Problem Tester', icon: Terminal, href: '/organizer/dashboard/tester' },
    { name: 'Participants', icon: Users, href: '/organizer/dashboard/participants' },
];

export default function OrganizerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const organizer = localStorage.getItem('organizer');
        if (!organizer) {
            router.push('/organizer/login');
        } else {
            setLoading(false);
        }
    }, [router]);

    const handleSignOut = () => {
        localStorage.removeItem('organizer');
        router.push('/organizer/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <p className="text-gray-400 font-bold italic uppercase tracking-widest animate-pulse">Verifying Credentials...</p>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col fixed h-full z-20 shadow-sm">
                <div className="p-8">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-xl text-white group-hover:rotate-12 transition-transform">
                            <PlusCircle size={24} />
                        </div>
                        <span className="text-xl font-black italic tracking-tighter">CODE RELAY</span>
                    </Link>
                    <p className="text-[10px] font-black text-gray-400 mt-2 uppercase tracking-widest italic ml-10">
                        Organizer Panel
                    </p>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-bold italic transition-all group ${isActive
                                    ? 'bg-blue-50 text-blue-600 shadow-sm'
                                    : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                                    <span>{item.name}</span>
                                </div>
                                {isActive && <ChevronRight size={16} className="text-blue-400" />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-50">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold italic text-red-400 hover:bg-red-50 hover:text-red-500 transition-all"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-72 min-h-screen relative">
                <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex items-center justify-between">
                    <h2 className="text-sm font-black italic text-gray-400 uppercase tracking-[0.2em]">
                        {navItems.find(i => i.href === pathname)?.name || 'Dashboard'}
                    </h2>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-xs font-black italic text-gray-900 leading-none">Admin Core</p>
                            <p className="text-[10px] font-bold text-blue-500 uppercase leading-none mt-1">Insightophia '26</p>
                        </div>
                        <div className="h-10 w-10 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-500 font-black italic">
                            AC
                        </div>
                    </div>
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
