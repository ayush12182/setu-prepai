import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTestQuestions, ChapterSelection } from '@/hooks/useTestQuestions';
import { Question } from '@/hooks/usePracticeQuestions';
import TestResults from '@/components/practice/TestResults';
import { TestAnswer } from '@/components/practice/TestModeQuiz';
import { Loader2, AlertCircle, Info, HelpCircle, ArrowLeft, BookOpen, PenTool, X, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { JeeQuestion, JeeOption } from '@/lib/jeeMathRenderer';
import { useAuth } from '@/contexts/AuthContext';

interface TestConfig {
  type: 'chapter' | 'mixed' | 'pyq' | 'adaptive';
  chapters?: ChapterSelection[];
  subject?: string;
  yearRange?: { start: number; end: number };
  questionCount?: number;
  timeLimitSeconds?: number;
}

interface TestExecutionProps {
  config: TestConfig;
  onComplete: () => void;
  onExit: () => void;
}

// Scratchpad Canvas drawing component
const Scratchpad: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Line styles
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#08111f';
    ctx.lineWidth = 3;
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const startDrawingTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const drawTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-80 bg-white border border-slate-350 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-800 animate-in slide-in-from-bottom duration-250">
      <div className="bg-slate-100 border-b border-slate-300 p-3 flex justify-between items-center shrink-0">
        <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-blue-600" /> Scratchpad (Draw below)
        </span>
        <div className="flex gap-2">
          <button 
            onClick={clearCanvas}
            className="text-[9px] font-black uppercase text-slate-500 hover:text-slate-800 bg-white border border-slate-300 rounded px-2 py-1"
          >
            Clear
          </button>
          <button onClick={onClose} className="text-slate-450 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={384}
        height={260}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawingTouch}
        onTouchMove={drawTouch}
        onTouchEnd={stopDrawing}
        className="flex-1 bg-white cursor-crosshair touch-none"
      />
    </div>
  );
};

// Static formulas sheets indexed by chapter topics
const getTopicFormulas = (chapterName: string) => {
  const name = chapterName.toLowerCase();
  if (name.includes('motion') || name.includes('kinematics')) {
    return [
      { name: 'First Equation of Motion', formula: 'v = u + at' },
      { name: 'Second Equation of Motion', formula: 's = ut + 1/2 at²' },
      { name: 'Third Equation of Motion', formula: 'v² = u² + 2as' },
      { name: 'Displacement in n-th Second', formula: 's_n = u + a/2(2n - 1)' },
      { name: 'Average Speed (equal time)', formula: 'v_avg = (v₁ + v₂)/2' }
    ];
  }
  if (name.includes('rotation') || name.includes('rotational')) {
    return [
      { name: 'Torque equation', formula: 'τ = Iα' },
      { name: 'Angular Momentum', formula: 'L = Iω = r × p' },
      { name: 'Rotational Kinetic Energy', formula: 'K_rot = 1/2 Iω²' },
      { name: 'Parallel Axis Theorem', formula: 'I = I_cm + Md²' },
      { name: 'Pure Rolling velocity', formula: 'v_cm = Rω' }
    ];
  }
  if (name.includes('electrostatics') || name.includes('capacitance')) {
    return [
      { name: 'Coulombs Force', formula: 'F = k q₁q₂ / r²' },
      { name: 'Electric Potential', formula: 'V = k q / r' },
      { name: 'Gauss Law Flux', formula: 'Φ = ∮ E·dA = q_in / ε₀' },
      { name: 'Capacitance value', formula: 'C = Q / V = ε₀ A / d' },
      { name: 'Energy stored in Capacitor', formula: 'U = 1/2 C V²' }
    ];
  }
  return [
    { name: 'Newton\'s Second Law', formula: 'F = ma' },
    { name: 'Work Done by Force', formula: 'W = F·d cosθ' },
    { name: 'Kinetic Energy', formula: 'K = 1/2 mv²' },
    { name: 'Potential Energy (Gravity)', formula: 'U = mgh' }
  ];
};

const TestExecution: React.FC<TestExecutionProps> = ({
  config,
  onComplete,
  onExit
}) => {
  const { profile } = useAuth();
  const candidateName = profile?.full_name || 'Student';

  const [step, setStep] = useState<'loading' | 'details' | 'instructions' | 'quiz' | 'results'>('loading');
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [fetchDone, setFetchDone] = useState(false);

  // Active quiz state variables
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<Map<number, 'A' | 'B' | 'C' | 'D'>>(new Map());
  const [statuses, setStatuses] = useState<Map<number, 'answered' | 'not_answered' | 'not_visited' | 'marked' | 'answered_marked'>>(new Map());

  // Clock state
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);

  // Confidence state map: index -> 'guess' | 'maybe' | 'sure'
  const [confidenceMap, setConfidenceMap] = useState<Map<number, 'guess' | 'maybe' | 'sure'>>(new Map());

  // Popup control flags
  const [showFormulaDrawer, setShowFormulaDrawer] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<'syllabus' | 'marking' | null>('syllabus');
  const [declarationChecked, setDeclarationChecked] = useState(false);

  const [syllabusModalText, setSyllabusModalText] = useState<string | null>(null);

  // Point Loss Analyzer specific triggers
  const [isFixPlanActive, setIsFixPlanActive] = useState(false);

  const {
    questions,
    loading,
    error,
    generationMode,
    fetchMixedTestQuestions,
    fetchPYQQuestions,
    fetchAdaptiveQuestions,
    recordAttempt
  } = useTestQuestions();

  const loadQuestions = async () => {
    setFetchDone(false);
    let result;
    const count = config.questionCount || 25;

    switch (config.type) {
      case 'chapter':
        if (config.chapters && config.chapters.length > 0) {
          result = await fetchMixedTestQuestions(config.chapters, 15);
        }
        break;
      case 'mixed':
        if (config.chapters && config.chapters.length > 0) {
          result = await fetchMixedTestQuestions(config.chapters, 5);
        }
        break;
      case 'pyq':
        result = await fetchPYQQuestions(
          config.subject,
          config.chapters?.[0]?.chapterId,
          config.yearRange,
          count
        );
        break;
      case 'adaptive':
        result = await fetchAdaptiveQuestions(count);
        break;
    }

    if (result && result.length > 0) {
      const initialStatuses = new Map<number, 'answered' | 'not_answered' | 'not_visited' | 'marked' | 'answered_marked'>();
      initialStatuses.set(0, 'not_answered');
      for (let i = 1; i < result.length; i++) {
        initialStatuses.set(i, 'not_visited');
      }
      setStatuses(initialStatuses);
      
      const durationSeconds = config.timeLimitSeconds || (result.length * 2 * 60);
      setTimeLeftSeconds(durationSeconds);
      setStep('details');
    }
    setFetchDone(true);
  };

  useEffect(() => {
    loadQuestions();
  }, [config]);

  // Clock countdown ticker
  useEffect(() => {
    if (step !== 'quiz' || timeLeftSeconds <= 0) return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [step, timeLeftSeconds]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTestTitle = () => {
    switch (config.type) {
      case 'chapter':
        return config.chapters?.[0]?.chapterName || 'Chapter Test';
      case 'mixed':
        return `Mixed Test (${config.chapters?.length || 0} chapters)`;
      case 'pyq':
        return `PYQ Test ${config.yearRange ? `(${config.yearRange.start}-${config.yearRange.end})` : ''}`;
      default:
        return 'Full Mock Test';
    }
  };

  const getSubjectName = () => {
    if (config.chapters?.[0]?.subject) {
      return config.chapters[0].subject.toUpperCase();
    }
    return 'PHYSICS';
  };

  const getSubjectLabel = () => {
    const subject = config.subject || config.chapters?.[0]?.subject || 'physics';
    const subLower = subject.toLowerCase();
    if (subLower.includes('physics')) return 'Physics';
    if (subLower.includes('chemistry')) return 'Chemistry';
    return 'Mathematics';
  };

  const handleJumpToQuestion = (targetIndex: number) => {
    setStatuses(prev => {
      const nextStatuses = new Map(prev);
      const currentStatus = nextStatuses.get(currentIndex);
      
      if (currentStatus === 'not_visited') {
        nextStatuses.set(currentIndex, 'not_answered');
      }
      
      if (nextStatuses.get(targetIndex) === 'not_visited') {
        nextStatuses.set(targetIndex, 'not_answered');
      }
      return nextStatuses;
    });

    setCurrentIndex(targetIndex);
    setSelectedOption(savedAnswers.get(targetIndex) || null);
  };

  const handleClearResponse = () => {
    setSavedAnswers(prev => {
      const nextAnswers = new Map(prev);
      nextAnswers.delete(currentIndex);
      return nextAnswers;
    });
    setSelectedOption(null);
    setConfidenceMap(prev => {
      const nextConf = new Map(prev);
      nextConf.delete(currentIndex);
      return nextConf;
    });
    setStatuses(prev => {
      const nextStatuses = new Map(prev);
      nextStatuses.set(currentIndex, 'not_answered');
      return nextStatuses;
    });
    toast.info("Response cleared.");
  };

  const handleSaveAndNext = () => {
    setStatuses(prev => {
      const nextStatuses = new Map(prev);
      if (selectedOption) {
        setSavedAnswers(prevAnswers => {
          const nextAnswers = new Map(prevAnswers);
          nextAnswers.set(currentIndex, selectedOption);
          return nextAnswers;
        });
        nextStatuses.set(currentIndex, 'answered');
      } else {
        setSavedAnswers(prevAnswers => {
          const nextAnswers = new Map(prevAnswers);
          nextAnswers.delete(currentIndex);
          return nextAnswers;
        });
        nextStatuses.set(currentIndex, 'not_answered');
      }
      return nextStatuses;
    });

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setStatuses(prev => {
        const nextStatuses = new Map(prev);
        if (nextStatuses.get(nextIdx) === 'not_visited') {
          nextStatuses.set(nextIdx, 'not_answered');
        }
        return nextStatuses;
      });
      setCurrentIndex(nextIdx);
      setSelectedOption(savedAnswers.get(nextIdx) || null);
    } else {
      toast.info("Last question. Click Submit on the bottom right to complete the test.");
    }
  };

  const handleMarkForReviewAndNext = () => {
    setStatuses(prev => {
      const nextStatuses = new Map(prev);
      if (selectedOption) {
        setSavedAnswers(prevAnswers => {
          const nextAnswers = new Map(prevAnswers);
          nextAnswers.set(currentIndex, selectedOption);
          return nextAnswers;
        });
        nextStatuses.set(currentIndex, 'answered_marked');
      } else {
        setSavedAnswers(prevAnswers => {
          const nextAnswers = new Map(prevAnswers);
          nextAnswers.delete(currentIndex);
          return nextAnswers;
        });
        nextStatuses.set(currentIndex, 'marked');
      }
      return nextStatuses;
    });

    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setStatuses(prev => {
        const nextStatuses = new Map(prev);
        if (nextStatuses.get(nextIdx) === 'not_visited') {
          nextStatuses.set(nextIdx, 'not_answered');
        }
        return nextStatuses;
      });
      setCurrentIndex(nextIdx);
      setSelectedOption(savedAnswers.get(nextIdx) || null);
    } else {
      toast.info("Marked for review. Click Submit to finish.");
    }
  };

  const handleConfidenceSelect = (rating: 'guess' | 'maybe' | 'sure') => {
    setConfidenceMap(prev => {
      const nextConf = new Map(prev);
      nextConf.set(currentIndex, rating);
      return nextConf;
    });
    toast.success(`Confidence set to: ${rating.toUpperCase()}`);
  };

  const handleSubmitTest = useCallback(() => {
    const limit = config.timeLimitSeconds || (questions.length * 2 * 60);
    const timeSpent = limit - timeLeftSeconds;
    const avgTimePerQ = Math.round(timeSpent / questions.length);

    const quizAnswers: TestAnswer[] = questions.map((q, idx) => {
      const choice = savedAnswers.get(idx) || null;
      const correct = choice === ((q as any).correct_option || q.answer);

      if (choice) {
        recordAttempt(q.id, choice, correct, avgTimePerQ);
      }

      return {
        question: q,
        selectedOption: choice,
        isCorrect: correct,
        timeTakenSeconds: avgTimePerQ
      };
    });

    setTestAnswers(quizAnswers);
    setTotalTime(timeSpent);
    setStep('results');
  }, [questions, savedAnswers, timeLeftSeconds, config, recordAttempt]);

  const handleRetry = async () => {
    setStep('loading');
    setTestAnswers([]);
    setTotalTime(0);
    setFetchDone(false);
    setCurrentIndex(0);
    setSelectedOption(null);
    setSavedAnswers(new Map());
    setDeclarationChecked(false);
    setConfidenceMap(new Map());
    setIsFixPlanActive(false);
    await loadQuestions();
  };

  // State stats computation
  const countAnswered = Array.from(statuses.values()).filter(s => s === 'answered').length;
  const countNotAnswered = Array.from(statuses.values()).filter(s => s === 'not_answered').length;
  const countNotVisited = Array.from(statuses.values()).filter(s => s === 'not_visited').length;
  const countMarked = Array.from(statuses.values()).filter(s => s === 'marked').length;
  const countAnsweredMarked = Array.from(statuses.values()).filter(s => s === 'answered_marked').length;

  // Predict accuracy based on user confidence weighting
  const getPredictedAccuracy = () => {
    if (countAnswered === 0) return 0;
    let weightSum = 0;
    savedAnswers.forEach((_, idx) => {
      const confidence = confidenceMap.get(idx) || 'maybe';
      if (confidence === 'sure') weightSum += 90;
      else if (confidence === 'maybe') weightSum += 60;
      else weightSum += 25; // guess
    });
    return Math.round(weightSum / Math.max(1, savedAnswers.size));
  };

  // Error screen
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 max-w-sm mx-auto">
        <AlertCircle className="w-10 h-10 text-destructive" />
        <p className="text-sm text-destructive">{error}</p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onExit}>Exit</Button>
          <Button onClick={handleRetry}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading || !fetchDone || step === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-20 max-w-md mx-auto text-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <div>
          <p className="text-sm font-bold text-white uppercase tracking-wider">Loading Mock Test Details</p>
          <p className="text-xs text-slate-400 mt-1">Generating mock candidate questions matching official standards...</p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 1: TEST DETAILS VIEW (SCREENSHOT 1)
  // =========================================================================
  if (step === 'details') {
    const totalScoreValue = questions.length * 4;
    const testDurationMinutes = config.questionCount === 90 ? 180 : 50;

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-6 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onExit}
              className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
                <h2 className="text-xl font-bold text-slate-850">{getTestTitle()}</h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                Release Date: 15 Apr, 9:00 am
              </span>
            </div>
          </div>
          
          <Button 
            onClick={() => setStep('instructions')}
            className="bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs px-6 py-2.5 rounded-lg uppercase tracking-wider border-none"
          >
            Attempt Test
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center text-[#FF6B00] font-black text-sm">
              ?
            </div>
            <div>
              <span className="text-[9px] text-slate-455 font-bold uppercase tracking-widest block">Total Qs</span>
              <span className="text-xl font-black text-slate-800">{questions.length} <span className="text-xs text-slate-500 font-medium">Qs</span></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 font-black text-sm">
              🕒
            </div>
            <div>
              <span className="text-[9px] text-slate-455 font-bold uppercase tracking-widest block">Test Duration</span>
              <span className="text-xl font-black text-slate-800">{testDurationMinutes} <span className="text-xs text-slate-500 font-medium">min</span></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-black text-sm">
              A+
            </div>
            <div>
              <span className="text-[9px] text-slate-455 font-bold uppercase tracking-widest block">Total Score</span>
              <span className="text-xl font-black text-slate-800">{totalScoreValue}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setOpenAccordion(openAccordion === 'syllabus' ? null : 'syllabus')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200"
            >
              <span>Syllabus</span>
              <span>{openAccordion === 'syllabus' ? '▲' : '▼'}</span>
            </button>
            {openAccordion === 'syllabus' && (
              <div className="p-4 text-xs text-slate-600 leading-relaxed bg-white">
                This test contains questions from all topics of this chapter included in the JEE Main syllabus. It includes a mix of questions from PYQs of JEE Main 2019 - 2025.
              </div>
            )}
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <button
              onClick={() => setOpenAccordion(openAccordion === 'marking' ? null : 'marking')}
              className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200"
            >
              <span>Exam Structure & Marking Scheme</span>
              <span>{openAccordion === 'marking' ? '▲' : '▼'}</span>
            </button>
            {openAccordion === 'marking' && (
              <div className="p-4 space-y-3 bg-white text-xs">
                <p className="text-slate-550 font-semibold">This paper is divided into 1 section:</p>
                <div className="flex items-center gap-3 text-slate-700 pl-2">
                  <div className="text-base text-[#FF6B00]">⚛</div>
                  <div>
                    <h4 className="font-bold text-slate-800 uppercase">{getSubjectName()}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                      Single Correct: {questions.length} questions (+4 for correct, -1 for incorrect, 0 for no response)
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2 & 3: GENERAL INSTRUCTIONS PAGE (SCREENSHOT 2 & 3)
  // =========================================================================
  if (step === 'instructions') {
    const testDurationMinutes = config.questionCount === 90 ? 180 : 50;

    return (
      <div className="w-full min-h-screen bg-white text-slate-800 flex flex-col justify-between font-sans border border-slate-200">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3.5 shrink-0 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Instructions</h2>
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className="flex-1 p-6 overflow-y-auto space-y-4 border-r border-slate-200 max-h-[500px]">
            <h3 className="text-center font-bold text-sm text-slate-900">INSTRUCTIONS TO CANDIDATES</h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-slate-655">
              <p className="font-bold uppercase tracking-wider text-slate-800 border-b pb-1">General Instructions</p>
              
              <ol className="list-decimal pl-4 space-y-2.5">
                <li>Total duration of the paper is {testDurationMinutes} minutes.</li>
                <li>
                  The on-screen computer clock will be set at the server. The countdown timer in the top right corner of the computer screen will display the remaining time (in minutes) available for you to complete the examination. When the timer reaches zero, the examination will end by itself automatically. You will not be required to end or submit the answers of examination. Please note that only the answers that you have saved will be recorded and submitted.
                </li>
                <li>
                  The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                  
                  <div className="border border-slate-200 rounded-lg overflow-hidden mt-3 max-w-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-800">
                          <th className="p-2 border-r border-slate-200">Symbol</th>
                          <th className="p-2 border-r border-slate-200">Meaning of the symbol</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 text-center font-bold bg-slate-100 text-slate-600">1</td>
                          <td className="p-2">You have not visited this question.</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 text-center bg-rose-500 text-white font-bold">1</td>
                          <td className="p-2">You have not answered this question.</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 text-center bg-emerald-500 text-white font-bold">1</td>
                          <td className="p-2">You have answered this question.</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 border-r border-slate-200 text-center bg-purple-500 text-white font-bold rounded-full">1</td>
                          <td className="p-2">You have NOT answered the question but have marked the question for review.</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-200 text-center bg-purple-500 text-white font-bold rounded-full relative">
                            1
                            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
                          </td>
                          <td className="p-2">The question(s) "Answered and Marked for Review" will be considered for evaluation.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </li>
                <li>The Marked for Review status for a question simply indicates that you would like to look at question again.</li>
                <li>You can click on the "&gt;" arrow which appears to the left of question palette to collapse question palette thereby maximizing the question window. To view the question palette again you can click on the "&lt;" arrow which appears on the right side of question window.</li>
                <li>You can click on down arrow to navigate to the bottom and up arrow to navigate to the top area, without scrolling.</li>
                <li>At the end of this "INSTRUCTIONS TO CANDIDATES", click on the checkbox beside the "I HAVE READ ALL THE INSTRUCTIONS AND SHALL ABIDE BY THEM" and then you will be able to proceed to and answer the questions at the designated time of the start of the examination. Your on-screen clock will start at the designated time of the start of the examination.</li>
                <li>A Test Summary page will be displayed before final submission. It will help student in reconciling the result and in case of any discrepancy.</li>
              </ol>

              <p className="font-bold uppercase tracking-wider text-slate-800 border-b pb-1 pt-3">Navigating to a Question</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>To navigate between questions, you need to do the following:</li>
                <li className="list-none pl-2 font-medium">
                  a. Click on the question number in the Question Palette at the right of the screen to go to that numbered question directly. Note that using this procedure does NOT save the answer to the current question.
                </li>
              </ul>
            </div>
          </div>

          <div className="w-full md:w-56 p-6 flex flex-col items-center shrink-0 bg-slate-50 border-b md:border-b-0 border-slate-200">
            <div className="w-28 h-32 rounded border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shadow-inner">
              <svg className="w-16 h-16 text-slate-355" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider text-center mt-3 leading-relaxed">
              Candidate<br/>{candidateName}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-6 space-y-4 shrink-0">
          <div className="text-[10px] text-rose-600 font-bold tracking-wider uppercase">
            All the questions will appear in English language.
          </div>

          <label className="flex items-start gap-3 text-xs text-slate-655 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              checked={declarationChecked}
              onChange={(e) => setDeclarationChecked(e.target.checked)}
              className="w-4 h-4 mt-0.5 border border-slate-300 rounded focus:ring-0 text-[#FF6B00]"
            />
            <span className="leading-relaxed">
              I have read and understood the instructions. All computer hardware allotted to me are in proper working condition. I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth devices etc. /any prohibited material with me into the Examination Hall. I agree that in case of not adhering to the instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from future Tests / Examinations
            </span>
          </label>

          <div className="flex justify-center pt-2">
            <button
              onClick={() => {
                if (declarationChecked) {
                  setStep('quiz');
                } else {
                  toast.error("Please check the candidate declaration box first.");
                }
              }}
              disabled={!declarationChecked}
              className={cn(
                "px-8 py-3 text-xs font-black text-white rounded shadow-sm transition-all uppercase tracking-wider border-none",
                declarationChecked 
                  ? "bg-[#FF6B00] hover:bg-[#E05E00]" 
                  : "bg-slate-300 cursor-not-allowed text-slate-400 shadow-none"
              )}
            >
              I am ready to begin
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 4: MOCK TEST PLAYER VIEW (SCREENSHOT 4 + PREPENTRANCE FACELIFT)
  // =========================================================================
  if (step === 'quiz') {
    const currentQ = questions[currentIndex];
    const totalScoreValue = questions.length * 4;
    const formulas = getTopicFormulas(getTestTitle());

    return (
      <div className="w-full min-h-screen bg-[#FAFAFA] text-slate-800 flex flex-col justify-between font-sans relative select-none">
        
        {/* Fixed Top Header bar */}
        <div className="bg-white border-b border-slate-200 px-6 py-2.5 shrink-0 flex items-center justify-between z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-black text-[#FF6B00] tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-ping" />
              {getTestTitle().toUpperCase()}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Drawers toggler buttons */}
            <button 
              onClick={() => setShowFormulaDrawer(!showFormulaDrawer)}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] px-3.5 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-wider border border-slate-200"
            >
              📒 Formula Sheet
            </button>
            <button 
              onClick={() => setShowScratchpad(!showScratchpad)}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] px-3.5 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-wider border border-slate-200"
            >
              ✏ Scratchpad
            </button>
            <button 
              onClick={() => setStep('instructions')}
              className="bg-white hover:bg-slate-50 text-slate-700 font-bold text-[10px] px-3.5 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-wider border border-slate-200"
            >
              <Info className="w-3.5 h-3.5" /> Instructions
            </button>
          </div>
        </div>

        {/* Sub-header sections & countdown timer bar */}
        <div className="bg-white border-b border-slate-200 px-4 py-2.5 shrink-0 flex justify-between items-center z-15">
          <div className="flex items-center">
            <span className="bg-[#FF6B00] text-white text-[11px] font-black px-4 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-wider shadow-sm">
              {getSubjectLabel().toUpperCase()} SINGLE CORRECT <Info className="w-3 h-3 text-white" />
            </span>
          </div>

          <div className="text-slate-600 font-bold text-xs flex items-center gap-2">
            Time Left : <span className="font-mono text-sm bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-[#FF6B00] font-black">{formatTimer(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden items-stretch relative">
          
          {/* LEFT PANEL: QUESTION VIEWER WITH Facelift (Rounded 12px White Card) */}
          <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA] p-4 relative">
            
            {/* Question Details header */}
            <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-500 shrink-0 mb-4">
              <span className="text-[10px] text-[#FF6B00] font-bold uppercase tracking-widest">
                Question Type: Single Correct
              </span>
              <div className="flex gap-4 font-bold text-[10px] uppercase tracking-wider">
                <span>Marks for correct: <strong className="text-emerald-600">+4</strong></span>
                <span className="border-l border-slate-200 pl-4">Negative Marks: <strong className="text-rose-600">-1.0</strong></span>
              </div>
            </div>

            {/* Scrollable Question Content panel */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[500px]">
              
              {/* Rounded 12px Card */}
              <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
                
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-slate-800 text-md">Question {currentIndex + 1}</span>
                    <span className="px-2.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-[#FF6B00] text-[9px] font-bold uppercase tracking-wider">
                      {getTestTitle()}
                    </span>
                    <span className="px-2.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider">
                      Medium
                    </span>
                  </div>
                </div>

                {/* Maximum Marks border warning box */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                  <h4 className="font-black text-xs text-slate-700 uppercase tracking-wide border-b border-slate-200 pb-1">
                    {getSubjectLabel()} Single Correct (Max Marks: {totalScoreValue})
                  </h4>
                  <ul className="text-[10px] text-slate-550 space-y-1 leading-relaxed">
                    <li>• Choose the option corresponding to the correct answer.</li>
                    <li>• Marking Scheme: <strong className="text-emerald-600">+4</strong> for correct, <strong className="text-slate-550">0</strong> for unanswered, <strong className="text-rose-600">-1</strong> in all other cases.</li>
                  </ul>
                </div>

                {/* Question rendering */}
                <div className="space-y-4 pt-2">
                  <JeeQuestion 
                    question={currentQ.question_text}
                    className="text-base text-slate-800 font-medium leading-relaxed"
                  />

                  {/* Option list */}
                  <div className="grid grid-cols-1 gap-2.5 pt-4">
                    {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                      const optText = currentQ.options?.[opt] || (currentQ as any)[`option_${opt.toLowerCase()}`] || '';

                      return (
                        <label 
                          key={opt}
                          className={cn(
                            "flex items-center gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none",
                            selectedOption === opt 
                              ? "bg-orange-50 border-[#FF6B00] shadow-[0_0_15px_rgba(255,107,0,0.1)] text-slate-900 font-semibold" 
                              : "border-slate-200 bg-white hover:border-slate-300 text-slate-700 hover:text-slate-900"
                          )}
                        >
                          <input
                            type="radio"
                            name={`q-${currentIndex}`}
                            checked={selectedOption === opt}
                            onChange={() => setSelectedOption(opt)}
                            className="w-4 h-4 text-[#FF6B00] border-slate-300 bg-white focus:ring-0"
                          />
                          <span className="font-mono font-black text-xs text-slate-500 border border-slate-200 rounded w-6 h-6 flex items-center justify-center bg-slate-50 shrink-0">
                            {opt}
                          </span>
                          <JeeOption option={optText} className="flex-1 text-xs font-medium" />
                        </label>
                      );
                    })}
                  </div>

                  {/* Confidence Rating Selection */}
                  <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black block">
                      How confident are you in this answer?
                    </span>
                    <div className="flex gap-2">
                      {[
                        { id: 'guess', label: 'Guess 🎲' },
                        { id: 'maybe', label: 'Maybe 🤔' },
                        { id: 'sure', label: 'Sure 🎯' }
                      ].map((rate) => (
                        <button
                          key={rate.id}
                          onClick={() => handleConfidenceSelect(rate.id as any)}
                          className={cn(
                            "px-3 py-1.5 text-[10px] font-black rounded-lg border uppercase tracking-wider transition-all",
                            confidenceMap.get(currentIndex) === rate.id
                              ? "bg-orange-50 border-[#FF6B00] text-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.1)]"
                              : "bg-white border-slate-200 text-slate-500 hover:text-slate-800"
                          )}
                        >
                          {rate.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* RIGHT SIDEBAR: CANDIDATE CORNER & QUESTION PALETTE */}
          <div className="w-full md:w-64 bg-white overflow-y-auto p-4 flex flex-col justify-between border-l border-slate-200 shrink-0 z-10">
            
            <div className="space-y-4">
              {/* Candidate Box */}
              <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <div className="w-12 h-14 rounded border border-slate-200 bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                  <svg className="w-7 h-7 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="text-xs">
                  <div className="text-slate-404 font-bold uppercase tracking-widest text-[8px]">Candidate Name</div>
                  <div className="font-bold text-slate-800 leading-tight">{candidateName}</div>
                </div>
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[9px] font-bold text-[#9aa4b2]">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-emerald-500 text-white flex items-center justify-center font-black">
                    {countAnswered}
                  </span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-[#FF6B00] text-white flex items-center justify-center font-black">
                    {countNotAnswered}
                  </span>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center font-black">
                    {countNotVisited}
                  </span>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center font-black">
                    {countMarked}
                  </span>
                  <span>Marked</span>
                </div>
                <div className="flex items-center gap-1.5 col-span-2 border-t border-slate-200 pt-1.5 mt-1">
                  <span className="w-4 h-4 rounded-full bg-purple-500 text-white flex items-center justify-center font-black relative shrink-0">
                    {countAnsweredMarked}
                    <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
                  </span>
                  <span>Answered & Marked</span>
                </div>
              </div>

              {/* Active section title */}
              <div className="bg-orange-50 border border-orange-100 text-[#FF6B00] text-[10px] font-black p-2 rounded uppercase tracking-wider text-center">
                {getSubjectLabel()} Single Correct
              </div>

              {/* Question palette grid */}
              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {questions.map((_, idx) => {
                  const qStatus = statuses.get(idx) || 'not_visited';
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={cn(
                        "h-8 rounded text-xs font-black transition-all flex items-center justify-center relative",
                        idx === currentIndex && "ring-2 ring-[#FF6B00] scale-[1.05] z-10",
                        
                        qStatus === 'answered' && "bg-emerald-500 text-white shadow-sm",
                        qStatus === 'not_answered' && "bg-[#FF6B00] text-white shadow-sm",
                        qStatus === 'not_visited' && "bg-white border border-slate-200 text-slate-500",
                        qStatus === 'marked' && "bg-purple-500 text-white rounded-full shadow-sm",
                        qStatus === 'answered_marked' && "bg-purple-500 text-white rounded-full shadow-sm"
                      )}
                    >
                      {idx + 1}
                      {qStatus === 'answered_marked' && (
                        <span className="absolute bottom-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Smart Sidebar Stats progress */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest block">
                  Question Progress
                </span>
                <div className="space-y-1 text-xs font-semibold text-slate-655">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Answered:</span>
                    <span className="text-emerald-600">{countAnswered + countAnsweredMarked}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Remaining:</span>
                    <span className="text-slate-500">{questions.length - (countAnswered + countAnsweredMarked)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Review:</span>
                    <span className="text-purple-600">{countMarked + countAnsweredMarked}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 mt-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold">Accuracy:</span>
                    <span className="text-[#FF6B00] font-black">{getPredictedAccuracy()}%</span>
                  </div>
                </div>
              </div>

            </div>

            <div className="text-[10px] text-slate-400 text-center italic mt-4">
              CBT JEE Interface
            </div>

          </div>

        </div>

        {/* Bottom actions bar */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 shrink-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 z-20">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleMarkForReviewAndNext}
              className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs h-10 px-4 rounded shadow-sm uppercase tracking-wider"
            >
              Mark for Review & Next
            </Button>
            <Button
              variant="outline"
              onClick={handleClearResponse}
              className="bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs h-10 px-4 rounded shadow-sm uppercase tracking-wider"
            >
              Clear Response
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveAndNext}
              className="bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs h-10 px-6 rounded shadow-sm uppercase tracking-wider border-none"
            >
              Save & Next
            </Button>
            <Button
              onClick={handleSubmitTest}
              className="bg-slate-800 hover:bg-slate-900 text-white font-black text-xs h-10 px-6 rounded shadow-sm uppercase tracking-wider border-none"
            >
              Submit
            </Button>
          </div>
        </div>

        {/* 📒 SLIDING FORMULA DRAWER PANEL */}
        {showFormulaDrawer && (
          <div className="fixed inset-y-0 right-0 w-80 bg-white border-l border-slate-200 shadow-2xl z-40 flex flex-col overflow-hidden text-slate-800 animate-in slide-in-from-right duration-200">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5 text-[#FF6B00]">
                📒 Formula Sheet
              </span>
              <button onClick={() => setShowFormulaDrawer(false)} className="text-slate-400 hover:text-slate-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Active Chapter: {getTestTitle()}
              </div>
              <div className="space-y-3">
                {formulas.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold block">{item.name}</span>
                    <span className="text-xs font-mono font-black text-[#FF6B00] block bg-white p-1.5 rounded text-center border border-slate-200">
                      {item.formula}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ✏ SCRATCHPAD CANVAS PANEL */}
        {showScratchpad && <Scratchpad onClose={() => setShowScratchpad(false)} />}

      </div>
    );
  }

  // =========================================================================
  // SCREEN 5: RESULTS SCREEN WITH POINT-LOSS ANALYZER (INNOVATIVE POST-TEST)
  if (step === 'results') {
    return (
      <div className="space-y-6 animate-fade-in max-w-4xl mx-auto p-6 bg-white border border-slate-200 rounded-xl shadow-sm my-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onComplete}
              className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{getTestTitle()} - Result Summary</h2>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                Attempted on: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
          
          <Button 
            onClick={handleRetry}
            className="bg-[#FF6B00] hover:bg-[#E05E00] text-white font-bold text-xs px-6 py-2.5 rounded-lg uppercase tracking-wider border-none"
          >
            Re-Attempt Test
          </Button>
        </div>

        <TestResults
          answers={testAnswers}
          subchapterName={getTestTitle()}
          difficulty="medium"
          totalTime={totalTime}
          onRetry={handleRetry}
          onChangeDifficulty={onComplete}
          onGoHome={onComplete}
          onPracticeMistakes={onComplete}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20">
      <AlertCircle className="w-10 h-10 text-muted-foreground" />
      <p className="text-muted-foreground mt-2">Invalid state. Back to dashboard.</p>
      <Button variant="outline" onClick={onExit} className="mt-4">Go Back</Button>
    </div>
  );
};

export default TestExecution;
