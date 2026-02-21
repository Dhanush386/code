'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Terminal, Lock, User, ArrowRight, Loader2, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';

export default function GlobalLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            if (data.role === 'organizer') {
                localStorage.setItem('organizer', JSON.stringify(data.user));
                router.push('/organizer/dashboard');
            } else if (data.role === 'participant') {
                localStorage.setItem('participant', JSON.stringify(data.user));
                router.push('/participant/exam-entry');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-5">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-indigo-400 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -right-[5%] w-[30%] h-[30%] bg-blue-300 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-gray-100 overflow-hidden">
                    <div className="bg-indigo-600 p-10 text-white text-center relative overflow-hidden">
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-32 h-32 bg-indigo-400/20 rounded-full blur-xl" />

                        <div className="inline-flex p-4 bg-white/10 rounded-3xl mb-4 relative z-10">
                            <ShieldCheck size={36} />
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter uppercase relative z-10">
                            PORTAL ACCESS
                        </h2>
                        <p className="text-indigo-100 mt-2 font-bold italic uppercase text-xs tracking-widest relative z-10">
                            Insightophia • Code Relay 2026
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-10 space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[10px] font-black italic uppercase tracking-wider text-center"
                            >
                                {error}
                            </motion.div>
                        )}

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Username or Team Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-bold text-gray-800 italic"
                                    placeholder="TEAM_ALPHA_99"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Access Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-bold text-gray-800 italic"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white py-5 rounded-[1.25rem] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 shadow-xl shadow-indigo-200 mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    Secure Login <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <div className="pt-6 border-t border-gray-100 flex flex-col gap-4">
                            <Link
                                href="/participant/login"
                                className="text-center text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors tracking-widest uppercase italic flex items-center justify-center gap-2 group"
                            >
                                <Users size={16} className="group-hover:scale-110 transition-transform" />
                                New Team? Register Here
                            </Link>

                            <button
                                type="button"
                                onClick={() => router.push('/')}
                                className="text-center text-[10px] font-black text-gray-300 hover:text-gray-500 transition-colors tracking-[0.3em] uppercase italic"
                            >
                                Terminal Home
                            </button>
                        </div>
                    </form>
                </div>

                <p className="text-center mt-10 text-gray-300 text-[10px] font-black italic uppercase tracking-[0.2em]">
                    Insightophia Cryptographic Protocol v4.0.2
                </p>
            </motion.div>
        </div>
    );
}
