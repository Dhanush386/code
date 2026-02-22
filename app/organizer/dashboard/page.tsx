'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { LayoutDashboard, Users, BookOpen, Trophy, Plus, ArrowUpRight, ShieldAlert } from 'lucide-react';
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
    const [fullParticipants, setFullParticipants] = useState<Participant[]>([]);
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

                // Fetch full leaderboard for graph and preview
                const lbRes = await fetch('/api/leaderboard');
                const lbData = await lbRes.json();
                if (Array.isArray(lbData)) {
                    setFullParticipants(lbData);
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

    // Prepare data for the graph (Top 10)
    const graphData = fullParticipants
        .slice(0, 10)
        .map(p => ({
            name: p.teamName.length > 12 ? p.teamName.substring(0, 10) + '..' : p.teamName,
            score: p.score,
            fullName: p.teamName
        }));

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

            {/* Analytics Graph Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-10">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black italic tracking-tight text-gray-950 uppercase">Performance Matrix</h3>
                            <p className="text-[10px] font-bold text-gray-400 italic uppercase tracking-widest mt-1">Live scoring distribution across all units</p>
                        </div>
                        <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase italic tracking-widest">
                            Top 10 Nodes
                        </div>
                    </div>

                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={graphData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                    interval={0}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                />
                                <Tooltip
                                    cursor={{ fill: '#f8fafc' }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-gray-950 p-4 rounded-2xl shadow-2xl border border-gray-800">
                                                    <p className="text-[10px] font-black text-gray-500 uppercase italic mb-1">{payload[0].payload.fullName}</p>
                                                    <p className="text-lg font-black italic text-white uppercase tracking-tighter">
                                                        Points: <span className="text-blue-400">{payload[0].value}</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Bar
                                    dataKey="score"
                                    radius={[8, 8, 8, 8]}
                                    barSize={32}
                                >
                                    {graphData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={index === 0 ? '#2563eb' : '#94a3b8'}
                                            fillOpacity={1 - (index * 0.08)}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Leaderboard Preview (Compact) */}
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 p-10">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black italic tracking-tight text-gray-950 uppercase">Top 5</h3>
                        <Link href="/organizer/dashboard/leaderboard" className="text-[10px] font-black italic text-blue-600 uppercase tracking-widest hover:underline">Full LB <ArrowUpRight size={12} className="inline ml-1" /></Link>
                    </div>

                    {participants.length > 0 ? (
                        <div className="space-y-4">
                            {participants.map((team, idx) => (
                                <div key={team.id} className="flex items-center justify-between p-4 bg-gray-50/50 rounded-2xl hover:bg-white border border-transparent hover:border-gray-100 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-950 text-white flex items-center justify-center text-[10px] font-black italic">
                                            {String(idx + 1).padStart(2, '0')}
                                        </div>
                                        <div>
                                            <p className="font-black italic text-gray-900 uppercase text-xs line-clamp-1">{team.teamName}</p>
                                            <p className="text-[8px] font-bold text-gray-400 italic uppercase tracking-widest">{team.collegeName}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-black italic text-blue-600">{team.score.toString().padStart(3, '0')}</p>
                                        <p className="text-[8px] font-bold text-red-500 italic uppercase tracking-widest">v: {team.violationCount || 0}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <Trophy size={60} className="mb-4 opacity-10" />
                            <p className="font-bold italic uppercase tracking-widest text-xs text-center">No active teams</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
