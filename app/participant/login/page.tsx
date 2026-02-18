'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, School, UserPlus, ArrowRight, Loader2, Code } from 'lucide-react';

export default function ParticipantPortal() {
    const [isRegistering, setIsRegistering] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Registration states
    const [teamName, setTeamName] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [members, setMembers] = useState('');

    // Login states
    const [loginTeamName, setLoginTeamName] = useState('');

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isRegistering) {
                const res = await fetch('/api/participant/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamName, collegeName, members })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Registration failed');

                alert('Team registered successfully! Please login to continue.');
                setIsRegistering(false);
            } else {
                const res = await fetch('/api/participant/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teamName: loginTeamName })
                });
                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Login failed');

                localStorage.setItem('participant', JSON.stringify(data));
                router.push('/participant/exam-entry');
            }
        } catch (error: any) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl"
            >
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-gray-100 overflow-hidden">
                    <div className="flex">
                        <button
                            onClick={() => setIsRegistering(true)}
                            className={`flex-1 py-6 text-sm font-black italic uppercase tracking-widest transition-all ${isRegistering ? 'bg-white text-indigo-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            Registration
                        </button>
                        <button
                            onClick={() => setIsRegistering(false)}
                            className={`flex-1 py-6 text-sm font-black italic uppercase tracking-widest transition-all ${!isRegistering ? 'bg-white text-indigo-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            Team Login
                        </button>
                    </div>

                    <div className="p-10">
                        <div className="text-center mb-10">
                            <div className="inline-flex p-4 bg-indigo-50 rounded-3xl text-indigo-600 mb-4">
                                {isRegistering ? <UserPlus size={32} /> : <Users size={32} />}
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-gray-900 uppercase">
                                {isRegistering ? 'Create Team' : 'Welcome Back'}
                            </h2>
                            <p className="text-gray-400 font-bold italic mt-2 uppercase text-xs tracking-widest">
                                Insightophia • Code Relay 2026
                            </p>
                        </div>

                        <form onSubmit={handleAction} className="space-y-6">
                            <AnimatePresence mode="wait">
                                {isRegistering ? (
                                    <motion.div
                                        key="reg"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Team Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                    <Users size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={teamName}
                                                    onChange={(e) => setTeamName(e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-bold text-gray-800 italic"
                                                    placeholder="CYBER_KNIGHTS"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">College Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                    <School size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={collegeName}
                                                    onChange={(e) => setCollegeName(e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-bold text-gray-800 italic"
                                                    placeholder="TECH INSTITUTE OF TECHNOLOGY"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Members (Comma separated)</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                    <Code size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={members}
                                                    onChange={(e) => setMembers(e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-bold text-gray-800 italic"
                                                    placeholder="Alice, Bob, Charlie"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="login"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="space-y-6"
                                    >
                                        <div>
                                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Registered Team Name</label>
                                            <div className="relative group">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                                    <Users size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={loginTeamName}
                                                    onChange={(e) => setLoginTeamName(e.target.value)}
                                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-bold text-gray-800 italic"
                                                    placeholder="CYBER_KNIGHTS"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-5 rounded-[1.25rem] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 shadow-xl shadow-indigo-200 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>
                                        {isRegistering ? 'Register Team' : 'Blast Off'} <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="mt-10 flex flex-col items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="text-xs font-black text-gray-400 hover:text-gray-600 transition-colors tracking-[0.3em] uppercase italic bg-white px-6 py-2 rounded-full border border-gray-100 shadow-sm"
                    >
                        Terminal Home
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
