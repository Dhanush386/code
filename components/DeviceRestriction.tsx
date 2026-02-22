'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, ShieldAlert, Laptop, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DeviceRestriction({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkDevice = () => {
            const ua = navigator.userAgent;
            const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
            const isMobileUA = mobileRegex.test(ua);
            const isSmallScreen = window.innerWidth < 1024; // Desktop threshold

            setIsMobile(isMobileUA || isSmallScreen);
            setIsChecking(false);
        };

        checkDevice();
        window.addEventListener('resize', checkDevice);
        return () => window.removeEventListener('resize', checkDevice);
    }, []);

    if (isChecking) return null;

    return (
        <>
            <AnimatePresence>
                {isMobile ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[99999] bg-white flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="max-w-md w-full">
                            {/* Device Icons Comparison */}
                            <div className="flex items-center justify-center gap-8 mb-12 relative">
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                    className="p-6 bg-red-50 text-red-500 rounded-[2.5rem] border-2 border-red-100 flex flex-col items-center gap-2"
                                >
                                    <Smartphone size={40} />
                                    <span className="text-[10px] font-black uppercase italic tracking-widest">Mobile</span>
                                </motion.div>

                                <div className="text-gray-200">
                                    <ArrowRight size={32} strokeWidth={3} />
                                </div>

                                <motion.div
                                    animate={{ scale: [1, 1.05, 1] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    className="p-6 bg-emerald-50 text-emerald-500 rounded-[2.5rem] border-2 border-emerald-100 flex flex-col items-center gap-2 shadow-xl shadow-emerald-100"
                                >
                                    <Monitor size={40} />
                                    <span className="text-[10px] font-black uppercase italic tracking-widest text-emerald-600">Desktop</span>
                                </motion.div>
                            </div>

                            {/* Warning Content */}
                            <div className="space-y-6">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-950 text-white rounded-full text-[10px] font-black italic uppercase tracking-[0.2em] mb-4">
                                    <ShieldAlert size={14} className="text-red-500" />
                                    Access Restricted
                                </div>

                                <h1 className="text-4xl font-black italic tracking-tighter text-gray-950 uppercase leading-none">
                                    Desktop Connection <br />Required
                                </h1>

                                <p className="text-gray-500 font-bold italic text-sm uppercase tracking-widest leading-relaxed">
                                    Code Relay protocols and terminal interfaces are optimized for desktop environments only. Please initialize connection from a laptop or workstation.
                                </p>

                                <div className="pt-8 border-t border-gray-100 flex flex-col items-center gap-4">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <Laptop size={20} />
                                        <span className="text-xs font-black italic uppercase tracking-widest">Minimal Resolution: 1024px</span>
                                    </div>
                                    <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic leading-tight">
                                        "A standard workstation provides the precision needed for high-intensity relay operations."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    children
                )}
            </AnimatePresence>
        </>
    );
}
