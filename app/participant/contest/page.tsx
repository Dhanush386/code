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
    AlertCircle,
    CheckCircle2,
    XCircle,
    X,
    Loader2,
    Settings,
    LogOut,
    Sparkles,
    Moon,
    Sun,
    ArrowRight,
    Maximize2
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

    const [allQuestions, setAllQuestions] = useState<any[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [question, setQuestion] = useState<any>(null);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [transitionStatus, setTransitionStatus] = useState<'sync' | 'phase' | 'locked' | null>(null);
    const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'warning' }>({
        show: false,
        message: '',
        type: 'error'
    });

    // Fullscreen Detection
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        // Initial check (in case they navigated while in fullscreen)
        handleFullscreenChange();

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const enterFullscreen = () => {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch((err) => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        }
    };

    // Switch code when language or question changes
    useEffect(() => {
        if (!question?.id || !selectedLanguage) return;

        const participantData = localStorage.getItem('participant');
        if (participantData) {
            const p = JSON.parse(participantData);
            const draftKey = `codeRelay_draft_${p.id}_${question.id}_${selectedLanguage}`;
            const savedDraft = localStorage.getItem(draftKey);

            if (savedDraft) {
                setCodeValue(savedDraft);
            } else {
                setCodeValue(BOILERPLATES[selectedLanguage] || '');
            }
        }
    }, [selectedLanguage, question?.id]);

    // Update the local storage of code as the user types
    const handleCodeChange = (val: string | undefined) => {
        const newVal = val || '';
        setCodeValue(newVal);

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
                    const formattedQuestions = level.questions.map((lq: any) => {
                        const qData = lq.question;
                        const visibleTestCases = qData.testCases?.filter((tc: any) => !tc.isHidden) || [];
                        const allowedLanguages = qData.languages ? qData.languages.split(',').map((l: string) => l.trim()) : ['python'];

                        return {
                            ...qData,
                            sampleInput: qData.sampleInput || visibleTestCases[0]?.input || '',
                            sampleOutput: qData.sampleOutput || visibleTestCases[0]?.expectedOutput || '',
                            difficulty: `LEVEL 0${level.levelNumber} - ${level.exam.name.toUpperCase()}`,
                            allowedLanguages
                        };
                    });

                    setAllQuestions(formattedQuestions);
                    setQuestion(formattedQuestions[0]);
                    setSelectedLanguage(formattedQuestions[0].allowedLanguages[0]);
                    setCurrentLevel(level.levelNumber);
                    setTimeRemaining(level.timeLimit * 60);
                }
                setLoading(false);
            } catch (err: any) {
                setNotification({ show: true, message: err.message, type: 'error' });
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
        localStorage.removeItem('activeExamCode');
        setShowTimeUpModal(true);
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
    const switchQuestion = (index: number) => {
        if (index === activeIndex) return;
        setActiveIndex(index);
        setQuestion(allQuestions[index]);
        setSubmissionResult(null);
        setRunResult(null);

        const nextQ = allQuestions[index];
        if (!nextQ.allowedLanguages.includes(selectedLanguage)) {
            setSelectedLanguage(nextQ.allowedLanguages[0]);
        }
    };

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
                setNotification({ show: true, message: "KEYBOARD PASTE BLOCKED: Manual input is mandatory for this relay.", type: 'warning' });
            }

            // Detect Windows/Meta key
            if (e.key === 'Meta') {
                registerViolation("Windows/System Key Pressed");
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
            setNotification({ show: true, message: "AUTO-SUBMISSION TRIGGERED: Multiple violations detected.", type: 'error' });
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

            let levelActuallyUnlocked = false;

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

                    // Check if the level was actually incremented by the server
                    if (subData.currentLevel > currentLevel) {
                        levelActuallyUnlocked = true;
                    }

                    // Update local storage
                    const updatedP = {
                        ...participant,
                        score: subData.score,
                        currentLevel: subData.currentLevel
                    };
                    localStorage.setItem('participant', JSON.stringify(updatedP));
                }
            }

            setIsSubmitting(false);

            if (passed === tCount && tCount > 0) {
                setSubmissionResult('success');

                if (levelActuallyUnlocked) {
                    setTransitionStatus('phase');
                    setTimeout(() => {
                        localStorage.removeItem('activeExamCode');
                        router.push('/participant/exam-entry');
                    }, 3000);
                } else if (activeIndex < allQuestions.length - 1) {
                    // Automatically move to the next question in the phase
                    setTransitionStatus('sync');
                    setTimeout(() => {
                        setTransitionStatus(null);
                        setSubmissionResult(null);
                        switchQuestion(activeIndex + 1);
                    }, 3000);
                } else {
                    setTransitionStatus('locked');
                    setTimeout(() => {
                        setTransitionStatus(null);
                        setSubmissionResult(null);
                    }, 3000);
                }
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
                {/* Vertical Question Nav Rail */}
                <div className="w-20 bg-white border-r border-gray-100 flex flex-col items-center py-10 gap-6 z-10 shadow-[4px_0_10px_-5px_rgba(0,0,0,0.05)]">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest italic mb-2">Node</span>
                    {allQuestions.map((q, idx) => (
                        <button
                            key={q.id}
                            onClick={() => switchQuestion(idx)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all group relative ${activeIndex === idx
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-110'
                                : 'bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-500'
                                }`}
                        >
                            <span className="text-sm font-black italic">{idx + 1}</span>
                            {activeIndex === idx && (
                                <motion.div
                                    layoutId="nav-active"
                                    className="absolute -left-4 w-2 h-8 bg-indigo-600 rounded-r-full"
                                />
                            )}
                            <div className="absolute left-full ml-4 px-3 py-1 bg-gray-900 text-white text-[10px] font-black italic uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                {q.title}
                            </div>
                        </button>
                    ))}
                </div>

                {/* Question and Editor Area */}
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

                    {/* Right Panel: Editor */}
                    <div className="w-1/2 flex flex-col bg-white border-l border-gray-100 h-full overflow-hidden">
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
                                    setNotification({ show: true, message: "PASTE DETECTED: Manual input required for security protocols.", type: 'warning' });
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
                                            <h3 className="text-2xl font-black italic text-gray-950 uppercase tracking-tighter">All Signals Green ({question.points || 10}/{question.points || 10})</h3>
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
                                            <h3 className="text-2xl font-black italic text-gray-950 uppercase tracking-tighter">Partial Signal ({lastSubmissionScore}/{question.points || 10})</h3>
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
                                            <h3 className="text-2xl font-black italic text-gray-950 uppercase tracking-tighter">Signal Failed (0/{question.points || 10})</h3>
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
                </div>
            </div>

            {/* Main Content Area Ends */}

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
                {/* Time Expired Modal */}
                {showTimeUpModal && (
                    <motion.div
                        key="timeup-modal"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-950/60 backdrop-blur-xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center border-4 border-amber-500 shadow-2xl shadow-amber-500/20"
                        >
                            <div className="inline-flex p-6 bg-amber-50 text-amber-600 rounded-[2rem] border border-amber-100 mb-8 animate-pulse">
                                <Clock size={60} />
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4 uppercase">Phase Time Expired</h2>
                            <p className="text-gray-500 font-bold italic text-sm mb-10 uppercase tracking-widest leading-relaxed">
                                The relay window for this node has closed. You must now synchronize with the next level.
                            </p>
                            <button
                                onClick={() => router.push('/participant/exam-entry')}
                                className="w-full bg-amber-600 text-white py-5 rounded-3xl font-black italic uppercase tracking-widest text-sm hover:bg-amber-700 active:scale-95 transition-all shadow-xl shadow-amber-200 flex items-center justify-center gap-3"
                            >
                                Re-initialize Connection <ArrowRight size={20} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mandatory Fullscreen Overlay */}
            <AnimatePresence>
                {!isFullscreen && !loading && (
                    <motion.div
                        key="fullscreen-lock"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-gray-950/90 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center border-4 border-indigo-500 shadow-2xl shadow-indigo-500/20"
                        >
                            <div className="inline-flex p-6 bg-indigo-50 text-indigo-600 rounded-[2rem] border border-indigo-100 mb-8 animate-pulse">
                                <Maximize2 size={60} />
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4 uppercase">Signal Lost</h2>
                            <p className="text-gray-500 font-bold italic text-sm mb-10 uppercase tracking-widest leading-relaxed">
                                Mandatory proctoring protocol breached. Re-establish full-screen environment to continue the relay.
                            </p>
                            <button
                                onClick={enterFullscreen}
                                className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black italic uppercase tracking-widest text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3"
                            >
                                Synchronize Node <Sparkles size={20} />
                            </button>
                            <p className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] italic">
                                Unauthorized window transition detected
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Phase & Transition Modals */}
            <AnimatePresence>
                {transitionStatus && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-lg w-full text-center border-4 border-indigo-500 shadow-2xl shadow-indigo-500/20 relative overflow-hidden"
                        >
                            {/* Decorative scanline */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 animate-scanline" />

                            {transitionStatus === 'sync' && (
                                <>
                                    <div className="inline-flex p-6 bg-indigo-50 text-indigo-600 rounded-[2rem] border border-indigo-100 mb-8">
                                        <Zap size={60} className="animate-pulse" />
                                    </div>
                                    <h2 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4 uppercase">Protocol Synced</h2>
                                    <p className="text-gray-500 font-bold italic text-sm mb-0 uppercase tracking-widest leading-relaxed">
                                        Question mastered. Re-routing to next available challenge node...
                                    </p>
                                    <div className="mt-8 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 3, ease: "linear" }}
                                            className="h-full bg-indigo-600"
                                        />
                                    </div>
                                </>
                            )}

                            {transitionStatus === 'phase' && (
                                <>
                                    <div className="inline-flex p-6 bg-emerald-50 text-emerald-600 rounded-[2rem] border border-emerald-100 mb-8">
                                        <CheckCircle2 size={60} className="animate-bounce" />
                                    </div>
                                    <h2 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4 uppercase">Phase Complete</h2>
                                    <p className="text-gray-500 font-bold italic text-sm mb-4 uppercase tracking-widest leading-relaxed">
                                        All challenges in this node have been synchronized.
                                    </p>
                                    <p className="text-2xl font-black text-emerald-600 italic mb-8">
                                        PHASE UNLOCKED
                                    </p>
                                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: "100%" }}
                                            transition={{ duration: 3, ease: "linear" }}
                                            className="h-full bg-emerald-500"
                                        />
                                    </div>
                                </>
                            )}

                            {transitionStatus === 'locked' && (
                                <>
                                    <div className="inline-flex p-6 bg-orange-50 text-orange-600 rounded-[2rem] border border-orange-100 mb-8">
                                        <ShieldAlert size={60} />
                                    </div>
                                    <h2 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4 uppercase">Sync Incomplete</h2>
                                    <p className="text-gray-500 font-bold italic text-sm mb-0 uppercase tracking-widest leading-relaxed">
                                        Challenge mastered, but remaining node vulnerabilities detected. Complete all tasks to unlock the next phase.
                                    </p>
                                </>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Generic Notification Modal */}
            <AnimatePresence>
                {notification.show && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[400] flex items-center justify-center p-6 bg-gray-950/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-white rounded-[3rem] p-12 max-w-md w-full text-center border-4 border-gray-100 shadow-2xl"
                        >
                            <div className={`inline-flex p-6 rounded-[2rem] border mb-8 ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                notification.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' :
                                    'bg-orange-50 text-orange-600 border-orange-100'
                                }`}>
                                {notification.type === 'success' ? <CheckCircle2 size={60} /> :
                                    notification.type === 'error' ? <AlertCircle size={60} /> :
                                        <ShieldAlert size={60} />
                                }
                            </div>
                            <h2 className="text-4xl font-black italic tracking-tighter text-gray-950 mb-4 uppercase">
                                {notification.type === 'success' ? 'Synchronized' :
                                    notification.type === 'error' ? 'Critical Error' : 'System Notice'}
                            </h2>
                            <p className="text-gray-500 font-bold italic text-sm mb-10 uppercase tracking-widest leading-relaxed">
                                {notification.message}
                            </p>
                            <button
                                onClick={() => setNotification({ ...notification, show: false })}
                                className={`w-full py-5 rounded-3xl font-black italic uppercase tracking-widest text-sm transition-all shadow-xl active:scale-95 ${notification.type === 'success' ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200' :
                                    notification.type === 'error' ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-200' :
                                        'bg-orange-600 text-white hover:bg-orange-700 shadow-orange-200'
                                    }`}
                            >
                                Acknowledge
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
