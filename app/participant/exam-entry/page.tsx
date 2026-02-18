'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Key, ArrowRight, Loader2, Sparkles, ShieldAlert, LogOut } from 'lucide-react';

export default function ExamEntry() {
    const [examCode, setExamCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [prevCode, setPrevCode] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const saved = localStorage.getItem('activeExamCode');
        if (saved) setPrevCode(saved);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('participant');
        localStorage.removeItem('activeExamCode');
        router.push('/participant/login');
    };

    const handleEntry = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/participant/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accessCode: examCode })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Invalid code');
            }

            // Redirect to the actual contest interface
            localStorage.setItem('activeExamCode', examCode);
            router.push(`/participant/contest?code=${examCode}`);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Top Bar */}
            <div className="p-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl text-white">
                        <Sparkles size={20} />
                    </div>
                    <span className="text-xl font-black italic tracking-tighter">CODE RELAY</span>
                </div>
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 text-gray-400 font-bold italic text-xs uppercase tracking-widest border-r border-gray-100 pr-6 mr-2">
                        <span>Server Status: Online</span>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl font-black italic text-[10px] uppercase tracking-widest hover:bg-red-100 transition-all border border-red-100 shadow-sm"
                    >
                        <LogOut size={16} />
                        Terminate Session
                    </button>
                </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg"
                >
                    <div className="bg-white rounded-[3rem] p-12 border-2 border-gray-100 shadow-2xl shadow-indigo-100 text-center relative overflow-hidden">
                        {/* Background glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-indigo-50 blur-3xl opacity-50 -z-10" />

                        <div className="inline-flex p-5 bg-indigo-50 rounded-[2rem] text-indigo-600 mb-8 border border-indigo-100">
                            <Key size={40} />
                        </div>

                        <h2 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4 uppercase">
                            Access Identifier
                        </h2>
                        <p className="text-gray-400 font-bold italic text-sm mb-10 uppercase tracking-widest max-w-xs mx-auto">
                            Enter the unique code for your assigned phase to initialize the relay.
                        </p>

                        <form onSubmit={handleEntry} className="space-y-6">
                            <div className="relative group">
                                <input
                                    type="text"
                                    value={examCode}
                                    onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                                    className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent rounded-3xl focus:bg-white focus:border-indigo-600 transition-all outline-none font-black text-3xl text-center tracking-[0.5em] text-indigo-600 italic placeholder:text-gray-100"
                                    placeholder="XXXXXX"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || examCode.length < 6}
                                className="w-full bg-gray-950 text-white py-6 rounded-3xl font-black italic uppercase tracking-widest text-lg hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-30 disabled:active:scale-100 flex items-center justify-center gap-3 shadow-xl shadow-gray-200"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>
                                        Initialize Connection <ArrowRight size={22} />
                                    </>
                                )}
                            </button>
                        </form>

                        {prevCode && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-8 p-6 bg-indigo-50 rounded-[2rem] border-2 border-indigo-200 text-center"
                            >
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 italic">Active Reconnaissance Code</p>
                                <div className="text-3xl font-black italic tracking-[0.3em] text-indigo-600 mb-4">{prevCode}</div>
                                <button
                                    onClick={() => router.push(`/participant/contest?code=${prevCode}`)}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-black italic text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg"
                                >
                                    Re-Link to Node
                                </button>
                            </motion.div>
                        )}

                        <div className="mt-12 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center gap-4 text-left group hover:bg-white transition-all">
                            <div className="p-3 bg-white rounded-xl text-orange-500 shadow-sm border border-gray-100">
                                <ShieldAlert size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold italic text-xs uppercase tracking-widest text-gray-900">Anti-Cheat Active</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-1">Tab switching or window resizing will result in penalties.</p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
