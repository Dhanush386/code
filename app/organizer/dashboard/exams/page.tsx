'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Plus,
    LayoutDashboard,
    ChevronRight,
    Loader2,
    Clock,
    Key,
    Layers,
    BookOpen,
    Trash2,
    Pencil
} from 'lucide-react';
import Link from 'next/link';

interface Exam {
    id: string;
    name: string;
    levels: {
        id: string;
        levelNumber: number;
        accessCode: string;
        timeLimit: number;
        questions: {
            question: {
                title: string;
            }
        }[];
    }[];
}

export default function ExamBank() {
    const [exams, setExams] = useState<Exam[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/api/exams')
            .then(res => res.json())
            .then(data => {
                setExams(data);
                setLoading(false);
            });
    }, []);

    const deleteExam = async (id: string) => {
        if (!confirm('Are you sure you want to delete this exam? This will remove all associated levels and data. This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete exam');
            setExams(prev => prev.filter(e => e.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredExams = exams.filter(e =>
        e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-gray-950 uppercase">Exam Management</h1>
                    <p className="text-gray-400 font-bold italic text-sm mt-1 uppercase tracking-widest">Active & Past Coding Events</p>
                </div>
                <Link
                    href="/organizer/dashboard/exams/new"
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                >
                    <Plus size={18} /> New Exam
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4 items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
                <div className="relative flex-1 group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        placeholder="Search exams by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold italic text-gray-800"
                    />
                </div>
                <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-gray-100 transition-all border border-transparent hover:border-gray-200">
                    <Filter size={20} />
                </button>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-blue-500" size={40} />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredExams.map((exam, idx) => (
                        <motion.div
                            key={exam.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-200/30 p-8 group hover:border-blue-500 transition-all relative overflow-hidden flex flex-col"
                        >
                            <div className="relative z-10 flex-1">
                                <div className="flex items-center justify-between mb-6">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 border-2 border-blue-100 rounded-full text-[10px] font-black italic uppercase tracking-widest">
                                        {exam.levels.length} Phases
                                    </span>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/organizer/dashboard/exams/${exam.id}/edit`}
                                            className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-blue-500 transition-colors"
                                        >
                                            <Pencil size={14} />
                                        </Link>
                                        <button
                                            onClick={() => deleteExam(exam.id)}
                                            className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <div className="p-2 bg-gray-50 rounded-xl text-gray-400">
                                            <LayoutDashboard size={14} />
                                        </div>
                                    </div>
                                </div>

                                <h3 className="text-xl font-black italic tracking-tight text-gray-950 mb-4 line-clamp-1 group-hover:text-blue-600 transition-colors uppercase">
                                    {exam.name}
                                </h3>

                                <div className="space-y-3 mb-6">
                                    {exam.levels.map(level => (
                                        <div key={level.id} className="flex flex-col gap-1 p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-black italic text-gray-900 uppercase">Phase 0{level.levelNumber}</span>
                                                <span className="text-[10px] font-mono font-black text-blue-600 uppercase tracking-tighter flex items-center gap-1">
                                                    <Key size={10} /> {level.accessCode}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[9px] font-bold text-gray-400 italic uppercase">
                                                <span className="flex items-center gap-1"><Clock size={10} /> {level.timeLimit}m</span>
                                                <span className="flex items-center gap-1"><BookOpen size={10} /> {level.questions.length} problems</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="w-full mt-4 flex items-center justify-between px-6 py-3 bg-gray-950 text-white rounded-2xl font-black italic text-xs uppercase tracking-widest hover:bg-blue-600 active:scale-95 transition-all group/btn shadow-lg shadow-gray-200">
                                Exam Details <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>

                            {/* Decorative side accent */}
                            <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform" />
                        </motion.div>
                    ))}

                    {filteredExams.length === 0 && (
                        <div className="col-span-full border-2 border-dashed border-gray-100 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-gray-300">
                            <LayoutDashboard size={60} strokeWidth={1} className="mb-4 opacity-10" />
                            <p className="font-bold italic uppercase tracking-widest text-xs">No exams found</p>
                            <Link href="/organizer/dashboard/exams/new" className="mt-4 text-blue-500 hover:underline font-black italic uppercase text-[10px] tracking-widest">Construct first race</Link>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
