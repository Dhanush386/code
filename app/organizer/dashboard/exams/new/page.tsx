'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save,
    Trash2,
    Plus,
    Layers,
    Clock,
    Key,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Search,
    BookOpen
} from 'lucide-react';

interface Question {
    id: string;
    title: string;
    difficulty: string;
}

const generateCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export default function NewExam() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    const [examName, setExamName] = useState('');
    const [levels, setLevels] = useState([
        { levelNumber: 1, accessCode: generateCode(), timeLimit: 30, startTime: '', questionIds: [] as string[] },
        { levelNumber: 2, accessCode: generateCode(), timeLimit: 45, startTime: '', questionIds: [] as string[] },
        { levelNumber: 3, accessCode: generateCode(), timeLimit: 60, startTime: '', questionIds: [] as string[] },
    ]);

    useEffect(() => {
        fetch('/api/questions').then(res => res.json()).then(setQuestions);
    }, []);

    const toggleQuestionInLevel = (levelIdx: number, qid: string) => {
        const newLevels = [...levels];
        const currentQids = newLevels[levelIdx].questionIds;
        if (currentQids.includes(qid)) {
            newLevels[levelIdx].questionIds = currentQids.filter(id => id !== qid);
        } else {
            newLevels[levelIdx].questionIds = [...currentQids, qid];
        }
        setLevels(newLevels);
    };

    const handleSubmit = async () => {
        if (!examName) return alert('Please enter an exam name');

        // Get organizer from localStorage
        const organizerStr = localStorage.getItem('organizer');
        if (!organizerStr) return alert('Session expired. Please login again.');
        const organizer = JSON.parse(organizerStr);

        setLoading(true);

        try {
            // Clean levels to remove any NaN values from timeLimit
            const cleanedLevels = levels.map(level => ({
                ...level,
                timeLimit: isNaN(level.timeLimit) ? 30 : level.timeLimit,
                startTime: level.startTime ? new Date(level.startTime).toISOString() : null
            }));

            const res = await fetch('/api/exams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: examName,
                    organizerId: organizer.id,
                    levels: cleanedLevels
                })
            });

            if (!res.ok) throw new Error('Failed to create exam');
            router.push('/organizer/dashboard');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-gray-950 uppercase">Configure NEW RACE</h1>
                    <p className="text-gray-400 font-bold italic text-sm mt-1 uppercase tracking-widest">Designing local exam #09</p>
                </div>
                <div className="flex gap-3">
                    <button
                        disabled={loading}
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                    >
                        {loading ? 'Initializing...' : (
                            <>
                                <Plus size={18} /> Launch Exam
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left: General Info & Level Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/30">
                        <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Exam Designation</label>
                        <input
                            type="text"
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                            className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-800 italic text-2xl"
                            placeholder="REGIONAL FINALS 2026"
                        />
                    </section>

                    <div className="space-y-6">
                        {levels.map((level, idx) => (
                            <motion.div
                                key={level.levelNumber}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-lg shadow-gray-200/20 relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-8 relative z-10">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 bg-gray-950 text-white rounded-2xl flex items-center justify-center font-black italic text-2xl italic">
                                            L{level.levelNumber}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black italic tracking-tight text-gray-900 uppercase">Phase 0{level.levelNumber} Configuration</h3>
                                            <p className="text-gray-400 font-bold italic text-xs uppercase tracking-widest">
                                                {idx === 0 ? 'Foundation Challenge' : idx === 1 ? 'Intermediate Vector' : 'Extreme Pressure'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8 relative z-10">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic ml-1">
                                            <Key size={12} /> Access Identifier
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                readOnly
                                                value={level.accessCode}
                                                className="bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 font-mono font-black text-blue-600 italic flex-1"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newLevels = [...levels];
                                                    newLevels[idx].accessCode = generateCode();
                                                    setLevels(newLevels);
                                                }}
                                                className="p-3 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 transition-all font-bold text-xs uppercase"
                                            >
                                                Regen
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic ml-1">
                                            <Clock size={12} /> Duration (Mins)
                                        </label>
                                        <input
                                            type="number"
                                            value={level.timeLimit}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                const newLevels = [...levels];
                                                newLevels[idx].timeLimit = isNaN(val) ? 0 : val;
                                                setLevels(newLevels);
                                            }}
                                            className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-gray-800 italic outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-2">
                                        <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic ml-1">
                                            <Save size={12} /> Opening Schedule (Optional)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={level.startTime}
                                            onChange={(e) => {
                                                const newLevels = [...levels];
                                                newLevels[idx].startTime = e.target.value;
                                                setLevels(newLevels);
                                            }}
                                            className="w-full bg-gray-50 border-2 border-transparent rounded-xl px-4 py-3 font-bold text-gray-800 italic outline-none focus:border-blue-500 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <label className="block text-[10px] font-black text-gray-400 mb-3 ml-1 uppercase tracking-[0.2em] italic">Assigned Questions ({level.questionIds.length})</label>
                                    <div className="flex flex-wrap gap-2">
                                        {level.questionIds.length > 0 ? (
                                            level.questionIds.map(id => (
                                                <div key={id} className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-xs font-black italic flex items-center gap-2 border border-blue-100 group">
                                                    {questions.find(q => q.id === id)?.title}
                                                    <button onClick={() => toggleQuestionInLevel(idx, id)} className="text-blue-300 hover:text-blue-600">
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-300 italic font-bold text-xs uppercase tracking-widest py-2">No problems linked to this phase</p>
                                        )}
                                    </div>
                                </div>

                                {/* Decorative faint background level number */}
                                <div className="absolute -bottom-10 -right-4 text-[12rem] font-black text-gray-50 italic pointer-events-none select-none">
                                    {level.levelNumber}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right: Question Selector Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 overflow-hidden sticky top-32 h-[calc(100vh-12rem)] flex flex-col">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-gray-950 mb-4">Problem Catalog</h3>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Search size={14} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Quick search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:border-blue-500 transition-all outline-none font-bold italic text-sm text-gray-800"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            {questions.filter(q => q.title.toLowerCase().includes(searchTerm.toLowerCase())).map(q => {
                                const levelIdx = levels.findIndex(l => l.questionIds.includes(q.id));
                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => {
                                            if (levelIdx !== -1) {
                                                toggleQuestionInLevel(levelIdx, q.id);
                                            } else {
                                                const targetLevelIdx = q.difficulty === 'Easy' ? 0 : q.difficulty === 'Medium' ? 1 : 2;
                                                toggleQuestionInLevel(targetLevelIdx, q.id);
                                            }
                                        }}
                                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3 group ${levelIdx !== -1
                                            ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100/50'
                                            : 'bg-white border-gray-100 hover:border-blue-300'
                                            }`}
                                    >
                                        <div className={`mt-1 h-2 w-2 rounded-full flex-shrink-0 ${q.difficulty === 'Easy' ? 'bg-emerald-400' :
                                            q.difficulty === 'Medium' ? 'bg-orange-400' : 'bg-red-500'
                                            }`} />
                                        <div className="flex-1">
                                            <p className="font-bold italic text-sm text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                                                {q.title}
                                            </p>
                                            <p className="text-[10px] font-black text-gray-400 italic uppercase">
                                                {levelIdx !== -1 ? `Active in L${levelIdx + 1}` : q.difficulty}
                                            </p>
                                        </div>
                                        {levelIdx !== -1 && <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function X({ size, className }: { size: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}
