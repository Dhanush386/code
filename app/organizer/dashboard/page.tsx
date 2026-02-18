'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, Users, BookOpen, Trophy, Plus, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

const stats = [
    { label: 'Total Questions', value: '0', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Active Exams', value: '0', icon: LayoutDashboard, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Registered Teams', value: '0', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Submissions', value: '0', icon: Plus, color: 'text-orange-500', bg: 'bg-orange-50' },
];

export default function DashboardOverview() {
    return (
        <div className="space-y-10">
            {/* Welcome Section */}
            <div className="bg-white rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4">
                        WELCOME BACK, <span className="text-blue-600">ADMIN</span>
                    </h1>
                    <p className="text-gray-400 font-bold italic max-w-lg mb-8">
                        Manage your coding events with precision. Create questions, launch exams, and track real-time progress.
                    </p>
                    <div className="flex gap-4">
                        <Link href="/organizer/dashboard/questions/new" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-blue-700 transition-all flex items-center gap-2 group">
                            Create New Question <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        </Link>
                        <Link href="/organizer/dashboard/exams/new" className="bg-gray-100 text-gray-900 px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-gray-200 transition-all flex items-center gap-2">
                            Launch Exam <ArrowUpRight size={18} />
                        </Link>
                    </div>
                </div>

                {/* Abstract shapes */}
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-50" />
                <div className="absolute top-20 right-40 w-32 h-32 bg-indigo-50 rounded-full blur-2xl opacity-30" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg shadow-gray-200/30 group hover:border-blue-200 transition-all"
                    >
                        <div className={`${stat.bg} ${stat.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={28} />
                        </div>
                        <p className="text-[10px] font-black italic text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-4xl font-black italic tracking-tight text-gray-950">{stat.value}</h3>
                    </motion.div>
                ))}
            </div>

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-10">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black italic tracking-tight text-gray-950 uppercase">Live Leaderboard Preview</h3>
                    <Link href="/organizer/dashboard/leaderboard" className="text-sm font-black italic text-blue-600 uppercase tracking-widest hover:underline">View Full <ArrowUpRight size={14} className="inline" /></Link>
                </div>
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Trophy size={60} className="mb-4 opacity-10" />
                    <p className="font-bold italic uppercase tracking-widest text-xs">No active exam running</p>
                </div>
            </div>
        </div>
    );
}
