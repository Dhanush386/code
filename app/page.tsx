'use client';

import Link from 'next/link';
import { Terminal, Users, Code2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
            {/* Background patterns */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-10">
                <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400 rounded-full blur-[120px]" />
                <div className="absolute top-[40%] -right-[5%] w-[30%] h-[30%] bg-indigo-300 rounded-full blur-[100px]" />
            </div>

            <main className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        INSIGHTOPHIA PRESENTING
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-gray-950">
                        CODE <span className="text-blue-600">RELAY</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto font-medium">
                        The ultimate competitive coding marathon. Collaborate, solve, and race against the clock.
                    </p>
                </motion.div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                    {/* Organizer Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        whileHover={{ y: -8 }}
                        className="group relative"
                    >
                        <Link href="/organizer/login" className="block">
                            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 h-full transition-all duration-300 group-hover:border-blue-500 group-hover:shadow-2xl group-hover:shadow-blue-100 flex flex-col items-start justify-between overflow-hidden">
                                <div className="mb-8 p-4 bg-gray-50 rounded-2xl text-gray-600 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                                    <Terminal size={40} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold mb-3 text-gray-900 leading-tight">Organizer</h3>
                                    <p className="text-gray-500 font-medium mb-6">
                                        Create questions, manage exams, and monitor the leaderboard in real-time.
                                    </p>
                                    <div className="flex items-center gap-2 text-blue-600 font-bold group-hover:translate-x-1 transition-transform">
                                        Enter Dashboard <ChevronRight size={20} />
                                    </div>
                                </div>

                                {/* Decorative background icon */}
                                <div className="absolute -bottom-6 -right-6 text-gray-100 opacity-20 -rotate-12 transition-transform group-hover:scale-110 group-hover:text-blue-200">
                                    <Terminal size={120} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Participant Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                        whileHover={{ y: -8 }}
                        className="group relative"
                    >
                        <Link href="/participant/login" className="block">
                            <div className="bg-white border-2 border-gray-100 rounded-3xl p-8 h-full transition-all duration-300 group-hover:border-indigo-500 group-hover:shadow-2xl group-hover:shadow-indigo-100 flex flex-col items-start justify-between overflow-hidden">
                                <div className="mb-8 p-4 bg-gray-50 rounded-2xl text-gray-600 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                    <Users size={40} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-3xl font-bold mb-3 text-gray-900 leading-tight">Participant</h3>
                                    <p className="text-gray-500 font-medium mb-6">
                                        Register your team, join the relay, and solve challenges to climb the ranks.
                                    </p>
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold group-hover:translate-x-1 transition-transform">
                                        Join the Contest <ChevronRight size={20} />
                                    </div>
                                </div>

                                {/* Decorative background icon */}
                                <div className="absolute -bottom-6 -right-6 text-gray-100 opacity-20 -rotate-12 transition-transform group-hover:scale-110 group-hover:text-indigo-200">
                                    <Users size={120} />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                {/* Footer info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-24 text-gray-400 font-medium flex items-center gap-4"
                >
                    <div className="flex items-center gap-2">
                        <Code2 size={18} />
                        <span>Built for High Performance</span>
                    </div>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span>Interactive UI</span>
                    <span className="h-1 w-1 rounded-full bg-gray-300" />
                    <span>Real-time Sync</span>
                </motion.div>
            </main>
        </div>
    );
}
