'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, BookOpen, Trophy, Plus, ArrowUpRight, Clock, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface Participant {
    id: string;
    teamName: string;
    collegeName: string;
    currentLevel: number;
    score: number;
    violationCount: number;
}

export default function DashboardOverview() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [stats, setStats] = useState([
        { label: 'Total Questions', value: '0', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50' },
        { label: 'Active Exams', value: '0', icon: LayoutDashboard, color: 'text-indigo-500', bg: 'bg-indigo-50' },
        { label: 'Registered Teams', value: '0', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { label: 'Total Violations', value: '0', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-50' },
    ]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch stats (questions, exams, teams, violations)
                const statsRes = await fetch('/api/organizer/stats');
                const statsData = await statsRes.json();

                if (!statsData.error) {
                    setStats(prev => prev.map(stat => {
                        if (stat.label === 'Total Questions') return { ...stat, value: statsData.totalQuestions.toString() };
                        if (stat.label === 'Active Exams') return { ...stat, value: statsData.totalExams.toString() };
                        if (stat.label === 'Registered Teams') return { ...stat, value: statsData.registeredTeams.toString() };
                        if (stat.label === 'Total Violations') return { ...stat, value: statsData.totalViolations.toString() };
                        return stat;
                    }));
                }

                // Fetch top 5 for preview
                const lbRes = await fetch('/api/leaderboard');
                const lbData = await lbRes.json();
                if (Array.isArray(lbData)) {
                    setParticipants(lbData.slice(0, 5));
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            }
        };

        fetchDashboardData();
        const interval = setInterval(fetchDashboardData, 10000);
        return () => clearInterval(interval);
    }, []);

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

            {/* Recent Activity / Leaderboard Preview */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-10">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-xl font-black italic tracking-tight text-gray-950 uppercase">Live Leaderboard Preview</h3>
                    <Link href="/organizer/dashboard/leaderboard" className="text-sm font-black italic text-blue-600 uppercase tracking-widest hover:underline">View Full <ArrowUpRight size={14} className="inline" /></Link>
                </div>

                {participants.length > 0 ? (
                    <div className="overflow-hidden bg-gray-50/50 rounded-3xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase italic">Team</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase italic text-center">Score</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-red-400 uppercase italic text-center">Violations</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map((team) => (
                                    <tr key={team.id} className="border-b border-gray-50 last:border-0 hover:bg-white transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-black italic text-gray-900 uppercase text-sm">{team.teamName}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-black italic text-blue-600">{team.score.toString().padStart(4, '0')}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-red-500 font-bold italic">
                                            {(team.violationCount || 0).toString().padStart(2, '0')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Trophy size={60} className="mb-4 opacity-10" />
                        <p className="font-bold italic uppercase tracking-widest text-xs">No active teams detected</p>
                    </div>
                )}
            </div>
        </div>
    );
}
