'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, School, UserPlus, ArrowRight, Loader2, Code, AlertCircle, CheckCircle2, Sparkles, ShieldCheck } from 'lucide-react';

export default function ParticipantPortal() {
    const [loading, setLoading] = useState(false);
    const [notificationModal, setNotificationModal] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });
    const router = useRouter();

    // Registration states
    const [teamName, setTeamName] = useState('');
    const [collegeName, setCollegeName] = useState('');
    const [members, setMembers] = useState('');
    const [regNos, setRegNos] = useState('');
    const [password, setPassword] = useState('');

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/participant/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamName, collegeName, members, regNos, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Registration failed');

            setNotificationModal({ show: true, message: 'Team registered successfully! Synchronizing access credentials...', type: 'success' });
            setTimeout(() => {
                setNotificationModal(prev => ({ ...prev, show: false }));
                router.push('/login');
            }, 2500);
        } catch (error: any) {
            setNotificationModal({ show: true, message: error.message, type: 'error' });
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
                    <div className="bg-indigo-600 p-10 text-white text-center">
                        <div className="inline-flex p-4 bg-white/10 rounded-3xl mb-4">
                            <UserPlus size={40} />
                        </div>
                        <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">
                            New Registration
                        </h2>
                        <p className="text-indigo-100 font-bold italic mt-2 uppercase text-xs tracking-widest leading-relaxed">
                            Insightophia • Code Relay 2026
                        </p>
                    </div>

                    <div className="p-10">
                        <form onSubmit={handleAction} className="space-y-6">
                            <div className="space-y-6">
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

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Registration Numbers (Comma separated)</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                            <Sparkles size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            value={regNos}
                                            onChange={(e) => setRegNos(e.target.value)}
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border-2 border-transparent rounded-[1.25rem] focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all outline-none font-bold text-gray-800 italic"
                                            placeholder="101, 102, 103"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Access Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-600 transition-colors">
                                            <ShieldCheck size={18} />
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
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 text-white py-5 rounded-[1.25rem] font-black italic uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 shadow-xl shadow-indigo-200 mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                                    <>
                                        Register Team <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <div className="pt-6 border-t border-gray-100 text-center">
                                <button
                                    type="button"
                                    onClick={() => router.push('/login')}
                                    className="text-xs font-black text-indigo-600 hover:text-indigo-700 transition-colors tracking-widest uppercase italic flex items-center justify-center gap-2"
                                >
                                    <Users size={16} />
                                    Already Registered? Login
                                </button>
                            </div>
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

            {/* Notification Modal */}
            <AnimatePresence>
                {notificationModal.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center border-4 border-gray-100 shadow-2xl"
                        >
                            <div className={`inline-flex p-6 rounded-[2rem] border mb-8 ${notificationModal.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                {notificationModal.type === 'success' ? <CheckCircle2 size={60} /> : <AlertCircle size={60} />}
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4 uppercase">
                                {notificationModal.type === 'success' ? 'Synchronized' : 'Access Denied'}
                            </h2>
                            <p className="text-gray-500 font-bold italic text-sm mb-10 uppercase tracking-widest leading-relaxed">
                                {notificationModal.message}
                            </p>
                            <button
                                onClick={() => setNotificationModal({ ...notificationModal, show: false })}
                                className={`w-full py-5 rounded-3xl font-black italic uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 ${notificationModal.type === 'success' ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200' : 'bg-red-600 text-white hover:bg-red-700 shadow-red-200'}`}
                            >
                                {notificationModal.type === 'success' ? 'Continue' : 'Acknowledge'}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
