'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    Search,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Loader2,
    Terminal,
    Eye,
    EyeOff,
    Code2,
    BookOpen,
    AlertTriangle
} from 'lucide-react';
import Editor from '@monaco-editor/react';

const LANGUAGES = ['python', 'c', 'cpp', 'java'];

interface TestCaseResult {
    id: string;
    input: string;
    expected: string;
    actual: string;
    status: 'PASSED' | 'FAILED' | 'ERROR';
    isHidden: boolean;
    runtime?: string;
    memory?: string;
    stderr?: string;
}

import { Sun, Moon, Settings as SettingsIcon } from 'lucide-react';

export default function ProblemTester() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [sourceCode, setSourceCode] = useState('');
    const [testing, setTesting] = useState(false);
    const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
    const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'success' | 'failure'>('idle');
    const [editorTheme, setEditorTheme] = useState<'vs' | 'vs-dark'>('vs');

    useEffect(() => {
        fetch('/api/questions')
            .then(res => res.json())
            .then(data => {
                setQuestions(data);
                setLoading(false);
            });
    }, []);

    const handleQuestionSelect = (q: any) => {
        setSelectedQuestion(q);
        setSourceCode(getDefaultCode(selectedLanguage));
        setTestResults([]);
        setOverallStatus('idle');
    };

    const getDefaultCode = (lang: string) => {
        switch (lang) {
            case 'python': return 'import sys\n\n# Read from STDIN\ninput_data = sys.stdin.read().strip()\n\n# Your logic here\nprint(input_data)';
            case 'c': return '#include <stdio.h>\n\nint main() {\n    char buffer[1024];\n    while (scanf("%s", buffer) != EOF) {\n        printf("%s\\n", buffer);\n    }\n    return 0;\n}';
            case 'cpp': return '#include <iostream>\n#include <string>\n\nusing namespace std;\n\nint main() {\n    string s;\n    while (cin >> s) {\n        cout << s << endl;\n    }\n    return 0;\n}';
            case 'java': return 'import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        while (sc.hasNext()) {\n            System.out.println(sc.next());\n        }\n    }\n}';
            default: return '';
        }
    };

    const handleLanguageChange = (lang: string) => {
        setSelectedLanguage(lang);
        setSourceCode(getDefaultCode(lang));
    };

    const runTests = async () => {
        if (!selectedQuestion || !sourceCode) return;
        setTesting(true);
        setOverallStatus('running');
        setTestResults([]);

        const results: TestCaseResult[] = [];
        let allPassed = true;

        if (!selectedQuestion.testCases || selectedQuestion.testCases.length === 0) {
            setOverallStatus('idle');
            setTesting(false);
            return;
        }

        for (const tc of selectedQuestion.testCases) {
            try {
                const res = await fetch('/api/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source_code: sourceCode,
                        language: selectedLanguage,
                        stdin: tc.input
                    })
                });

                const data = await res.json();

                if (data.error) {
                    results.push({
                        id: tc.id,
                        input: tc.input,
                        expected: tc.expectedOutput || '',
                        actual: 'EXECUTION_ERROR',
                        status: 'ERROR',
                        isHidden: tc.isHidden,
                        stderr: data.error
                    });
                    allPassed = false;
                } else {
                    const actualOut = data.stdout?.trim() || '';
                    const expectedOut = tc.expectedOutput?.trim() || '';
                    const passed = actualOut === expectedOut;

                    if (!passed) allPassed = false;

                    results.push({
                        id: tc.id,
                        input: tc.input,
                        expected: expectedOut,
                        actual: actualOut,
                        status: passed ? 'PASSED' : 'FAILED',
                        isHidden: tc.isHidden,
                        runtime: data.time,
                        memory: data.memory,
                        stderr: data.stderr
                    });
                }
            } catch (err: any) {
                results.push({
                    id: tc.id,
                    input: tc.input,
                    expected: tc.expectedOutput || '',
                    actual: 'SYSTEM_EXCEPTION',
                    status: 'ERROR',
                    isHidden: tc.isHidden,
                    stderr: err.message
                });
                allPassed = false;
            }
            setTestResults([...results]); // Update UI incrementally
        }

        setOverallStatus(allPassed ? 'success' : 'failure');
        setTesting(false);
    };

    const filteredQuestions = questions.filter(q =>
        q.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-blue-500" size={40} />
            </div>
        );
    }

    return (
        <div className="flex gap-8 h-[calc(100vh-8rem)]">
            {/* Left: Question List */}
            <div className="w-1/4 flex flex-col gap-6 h-full">
                <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col gap-4">
                    <div className="relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search problems..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold italic text-gray-800"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {filteredQuestions.map(q => (
                        <button
                            key={q.id}
                            onClick={() => handleQuestionSelect(q)}
                            className={`w-full text-left p-6 rounded-3xl border-2 transition-all flex items-center justify-between group ${selectedQuestion?.id === q.id
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white border-gray-100 text-gray-900 hover:border-indigo-200'
                                }`}
                        >
                            <div className="flex flex-col gap-1">
                                <span className={`text-[10px] font-black uppercase tracking-widest italic ${selectedQuestion?.id === q.id ? 'text-indigo-100' : 'text-gray-400'
                                    }`}>
                                    {q.difficulty}
                                </span>
                                <h3 className="font-black italic text-lg tracking-tight line-clamp-1">{q.title}</h3>
                            </div>
                            <ChevronRight size={20} className={selectedQuestion?.id === q.id ? 'text-white' : 'text-gray-300'} />
                        </button>
                    ))}
                </div>
            </div>

            {/* Right: Problem Tester Interface */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden">
                {selectedQuestion ? (
                    <>
                        {/* Editor Section */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-gray-200/30 flex flex-col overflow-hidden h-[60%]">
                            {/* Header */}
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-10 gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="p-2 bg-indigo-600 rounded-xl text-white shrink-0">
                                        <Code2 size={20} />
                                    </div>
                                    <div className="min-w-0">
                                        <h2 className="text-lg font-black italic tracking-tighter text-gray-950 uppercase truncate">
                                            {selectedQuestion.title}
                                        </h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="text-indigo-600 font-black italic text-[8px] uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded">
                                                ID: {selectedQuestion.id}
                                            </span>
                                            <span className="text-gray-400 font-bold italic text-[8px] uppercase tracking-widest">
                                                Sandbox Protocol
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                                        {LANGUAGES.map(lang => (
                                            <button
                                                key={lang}
                                                onClick={() => handleLanguageChange(lang)}
                                                className={`px-3 py-1.5 rounded-lg font-black italic uppercase tracking-widest text-[9px] transition-all ${selectedLanguage === lang
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                {lang === 'cpp' ? 'C++' : lang.toUpperCase()}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setEditorTheme(prev => prev === 'vs' ? 'vs-dark' : 'vs')}
                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100"
                                        title={editorTheme === 'vs' ? "Dark Mode" : "Light Mode"}
                                    >
                                        {editorTheme === 'vs' ? <Moon size={18} /> : <Sun size={18} />}
                                    </button>

                                    <button
                                        onClick={runTests}
                                        disabled={testing}
                                        className={`px-6 py-3 rounded-xl font-black italic uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-xl ${testing
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                            : 'bg-emerald-400 text-emerald-950 hover:bg-emerald-500 hover:scale-[1.02] active:scale-95 shadow-emerald-200/40'
                                            }`}
                                    >
                                        {testing ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} fill="currentColor" />}
                                        Run Diagnostics
                                    </button>
                                </div>
                            </div>

                            {/* Editor */}
                            <div className="flex-1 relative">
                                <Editor
                                    height="100%"
                                    language={selectedLanguage === 'cpp' ? 'cpp' : selectedLanguage === 'python' ? 'python' : selectedLanguage}
                                    theme={editorTheme}
                                    value={sourceCode}
                                    onChange={(val) => setSourceCode(val || '')}
                                    options={{
                                        fontSize: 16,
                                        fontWeight: 'bold',
                                        fontFamily: 'JetBrains Mono, monospace',
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        lineNumbers: 'on',
                                        renderLineHighlight: 'all',
                                        padding: { top: 20, bottom: 20 },
                                        automaticLayout: true,
                                        cursorSmoothCaretAnimation: "on"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Results Section */}
                        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-lg p-6 flex-1 flex flex-col overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-[10px] font-black italic text-gray-950 uppercase tracking-[0.2em] flex items-center gap-3">
                                    <Terminal size={18} /> Diagnostic Report
                                    {testResults.length > 0 && (
                                        <span className={`text-[10px] px-3 py-1 rounded-full border-2 ${overallStatus === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                            overallStatus === 'failure' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                                            }`}>
                                            {testResults.filter(r => r.status === 'PASSED').length} / {selectedQuestion.testCases.length} Passed
                                        </span>
                                    )}
                                </h3>
                                {overallStatus !== 'idle' && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex items-center gap-2 font-black italic uppercase text-xs tracking-widest ${overallStatus === 'running' ? 'text-indigo-500' :
                                            overallStatus === 'success' ? 'text-emerald-500' : 'text-red-500'
                                            }`}
                                    >
                                        {overallStatus === 'running' ? 'Scanning Matrix...' :
                                            overallStatus === 'success' ? 'All Systems Green' : 'Integrity Failure'}
                                        {overallStatus === 'success' ? <CheckCircle2 size={16} /> :
                                            overallStatus === 'failure' ? <AlertTriangle size={16} /> : null}
                                    </motion.div>
                                )}
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-8 custom-scrollbar">
                                {testResults.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3 grayscale opacity-50">
                                        <Terminal size={40} />
                                        <p className="font-black italic text-[10px] uppercase tracking-widest leading-none">Awaiting execution data</p>
                                    </div>
                                ) : (
                                    <div className="space-y-8 pb-12">
                                        {testResults.map((result, idx) => (
                                            <div
                                                key={result.id}
                                                className={`p-8 rounded-[2rem] border-2 transition-all ${result.status === 'PASSED'
                                                    ? 'bg-emerald-50/20 border-emerald-100/50'
                                                    : result.status === 'ERROR'
                                                        ? 'bg-amber-50/20 border-amber-100/50'
                                                        : 'bg-red-50/20 border-red-100/50'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-between mb-8">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black italic text-lg ${result.status === 'PASSED' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-200' : 'bg-red-500 text-white shadow-lg shadow-red-200'
                                                            }`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-lg font-black italic text-gray-950 uppercase leading-none tracking-tighter">
                                                                Test Case {idx + 1}
                                                            </h4>
                                                            <div className="flex items-center gap-3 mt-2">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-100 px-2 py-0.5 rounded-md">
                                                                    {result.isHidden ? 'Background' : 'Visible'}
                                                                </span>
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                    Time: {result.runtime || '0.00'}s
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border-2 ${result.status === 'PASSED'
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm'
                                                        : 'bg-red-100 text-red-700 border-red-200 shadow-sm'
                                                        }`}>
                                                        {result.status === 'PASSED' ? 'PASSED (STABLE)' : 'FAILED (DEGRADED)'}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 font-mono text-sm shadow-sm relative overflow-hidden group">
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <p className="text-gray-950 uppercase text-[10px] mb-3 font-black italic tracking-widest opacity-40">Input</p>
                                                        <pre className="text-indigo-600 font-bold whitespace-pre-wrap">{result.input}</pre>
                                                    </div>
                                                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 font-mono text-sm shadow-sm relative overflow-hidden group">
                                                        <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                        <p className="text-gray-950 uppercase text-[10px] mb-3 font-black italic tracking-widest opacity-40">Expected Output</p>
                                                        <pre className="text-emerald-600 font-bold whitespace-pre-wrap">{result.expected}</pre>
                                                    </div>
                                                    <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 font-mono text-sm shadow-sm relative overflow-hidden group">
                                                        <div className={`absolute top-0 left-0 w-1.5 h-full opacity-0 group-hover:opacity-100 transition-opacity ${result.status === 'PASSED' ? 'bg-emerald-500/50' : 'bg-red-500/50'}`}></div>
                                                        <p className="text-gray-950 uppercase text-[10px] mb-3 font-black italic tracking-widest opacity-40">Actual Output</p>
                                                        <pre className={`font-bold whitespace-pre-wrap ${result.status === 'PASSED' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {result.actual || 'NULL_BUFFER'}
                                                        </pre>
                                                    </div>
                                                </div>

                                                {result.stderr && (
                                                    <div className="mt-6 p-6 bg-red-950 rounded-2xl border border-red-900/50 font-mono text-xs overflow-x-auto shadow-2xl">
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                                                            <p className="text-red-400 font-black uppercase tracking-widest italic opacity-80">CRITICAL RUNTIME ERROR</p>
                                                        </div>
                                                        <pre className="text-red-100 whitespace-pre-wrap font-bold leading-relaxed">{result.stderr}</pre>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center p-12 text-center group">
                        <div className="w-32 h-32 bg-gray-50 rounded-[3rem] flex items-center justify-center text-gray-200 mb-8 transition-all group-hover:scale-110 group-hover:rotate-6 shadow-sm border border-gray-50">
                            <BookOpen size={64} />
                        </div>
                        <h3 className="text-2xl font-black italic tracking-tighter text-gray-400 uppercase">Initialize Testing Protocol</h3>
                        <p className="text-gray-300 font-bold italic text-sm uppercase tracking-widest mt-3 max-w-sm">
                            Select a challenge from the left cluster to begin verifying logic across the matrix.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
