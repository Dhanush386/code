'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    Search,
    ShieldAlert,
    CheckCircle2,
    Clock,
    Loader2,
    Trash2,
    Lock,
    Zap
} from 'lucide-react';

interface Participant {
    id: string;
    teamName: string;
    collegeName: string;
    members: string;
    currentLevel: number;
    score: number;
    violationCount: number;
    isStarted: boolean;
    lastActive: string;
    regNos?: string;
}

export default function ParticipantsMonitor() {
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

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to terminate this participant? All data will be lost.')) return;

        try {
            const res = await fetch(`/api/participant/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete participant');

            setParticipants(prev => prev.filter(p => p.id !== id));
        } catch (error: any) {
            alert(error.message);
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-gray-950 uppercase">Fleet Monitoring</h1>
                    <p className="text-gray-400 font-bold italic text-sm mt-1 uppercase tracking-widest">Tracking #12 active team sub-systems</p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {participants.map((team, idx) => (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/30 group hover:border-indigo-500 transition-all"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-500">
                                    <Users size={24} />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black italic uppercase ${team.isStarted ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-400'}`}>
                                        {team.isStarted ? `Level 0${team.currentLevel}` : 'Waiting...'}
                                    </span>
                                    <div className={`mt-2 flex items-center gap-1 ${new Date().getTime() - new Date(team.lastActive).getTime() < 60000 ? 'text-emerald-500' : 'text-gray-300'}`}>
                                        <Zap size={10} fill="currentColor" />
                                        <span className="text-[10px] font-black uppercase italic tracking-tighter">
                                            {new Date().getTime() - new Date(team.lastActive).getTime() < 60000 ? 'Live Connection' : 'Signal Lost'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-black italic tracking-tighter text-gray-950 uppercase line-clamp-1">{team.teamName}</h3>
                                <p className="text-[10px] font-bold text-gray-400 italic uppercase tracking-widest mt-1">{team.collegeName}</p>
                                {team.regNos && (
                                    <p className="text-[10px] font-black text-indigo-500 italic uppercase tracking-widest mt-2">
                                        Reg: {team.regNos}
                                    </p>
                                )}
                            </div>

                            <div className="p-4 bg-gray-50 rounded-2xl mb-6">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 italic">Unit Components</h4>
                                <p className="text-xs font-bold italic text-gray-600">{team.members}</p>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                <div className="flex gap-4">
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-300 uppercase italic">SCORE</p>
                                        <p className="text-lg font-black italic text-gray-950">{team.score.toString().padStart(3, '0')}</p>
                                    </div>
                                    <div className="w-[1px] h-10 bg-gray-100" />
                                    <div className="text-center">
                                        <p className="text-[10px] font-black text-gray-300 uppercase italic">VIOLATIONS</p>
                                        <p className="text-lg font-black italic text-red-500">{(team.violationCount || 0).toString().padStart(2, '0')}</p>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all">
                                        <Lock size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(team.id)}
                                        className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {participants.length === 0 && (
                        <div className="col-span-full border-2 border-dashed border-gray-100 rounded-[3rem] py-20 flex flex-col items-center justify-center text-gray-300">
                            <ShieldAlert size={60} strokeWidth={1} className="mb-4 opacity-10" />
                            <p className="font-bold italic uppercase tracking-widest text-xs">No active teams detected in matrix</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
