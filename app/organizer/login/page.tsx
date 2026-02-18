'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Terminal, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function OrganizerLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isRegistering ? '/api/organizer/register' : '/api/organizer/login';
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Authentication failed');

            if (isRegistering) {
                alert('Account created successfully! Please login.');
                setIsRegistering(false);
            } else {
                localStorage.setItem('organizer', JSON.stringify(data));
                router.push('/organizer/dashboard');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="bg-blue-600 p-8 text-white text-center">
                        <div className="inline-flex p-3 bg-white/10 rounded-2xl mb-4">
                            <Terminal size={32} />
                        </div>
                        <h2 className="text-3xl font-bold italic tracking-tighter">
                            {isRegistering ? 'CREATE ACCOUNT' : 'ORGANIZER PORTAL'}
                        </h2>
                        <p className="text-blue-100 mt-2 font-medium italic">Insightophia - Code Relay</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold italic uppercase tracking-wider text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 italic tracking-tight uppercase">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 p-1 group-focus-within:text-blue-500 transition-colors">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none font-medium text-gray-800 italic"
                                    placeholder="admin_core"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1 italic tracking-tight uppercase">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 p-1 group-focus-within:text-blue-500 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 transition-all outline-none font-medium text-gray-800 italic"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full ${isRegistering ? 'bg-blue-600' : 'bg-gray-950'} text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 shadow-lg shadow-gray-200`}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    {isRegistering ? 'Create Account' : 'Enter Dashboard'} <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <div className="text-center space-y-4">
                            <button
                                type="button"
                                onClick={() => setIsRegistering(!isRegistering)}
                                className="text-xs font-black text-blue-600 hover:text-blue-700 transition-colors tracking-widest uppercase italic"
                            >
                                {isRegistering ? 'Already have an account? Login' : 'Need an account? Register'}
                            </button>
                            <div>
                                <button
                                    type="button"
                                    onClick={() => router.push('/')}
                                    className="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors tracking-tight uppercase italic"
                                >
                                    Back to Home
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                <p className="text-center mt-8 text-gray-400 text-sm font-medium italic">
                    Authorized access only. Technical support: webcore@insightophia.io
                </p>
            </motion.div>
        </div>
    );
}
