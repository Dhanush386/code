'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Editor from '@monaco-editor/react';
import {
    Clock,
    Send,
    ChevronRight,
    ChevronLeft,
    ShieldAlert,
    Zap,
    Terminal,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    X,
    Loader2,
    Settings,
    LogOut,
    Sparkles,
    Moon,
    Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BOILERPLATES: Record<string, string> = {
    python: `# Write your solution here\nimport sys\n\ndef solve():\n    # Read input from sys.stdin\n    # line = sys.stdin.readline()\n    pass\n\nif __name__ == "__main__":\n    solve()`,
    c: `// Standard C Template\n#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
    cpp: `// Standard C++ Template\n#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
    java: `// Standard Java Template (Use Main as class name)\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`
};

export const dynamic = 'force-dynamic';

function ContestContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const code = searchParams.get('code');

    const [loading, setLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
    const [currentLevel, setCurrentLevel] = useState(1);
    const [violationCount, setViolationCount] = useState(0);
    const [showWarning, setShowWarning] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('python');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionResult, setSubmissionResult] = useState<null | 'success' | 'failure' | 'partial'>(null);
    const [totalScore, setTotalScore] = useState(0);
    const [teamName, setTeamName] = useState('TEAM_EXCALIBUR');
    const [passCount, setPassCount] = useState(0);
    const [totalTests, setTotalTests] = useState(0);
    const [runResult, setRunResult] = useState<{ userOutput: string; expectedOutput: string; isPassed: boolean } | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [lastSubmissionScore, setLastSubmissionScore] = useState(0);
    const [editorTheme, setEditorTheme] = useState<'vs' | 'vs-dark'>('vs');
    const [codeValue, setCodeValue] = useState(BOILERPLATES.python);

    // Track code per language locally
    const [languageCodes, setLanguageCodes] = useState<Record<string, string>>(BOILERPLATES);

    const [question, setQuestion] = useState<any>(null);

    // Switch code when language changes
    useEffect(() => {
        setCodeValue(languageCodes[selectedLanguage] || BOILERPLATES[selectedLanguage] || '');
    }, [selectedLanguage, languageCodes]);

    // Update the local storage of code as the user types
    const handleCodeChange = (val: string | undefined) => {
        const newVal = val || '';
        setCodeValue(newVal);
        setLanguageCodes(prev => ({
            ...prev,
            [selectedLanguage]: newVal
        }));

        // Persistent Save
        const participantData = localStorage.getItem('participant');
        if (participantData && question?.id) {
            const p = JSON.parse(participantData);
            const draftKey = `codeRelay_draft_${p.id}_${question.id}_${selectedLanguage}`;
            localStorage.setItem(draftKey, newVal);
        }
    };

    useEffect(() => {
        if (!code) return;

        const fetchData = async () => {
            try {
                const res = await fetch('/api/participant/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ accessCode: code })
                });

                const level = await res.json();
                if (!res.ok) throw new Error(level.error || 'Failed to initialize session');

                if (level.questions && level.questions.length > 0) {
                    const qData = level.questions[0].question;
                    const visibleTestCases = qData.testCases?.filter((tc: any) => !tc.isHidden) || [];

                    const allowedLanguages = qData.languages ? qData.languages.split(',').map((l: string) => l.trim()) : ['python'];

                    setQuestion({
                        ...qData,
                        sampleInput: qData.sampleInput || visibleTestCases[0]?.input || '',
                        sampleOutput: qData.sampleOutput || visibleTestCases[0]?.expectedOutput || '',
                        difficulty: `LEVEL 0${level.levelNumber} - ${level.exam.name.toUpperCase()}`,
                        allowedLanguages
                    });

                    setSelectedLanguage(allowedLanguages[0]);
                    setCurrentLevel(level.levelNumber);
                    setTimeRemaining(level.timeLimit * 60);
                } else {
                    throw new Error('No questions assigned to this level');
                }
                setLoading(false);
            } catch (err: any) {
                alert(err.message);
                router.push('/participant/exam-entry');
            }
        };

        fetchData();
    }, [code, router]);

    // Timer Logic
    useEffect(() => {
        if (timeRemaining <= 0) {
            handleTimeUp();
            return;
        }
        const timer = setInterval(() => {
            setTimeRemaining(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeRemaining]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTimeUp = () => {
        alert("Time Expired! Moving to next phase.");
        router.push('/participant/exam-entry');
    };

    const handleLogout = () => {
        if (confirm("Are you sure you want to logout? The timer will continue if you leave!")) {
            localStorage.removeItem('participant');
            localStorage.removeItem('activeExamCode');
            router.push('/participant/login');
        }
    };

    // Load initial stats
    useEffect(() => {
        const participantData = localStorage.getItem('participant');
        if (participantData) {
            const p = JSON.parse(participantData);
            setTeamName(p.teamName || 'CONTESTANT');
            setTotalScore(p.score || 0);

            const fetchRealStats = async () => {
                try {
                    const res = await fetch(`/api/participant/profile/${p.id}`);
                    if (res.ok) {
                        const latest = await res.json();
                        setTotalScore(latest.score || 0);
                        localStorage.setItem('participant', JSON.stringify(latest));
                    }
                } catch (err) {
                    console.error('Failed to sync server stats:', err);
                }
            };
            fetchRealStats();
        }
    }, []);

    // Load Draft logic
    useEffect(() => {
        if (!question?.id || !selectedLanguage) return;

        const participantData = localStorage.getItem('participant');
        if (participantData) {
            const p = JSON.parse(participantData);
            const draftKey = `codeRelay_draft_${p.id}_${question.id}_${selectedLanguage}`;
            const savedDraft = localStorage.getItem(draftKey);

            if (savedDraft) {
                setCodeValue(savedDraft);
                setLanguageCodes(prev => ({
                    ...prev,
                    [selectedLanguage]: savedDraft
                }));
            }
        }
    }, [question?.id, selectedLanguage]);

    // Anti-Cheat & Heartbeat Logic
    useEffect(() => {
        const participantData = localStorage.getItem('participant');
        if (!participantData) {
            router.push('/participant/login');
            return;
        }

        const participant = JSON.parse(participantData);

        // Initial heartbeat and mark as started
        const sendHeartbeat = async () => {
            try {
                await fetch('/api/participant/heartbeat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ participantId: participant.id })
                });
            } catch (error) {
                console.error('Heartbeat failed:', error);
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                registerViolation("Window Switch Detected");
            }
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            // Block Ctrl+V or Cmd+V (for Mac)
            if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
                e.preventDefault();
                alert("KEYBOARD PASTE BLOCKED: Manual input is mandatory for this relay.");
            }
        };

        sendHeartbeat();
        const interval = setInterval(sendHeartbeat, 30000); // 30s pulse

        window.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            clearInterval(interval);
            window.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [router]); // Only run once on mount (and if router changes)

    // Separate effect for violation enforcement to avoid side-effects during render
    useEffect(() => {
        if (violationCount >= 3) {
            alert("AUTO-SUBMISSION TRIGGERED: Multiple violations detected.");
            router.push('/participant/exam-entry');
        }
    }, [violationCount, router]);

    const registerViolation = useCallback((msg: string) => {
        console.log(`Violation: ${msg}`);
        setViolationCount(prev => prev + 1);
        setShowWarning(true);
    }, []);

    const handleRun = async () => {
        setIsRunning(true);
        setRunResult(null);

        try {
            const res = await fetch('/api/execute', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    source_code: codeValue,
                    language: selectedLanguage,
                    stdin: question.sampleInput || ''
                })
            });

            const data = await res.json();
            setIsRunning(false);

            if (data.error) throw new Error(data.error);

            const userOutput = data.stdout || data.stderr || data.compile_output || 'No output generated.';
            const expected = question.sampleOutput.trim();
            const isPassed = data.status?.id === 3 && (data.stdout?.trim() === expected);

            setRunResult({
                userOutput: userOutput.trim(),
                expectedOutput: expected,
                isPassed: isPassed
            });
        } catch (err: any) {
            setIsRunning(false);
            setRunResult({
                userOutput: `Error: ${err.message}`,
                expectedOutput: question.sampleOutput,
                isPassed: false
            });
        }
    };

    const [submissionProgress, setSubmissionProgress] = useState('');

    const handleSubmit = async () => {
        setIsSubmitting(true);
        setSubmissionResult(null);
        setSubmissionProgress('Preparing vectors...');

        try {
            const allTests = question.testCases || [];
            const tCount = allTests.length;
            setTotalTests(tCount);

            let passed = 0;

            // Execute each test case sequentially for real validation
            for (let i = 0; i < allTests.length; i++) {
                const tc = allTests[i];
                setSubmissionProgress(`Auditing Matrix ${i + 1}/${tCount}...`);
                const res = await fetch('/api/execute', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        source_code: codeValue,
                        language: selectedLanguage,
                        stdin: tc.input || ''
                    })
                });

                const data = await res.json();
                if (data.status?.id === 3 && data.stdout?.trim() === tc.expectedOutput?.trim()) {
                    passed++;
                }
            }

            setPassCount(passed);
            const totalMarks = question.points || 10;
            const questScore = tCount > 0 ? Math.round((passed / tCount) * totalMarks) : 0;
            setLastSubmissionScore(questScore);

            // Persist to DB
            const participantData = localStorage.getItem('participant');
            if (participantData) {
                const participant = JSON.parse(participantData);
                const subRes = await fetch('/api/participant/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        participantId: participant.id,
                        questionId: question.id,
                        score: questScore,
                        levelNumber: currentLevel,
                        timeTaken: 1800 - timeRemaining,
                        isPassed: passed === tCount && tCount > 0,
                        code: codeValue,
                        language: selectedLanguage
                    })
                });

                if (subRes.ok) {
                    const subData = await subRes.json();
                    setTotalScore(subData.score);
                    // Update local storage
                    const updatedP = { ...participant, score: subData.score };
                    localStorage.setItem('participant', JSON.stringify(updatedP));
                }
            }

            setIsSubmitting(false);

            if (passed === tCount && tCount > 0) {
                setSubmissionResult('success');
                setTimeout(() => {
                    alert(`ULTIMATE VICTORY! Score: ${questScore}/100. Level Unlocked.`);
                    router.push('/participant/exam-entry');
                }, 3000);
            } else if (passed > 0) {
                setSubmissionResult('partial');
            } else {
                setSubmissionResult('failure');
            }
        } catch (err: any) {
            setIsSubmitting(false);
            setSubmissionResult('failure');
            console.error('Submission error:', err);
        }
    };

    if (loading || !question) {
        return (
            <div className="h-screen bg-white flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-6">
                    <Loader2 className="animate-spin text-indigo-500" size={60} />
                    <div className="text-center">
                        <h2 className="text-2xl font-black italic tracking-tighter text-gray-950 uppercase">Syncing with Relay Node</h2>
                        <p className="text-gray-400 font-bold italic text-xs uppercase tracking-widest mt-2">Initializing secure contest environment...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="h-screen bg-gray-50 flex flex-col overflow-hidden font-sans select-none"
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Header */}
            <header className="bg-white border-b border-gray-100 flex items-center justify-between px-8 py-3">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                            <Zap size={18} fill="currentColor" />
                        </div>
                        <span className="font-black italic tracking-tighter text-gray-950 uppercase">Code Relay</span>
                    </div>

                    <div className="h-4 w-[1px] bg-gray-200" />

                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-gray-400 italic uppercase tracking-widest">Contestant</span>
                        <span className="font-bold italic text-gray-900 border-b-2 border-indigo-200">{teamName}</span>
                    </div>

                    <div className="h-4 w-[1px] bg-gray-200" />

                    <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100 shadow-sm">
                        <Sparkles size={14} className="animate-pulse" />
                        <span className="text-[10px] font-black italic uppercase tracking-widest">Score Cluster</span>
                        <span className="text-sm font-black italic text-indigo-700 ml-1">{totalScore} PTS</span>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    {/* Violation Badge */}
                    {violationCount > 0 && (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
                            <ShieldAlert size={14} />
                            <span className="text-[10px] font-black italic uppercase tracking-widest">Protocol Warning {violationCount}/3</span>
                        </div>
                    )}

                    <div className={`flex items-center gap-3 px-6 py-2 rounded-2xl border-2 transition-all ${timeRemaining < 300 ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-950 border-gray-800 text-white'}`}>
                        <Clock size={18} className={timeRemaining < 300 ? 'animate-pulse' : ''} />
                        <span className="text-xl font-mono font-black tracking-widest">{formatTime(timeRemaining)}</span>
                    </div>

                    <div className="h-6 w-[1px] bg-gray-200" />

                    <button
                        onClick={handleLogout}
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-gray-100 group"
                        title="Logout Session"
                    >
                        <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Question */}
                <div className="w-1/2 overflow-y-auto p-10 border-r border-gray-100 bg-white">
                    <div className="max-w-2xl mx-auto space-y-10">
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black italic uppercase tracking-widest border border-indigo-100">
                                {question.difficulty}
                            </span>
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black italic uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                                <Sparkles size={10} /> {question.points || 10} Marks
                            </span>
                        </div>
                        <h1 className="text-4xl font-black italic tracking-tighter text-gray-950 mt-4 uppercase uppercase">
                            {question.title}
                        </h1>
                    </div>

                    <div className="space-y-6">
                        <div className="prose prose-slate prose-lg font-bold italic text-gray-600 leading-relaxed">
                            {question.description}
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 italic">Input Constrain</h4>
                                <p className="font-bold italic text-gray-950 text-sm leading-relaxed">{question.inputFormat}</p>
                            </div>
                            <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 italic">Output Constrain</h4>
                                <p className="font-bold italic text-gray-950 text-sm leading-relaxed">{question.outputFormat}</p>
                            </div>
                            {question.constraints && (
                                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                                    <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3 italic">Constraints</h4>
                                    <p className="font-bold italic text-gray-950 text-sm leading-relaxed">{question.constraints}</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest italic ml-1 flex items-center gap-2">
                                <Terminal size={14} /> Test cases
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 font-mono text-sm shadow-sm">
                                    <p className="text-gray-900 uppercase text-[10px] mb-2 font-black italic">Input</p>
                                    <pre className="text-indigo-600 font-bold">{question.sampleInput}</pre>
                                </div>
                                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 font-mono text-sm shadow-sm">
                                    <p className="text-gray-900 uppercase text-[10px] mb-2 font-black italic">Output</p>
                                    <pre className="text-emerald-600 font-bold">{question.sampleOutput}</pre>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Editor */}
            <div className="w-1/2 flex flex-col bg-white border-l border-gray-100">
                {/* Editor Toolbar */}
                <div className="h-14 bg-white border-b border-gray-100 flex items-center justify-between px-6">
                    <div className="flex gap-1 bg-gray-50 p-1 rounded-xl border border-gray-100">
                        {(question.allowedLanguages || ['python']).map((lang: string) => (
                            <button
                                key={lang}
                                onClick={() => setSelectedLanguage(lang)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black italic uppercase tracking-widest transition-all ${selectedLanguage === lang ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                                    }`}
                            >
                                {lang === 'cpp' ? 'C++' : lang}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setEditorTheme(prev => prev === 'vs' ? 'vs-dark' : 'vs')}
                            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100 group"
                            title={editorTheme === 'vs' ? "Switch to Dark Node" : "Switch to Light Node"}
                        >
                            {editorTheme === 'vs' ? <Moon size={18} /> : <Sun size={18} />}
                        </button>

                        <button className="text-gray-400 hover:text-indigo-600 transition-colors p-2">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 relative flex flex-col overflow-hidden">
                    <div
                        className={`transition-all duration-500 ${runResult ? 'h-1/2' : 'h-full'}`}
                        onPaste={(e) => {
                            e.preventDefault();
                            alert("PASTE DETECTED: Manual input required for security protocols.");
                        }}
                    >
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            language={selectedLanguage}
                            theme={editorTheme}
                            value={codeValue}
                            onChange={handleCodeChange}
                            options={{
                                fontSize: 16,
                                fontWeight: 'bold',
                                fontFamily: 'JetBrains Mono, Menlo, monospace',
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                lineNumbers: 'on',
                                padding: { top: 20 },
                                smoothScrolling: true,
                                cursorSmoothCaretAnimation: "on"
                            }}
                        />
                    </div>

                    {/* Overlays and Run Results */}
                    <AnimatePresence>
                        {runResult && (
                            <motion.div
                                key="run-result"
                                initial={{ height: 0 }}
                                animate={{ height: '50%' }}
                                exit={{ height: 0 }}
                                className="bg-white border-t-4 border-indigo-500 overflow-hidden flex flex-col"
                            >
                                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                    <div className="flex items-center gap-4">
                                        <h4 className="text-[10px] font-black italic uppercase tracking-widest text-gray-950 flex items-center gap-2">
                                            <Terminal size={14} /> Execution Result
                                        </h4>
                                        <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${runResult.isPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                                            {runResult.isPassed ? 'PASSED (STABLE)' : 'FAILED (DEGRADED)'}
                                        </div>
                                    </div>
                                    <button onClick={() => setRunResult(null)} className="text-gray-400 hover:text-gray-600 font-black text-xs uppercase italic">Close</button>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-px bg-gray-100 p-px">
                                    <div className="bg-white p-6 flex flex-col min-w-0">
                                        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest italic mb-3">Your Output</p>
                                        <pre className="flex-1 bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-800 overflow-auto border border-gray-100 italic font-bold">
                                            {runResult.userOutput}
                                        </pre>
                                    </div>
                                    <div className="bg-white p-6 flex flex-col min-w-0">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic mb-3">Expected Output</p>
                                        <pre className="flex-1 bg-gray-50 rounded-xl p-4 font-mono text-sm text-gray-800 overflow-auto border border-gray-100 italic font-bold">
                                            {runResult.expectedOutput}
                                        </pre>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {isSubmitting && (
                            <motion.div
                                key="submitting-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
                            >
                                <Loader2 className="text-indigo-500 animate-spin mb-6" size={60} />
                                <h3 className="text-2xl font-black italic text-gray-950 uppercase tracking-tighter">Evaluating Vector...</h3>
                                <p className="text-blue-400 font-bold italic text-xs uppercase tracking-widest mt-2">{submissionProgress}</p>
                            </motion.div>
                        )}

                        {isRunning && (
                            <motion.div
                                key="running-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
                            >
                                <Loader2 className="text-emerald-500 animate-spin mb-6" size={60} />
                                <h3 className="text-2xl font-black italic text-gray-950 uppercase tracking-tighter">Running Case...</h3>
                            </motion.div>
                        )}

                        {submissionResult === 'success' && (
                            <motion.div
                                key="success-overlay"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-3xl p-8 border-4 border-emerald-500 shadow-2xl shadow-emerald-500/20 z-[60] flex items-center gap-6"
                            >
                                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <CheckCircle2 size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic text-gray-950 uppercase tracking-tighter">All Signals Green (100/100)</h3>
                                    <p className="text-gray-400 font-bold italic text-sm uppercase tracking-widest">Perfect signature match. Access granted to next node.</p>
                                </div>
                            </motion.div>
                        )}

                        {submissionResult === 'partial' && (
                            <motion.div
                                key="partial-overlay"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-3xl p-8 border-4 border-amber-500 shadow-2xl shadow-amber-500/20 z-[60] flex items-center gap-6"
                            >
                                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl">
                                    <Zap size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic text-gray-950 uppercase tracking-tighter">Partial Signal ({lastSubmissionScore}/100)</h3>
                                    <p className="text-gray-400 font-bold italic text-sm uppercase tracking-widest">{passCount}/{totalTests} protocols validated. Correction required for full sync.</p>
                                </div>
                                <button onClick={() => setSubmissionResult(null)} className="ml-4 p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            </motion.div>
                        )}

                        {submissionResult === 'failure' && (
                            <motion.div
                                key="failure-overlay"
                                initial={{ y: 50, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-white rounded-3xl p-8 border-4 border-red-500 shadow-2xl shadow-red-500/20 z-[60] flex items-center gap-6"
                            >
                                <div className="p-4 bg-red-50 text-red-600 rounded-2xl">
                                    <AlertTriangle size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black italic text-gray-950 uppercase tracking-tighter">Signal Failed (0/100)</h3>
                                    <p className="text-gray-400 font-bold italic text-sm uppercase tracking-widest">No matching frequencies detected. Trace logic and retry.</p>
                                </div>
                                <button onClick={() => setSubmissionResult(null)} className="ml-4 p-2 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-8 bg-white border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleRun}
                            disabled={isRunning || isSubmitting}
                            className="px-6 py-3 bg-emerald-400 text-emerald-950 rounded-2xl font-black italic uppercase tracking-widest text-xs border-2 border-emerald-300 hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-md shadow-emerald-100"
                        >
                            {isRunning ? 'Executing...' : 'Run'}
                        </button>
                    </div>

                    <button
                        onClick={handleSubmit}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black italic uppercase tracking-widest text-sm hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-3 shadow-xl shadow-indigo-900/50"
                    >
                        Submit <Send size={18} />
                    </button>
                </div>
            </div>

            {/* Cheating Warning Modal */}
            <AnimatePresence>
                {showWarning && (
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-red-950/40 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center border-4 border-red-500 shadow-2xl shadow-red-500/20"
                        >
                            <div className="inline-flex p-6 bg-red-50 text-red-600 rounded-[2rem] border border-red-100 mb-8 animate-bounce">
                                <AlertTriangle size={60} />
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4 uppercase">Protocol Violation</h2>
                            <p className="text-gray-500 font-bold italic text-sm mb-10 uppercase tracking-widest leading-relaxed">
                                Critical Warning: Outside activity detected. Repeated violations ({violationCount}/3) will result in immediate disqualification.
                            </p>
                            <button
                                onClick={() => setShowWarning(false)}
                                className="w-full bg-red-600 text-white py-5 rounded-3xl font-black italic uppercase tracking-widest text-sm hover:bg-red-700 active:scale-95 transition-all shadow-xl shadow-red-200"
                            >
                                I Acknowledge & Return
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function ContestInterface() {
    return (
        <Suspense fallback={
            <div className="h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={60} />
            </div>
        }>
            <ContestContent />
        </Suspense>
    );
}
