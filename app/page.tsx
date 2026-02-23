'use client';

import Link from 'next/link';
import { Terminal, Users, Code2, ChevronRight, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
    return (
        <div className="min-h-screen relative text-white font-sans selection:bg-blue-500/30 selection:text-white overflow-hidden">
            {/* Background Image with Dynamic Overlay */}
            <div
                className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat scale-110"
                style={{
                    backgroundImage: 'url("https://images.pexels.com/photos/1089438/pexels-photo-1089438.jpeg")',
                }}
            />
            <div className="fixed inset-0 z-1 bg-gradient-to-br from-gray-950/95 via-gray-900/80 to-indigo-950/95 backdrop-blur-[2px]" />

            <main className="relative z-10 container mx-auto px-6 py-20 flex flex-col items-center min-h-screen justify-center">
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
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-4 text-white">
                        CODE <span className="text-blue-500">RELAY</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-medium">
                        The ultimate competitive coding marathon. Collaborate, solve, and race against the clock.
                    </p>
                </motion.div>

                {/* Action Card - Consolidated */}
                <div className="w-full max-w-xl flex justify-center">
                    {/* Unified Login Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        whileHover={{ y: -8 }}
                        className="group relative w-full"
                    >
                        <Link href="/login" className="block h-full">
                            <div className="bg-white/5 backdrop-blur-xl border-2 border-white/10 rounded-[3rem] p-12 h-full transition-all duration-300 group-hover:border-blue-500/50 group-hover:shadow-2xl group-hover:shadow-blue-500/20 flex flex-col items-center justify-center text-center overflow-hidden relative">
                                {/* Decorative background accent */}
                                <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                                <div className="mb-10 p-6 bg-gray-50 rounded-[2rem] text-gray-600 transition-colors group-hover:bg-indigo-50 group-hover:text-indigo-600">
                                    <Terminal size={56} strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black italic tracking-tighter mb-4 text-white leading-tight uppercase">Portal Access</h3>
                                    <p className="text-lg text-gray-400 font-bold italic mb-10 max-w-sm">
                                        The main gateway for Organizers and Teams. Securely enter the Code Relay environment.
                                    </p>
                                    <div className="inline-flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 group-hover:scale-105">
                                        Launch Terminal <ArrowRight size={20} />
                                    </div>
                                </div>

                                <div className="absolute -bottom-10 -right-10 text-gray-100 opacity-20 -rotate-12 transition-transform group-hover:scale-110 group-hover:text-indigo-200">
                                    <Terminal size={200} />
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
