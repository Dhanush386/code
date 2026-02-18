'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    Search,
    Filter,
    ArrowUp,
    Clock,
    Zap,
    MoreVertical,
    Loader2,
    Medal
} from 'lucide-react';

interface Participant {
    id: string;
    teamName: string;
    collegeName: string;
    currentLevel: number;
    score: number;
    totalTime: number;
}

export default function Leaderboard() {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchParticipants = () => {
            fetch('/api/leaderboard')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setParticipants(data);
                })
                .finally(() => setLoading(false));
        };

        fetchParticipants();
        const interval = setInterval(fetchParticipants, 10000); // 10s polling

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-gray-950 uppercase">Global Standings</h1>
                    <p className="text-gray-400 font-bold italic text-sm mt-1 uppercase tracking-widest">Real-time vector synchronization</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : (
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-8 py-6 text-[10px] font-black italic text-gray-400 uppercase tracking-widest">Rank</th>
                                <th className="px-8 py-6 text-[10px] font-black italic text-gray-400 uppercase tracking-widest">Team Identity</th>
                                <th className="px-8 py-6 text-[10px] font-black italic text-gray-400 uppercase tracking-widest text-center">Phase</th>
                                <th className="px-8 py-6 text-[10px] font-black italic text-gray-400 uppercase tracking-widest text-center">Score</th>
                                <th className="px-8 py-6 text-[10px] font-black italic text-gray-400 uppercase tracking-widest text-center">Duration</th>
                                <th className="px-8 py-6 text-[10px] font-black italic text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {participants.length > 0 ? participants.map((team, idx) => (
                                <motion.tr
                                    key={team.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group hover:bg-blue-50/50 transition-colors border-b border-gray-50 last:border-0"
                                >
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-3">
                                            {idx < 3 ? (
                                                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${idx === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                    idx === 1 ? 'bg-gray-100 text-gray-500' :
                                                        'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    <Medal size={20} />
                                                </div>
                                            ) : (
                                                <span className="h-10 w-10 flex items-center justify-center text-lg font-black italic text-gray-300">
                                                    #{idx + 1}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div>
                                            <p className="font-black italic text-gray-950 uppercase tracking-tight group-hover:text-blue-600 transition-colors">{team.teamName}</p>
                                            <p className="text-[10px] font-bold text-gray-400 italic uppercase mt-1">{team.collegeName}</p>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="px-3 py-1 bg-gray-950 text-white rounded-lg text-[10px] font-black italic uppercase">
                                            L0{team.currentLevel}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-xl font-black italic text-gray-950">
                                            {team.score.toString().padStart(4, '0')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="flex items-center justify-center gap-2 text-gray-400 font-bold italic text-sm">
                                            <Clock size={14} />
                                            {Math.floor(team.totalTime / 60)}:{(team.totalTime % 60).toString().padStart(2, '0')}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                                            <MoreVertical size={20} />
                                        </button>
                                    </td>
                                </motion.tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Trophy size={60} className="mx-auto mb-4 text-gray-100" />
                                        <p className="font-black italic text-gray-300 uppercase tracking-widest text-xs">Waiting for initialization...</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
