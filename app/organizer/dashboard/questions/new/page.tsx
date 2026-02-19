'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Save,
    Trash2,
    Plus,
    BarChart,
    Code,
    AlignLeft,
    Terminal,
    Settings,
    X,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

const languages = ['python', 'c', 'cpp', 'java'];
const difficulties = ['Easy', 'Medium', 'Hard'];

export default function NewQuestion() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        constraints: '',
        sampleInput: '',
        sampleOutput: '',
        difficulty: 'Easy',
        points: 10,
        selectedLanguages: ['python', 'c', 'cpp', 'java'],
        testCases: [
            { id: Date.now(), input: '', expectedOutput: '', isHidden: false }
        ],
    });

    const addTestCase = (isHidden: boolean) => {
        setFormData(prev => ({
            ...prev,
            testCases: [
                ...prev.testCases,
                { id: Date.now(), input: '', expectedOutput: '', isHidden }
            ]
        }));
    };

    const removeTestCase = (id: number) => {
        setFormData(prev => ({
            ...prev,
            testCases: prev.testCases.filter(tc => tc.id !== id)
        }));
    };

    const updateTestCase = (id: number, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            testCases: prev.testCases.map(tc => tc.id === id ? { ...tc, [field]: value } : tc)
        }));
    };

    const toggleLanguage = (lang: string) => {
        setFormData(prev => ({
            ...prev,
            selectedLanguages: prev.selectedLanguages.includes(lang)
                ? prev.selectedLanguages.filter(l => l !== lang)
                : [...prev.selectedLanguages, lang]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    languages: formData.selectedLanguages.join(','),
                    testCases: formData.testCases.map(({ input, expectedOutput, isHidden }) => ({
                        input,
                        expectedOutput,
                        isHidden
                    })),
                }),
            });

            if (!res.ok) throw new Error('Failed to save question');

            router.push('/organizer/dashboard/questions');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black italic tracking-tighter text-gray-950 uppercase">Create New Challenge</h1>
                    <p className="text-gray-400 font-bold italic text-sm mt-1 uppercase tracking-widest">Designing local problem #32</p>
                </div>
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-2xl font-black italic uppercase tracking-widest text-sm text-gray-400 hover:bg-gray-100 transition-all border border-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-3 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50"
                    >
                        {loading ? 'Propagating...' : (
                            <>
                                <Save size={18} /> Save Question
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-center gap-3 font-bold italic text-sm">
                    <AlertCircle size={20} /> {error}
                </div>
            )}

            <form className="space-y-8">
                {/* Basic Info */}
                <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/30">
                    <div className="flex items-center gap-3 mb-6 text-gray-950">
                        <Settings size={20} className="text-blue-500" />
                        <h3 className="text-lg font-black italic uppercase tracking-widest">General Configuration</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Problem Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-800 italic"
                                placeholder="The Greatest Path..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Difficulty Set</label>
                            <div className="flex gap-2">
                                {difficulties.map(diff => (
                                    <button
                                        key={diff}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, difficulty: diff })}
                                        className={`flex-1 py-3 rounded-xl font-black italic uppercase tracking-widest text-xs transition-all border-2 ${formData.difficulty === diff
                                            ? 'bg-gray-950 text-white border-gray-950'
                                            : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                                            }`}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Enabled Engines</label>
                            <div className="flex gap-2">
                                {languages.map(lang => (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => toggleLanguage(lang)}
                                        className={`flex-1 py-3 rounded-xl font-black italic uppercase tracking-widest text-[10px] transition-all border-2 ${formData.selectedLanguages.includes(lang)
                                            ? 'bg-blue-50 text-blue-600 border-blue-500'
                                            : 'bg-white text-gray-300 border-gray-100'
                                            }`}
                                    >
                                        {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Description & Formats */}
                <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/30">
                    <div className="flex items-center gap-3 mb-6 text-gray-950">
                        <AlignLeft size={20} className="text-indigo-500" />
                        <h3 className="text-lg font-black italic uppercase tracking-widest">Content & logic</h3>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Problem Description (supports markdown)</label>
                            <textarea
                                rows={6}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-gray-800 italic"
                                placeholder="Give a clear explanation..."
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Input Constrain</label>
                                <textarea
                                    rows={3}
                                    value={formData.inputFormat}
                                    onChange={(e) => setFormData({ ...formData, inputFormat: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-gray-800 italic text-sm"
                                    placeholder="First line contains N..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Output Constrain</label>
                                <textarea
                                    rows={3}
                                    value={formData.outputFormat}
                                    onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-gray-800 italic text-sm"
                                    placeholder="Print the result..."
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 mb-2 ml-1 uppercase tracking-[0.2em] italic">Constraints</label>
                                <textarea
                                    rows={3}
                                    value={formData.constraints}
                                    onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                                    className="w-full px-6 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-gray-800 italic text-sm"
                                    placeholder="1 <= N <= 10^5..."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Test Cases */}
                <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/30">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3 text-gray-950">
                            <Terminal size={20} className="text-emerald-500" />
                            <h3 className="text-lg font-black italic uppercase tracking-widest">Test Matrices</h3>
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => addTestCase(false)}
                                className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-black italic uppercase tracking-widest text-[10px] hover:bg-emerald-100 transition-all flex items-center gap-2"
                            >
                                <Plus size={14} /> Add Visible
                            </button>
                            <button
                                type="button"
                                onClick={() => addTestCase(true)}
                                className="px-4 py-2 bg-gray-950 text-white rounded-xl font-black italic uppercase tracking-widest text-[10px] hover:bg-gray-800 transition-all flex items-center gap-2"
                            >
                                <Plus size={14} /> Add Hidden
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {formData.testCases.map((tc, index) => (
                            <div key={tc.id} className={`p-6 rounded-3xl border-2 transition-all ${tc.isHidden ? 'bg-gray-50 border-gray-100' : 'bg-emerald-50/30 border-emerald-100'}`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tc.isHidden ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                            Case #{index + 1} {tc.isHidden ? '(Hidden)' : '(Visible)'}
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeTestCase(tc.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[8px] font-black text-gray-400 mb-1 ml-1 uppercase tracking-widest italic">Input Stream</label>
                                        <textarea
                                            value={tc.input}
                                            onChange={(e) => updateTestCase(tc.id, 'input', e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-900 border-transparent rounded-xl focus:border-emerald-500 transition-all outline-none font-mono font-bold text-emerald-400 text-xs"
                                            rows={3}
                                            placeholder="Standard input..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[8px] font-black text-gray-400 mb-1 ml-1 uppercase tracking-widest italic">Expected Response</label>
                                        <textarea
                                            value={tc.expectedOutput}
                                            onChange={(e) => updateTestCase(tc.id, 'expectedOutput', e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-900 border-transparent rounded-xl focus:border-emerald-500 transition-all outline-none font-mono font-bold text-emerald-400 text-xs"
                                            rows={3}
                                            placeholder="Standard output..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {formData.testCases.length === 0 && (
                            <div className="text-center py-10 bg-gray-50 border-2 border-dashed border-gray-100 rounded-[2rem]">
                                <p className="text-gray-400 font-bold italic uppercase tracking-widest text-xs">No extraction metrics defined</p>
                            </div>
                        )}
                    </div>
                </section>
            </form>
        </div>
    );
}
