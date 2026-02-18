'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Search,
    Filter,
    Plus,
    MoreVertical,
    Code2,
    ChevronRight,
    Loader2,
    Trash2,
    Edit
} from 'lucide-react';
import Link from 'next/link';

interface Question {
    id: string;
    title: string;
    difficulty: string;
    languages: string;
    testCases: { isHidden: boolean }[];
}

export default function QuestionBank() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetch('/api/questions')
            .then(res => res.json())
            .then(data => {
                setQuestions(data);
                setLoading(false);
            });
    }, []);

    const deleteQuestion = async (id: string) => {
        if (!confirm('Are you sure you want to delete this challenge? This action cannot be undone.')) return;

        try {
            const res = await fetch(`/api/questions/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete question');
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (err: any) {
            alert(err.message);
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-gray-950 uppercase">Question Bank</h1>
                    <p className="text-gray-400 font-bold italic text-sm mt-1 uppercase tracking-widest">Repository of local coding challenges</p>
                </div>
                <Link
                    href="/organizer/dashboard/questions/new"
                    className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100"
                >
                    <Plus size={18} /> New Question
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
                        placeholder="Search problems by title..."
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
                    {filteredQuestions.map((question, idx) => (
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="bg-white rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-200/30 p-8 group hover:border-blue-500 transition-all relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black italic uppercase tracking-widest border-2 ${question.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        question.difficulty === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                            'bg-red-50 text-red-600 border-red-100'
                                        }`}>
                                        {question.difficulty}
                                    </span>
                                    <div className="flex gap-1">
                                        {question.languages.split(',').map(lang => (
                                            <span key={lang} className="text-[10px] font-bold text-gray-300 uppercase italic">
                                                {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black italic tracking-tight text-gray-950 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                                    {question.title}
                                </h3>

                                <div className="flex gap-4 mb-4">
                                    <div className="flex items-center gap-1.5 text-[10px] font-black italic uppercase tracking-widest text-gray-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        {question.testCases?.filter(tc => !tc.isHidden).length || 0} Visible
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black italic uppercase tracking-widest text-gray-400">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-950" />
                                        {question.testCases?.filter(tc => tc.isHidden).length || 0} Hidden
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-8 border-t border-gray-50 pt-6">
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/organizer/dashboard/questions/${question.id}/edit`}
                                            className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                                        >
                                            <Edit size={16} />
                                        </Link>
                                        <button
                                            onClick={() => deleteQuestion(question.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <button className="flex items-center gap-1 text-xs font-black italic text-gray-400 group-hover:text-blue-600 transition-colors uppercase tracking-widest">
                                        Details <ChevronRight size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Decorative side accent */}
                            <div className="absolute top-0 right-0 w-1 h-full bg-blue-500 transform translate-x-full group-hover:translate-x-0 transition-transform" />
                        </motion.div>
                    ))}

                    {filteredQuestions.length === 0 && (
                        <div className="col-span-full border-2 border-dashed border-gray-100 rounded-[2.5rem] py-20 flex flex-col items-center justify-center text-gray-300">
                            <Code2 size={60} strokeWidth={1} className="mb-4 opacity-10" />
                            <p className="font-bold italic uppercase tracking-widest text-xs">No questions found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
