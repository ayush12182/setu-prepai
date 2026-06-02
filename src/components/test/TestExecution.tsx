import React, { useState, useEffect, useCallback } from 'react';
import { useTestQuestions, ChapterSelection } from '@/hooks/useTestQuestions';
import { Question } from '@/hooks/usePracticeQuestions';
import TestResults from '@/components/practice/TestResults';
import { TestAnswer } from '@/components/practice/TestModeQuiz';
import { Loader2, AlertCircle, Info, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { JeeQuestion, JeeOption } from '@/lib/jeeMathRenderer';

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

const TestExecution: React.FC<TestExecutionProps> = ({
  config,
  onComplete,
  onExit
}) => {
  // Navigation states: 'loading' | 'details' | 'instructions' | 'quiz' | 'results'
  const [step, setStep] = useState<'loading' | 'details' | 'instructions' | 'quiz' | 'results'>('loading');
  const [testAnswers, setTestAnswers] = useState<TestAnswer[]>([]);
  const [totalTime, setTotalTime] = useState(0);
  const [fetchDone, setFetchDone] = useState(false);

  // Active quiz states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [savedAnswers, setSavedAnswers] = useState<Map<number, 'A' | 'B' | 'C' | 'D'>>(new Map());
  
  // Status mapping: 'answered' | 'not_answered' | 'not_visited' | 'marked' | 'answered_marked'
  const [statuses, setStatuses] = useState<Map<number, 'answered' | 'not_answered' | 'not_visited' | 'marked' | 'answered_marked'>>(new Map());

  // Timer states
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(0);

  // Accordion details selectors
  const [openAccordion, setOpenAccordion] = useState<'syllabus' | 'marking' | null>('syllabus');

  // Declaration checkbox selection
  const [declarationChecked, setDeclarationChecked] = useState(false);

  const {
    questions,
    loading,
    error,
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
      // Initialize question statuses: index 0 is visited but unanswered, all others are not visited
      const initialStatuses = new Map<number, 'answered' | 'not_answered' | 'not_visited' | 'marked' | 'answered_marked'>();
      initialStatuses.set(0, 'not_answered');
      for (let i = 1; i < result.length; i++) {
        initialStatuses.set(i, 'not_visited');
      }
      setStatuses(initialStatuses);
      
      // Initialize clock duration based on configuration
      const durationSeconds = config.timeLimitSeconds || (result.length * 2 * 60); // Default: 2 minutes per question
      setTimeLeftSeconds(durationSeconds);

      setStep('details');
    }
    setFetchDone(true);
  };

  useEffect(() => {
    loadQuestions();
  }, [config]);

  // Active quiz clock ticker
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

  // Navigating between questions
  const handleJumpToQuestion = (targetIndex: number) => {
    // Current question status update before switching
    setStatuses(prev => {
      const nextStatuses = new Map(prev);
      const currentStatus = nextStatuses.get(currentIndex);
      
      // If switching away and not answered, mark it visited/not_answered
      if (currentStatus === 'not_visited') {
        nextStatuses.set(currentIndex, 'not_answered');
      }
      
      // Set target question to visited if it was unvisited
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
      // Mark next question visited/not_answered
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
      toast.info("You have reached the last question. Click Submit to finish.");
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
      toast.info("Marked. This is the last question.");
    }
  };

  const handleSubmitTest = useCallback(() => {
    const limit = config.timeLimitSeconds || (questions.length * 2 * 60);
    const timeSpent = limit - timeLeftSeconds;
    const avgTimePerQ = Math.round(timeSpent / questions.length);

    const quizAnswers: TestAnswer[] = questions.map((q, idx) => {
      const choice = savedAnswers.get(idx) || null;
      const correct = choice === q.correct_option;

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
    await loadQuestions();
  };

  // State stats computation for Sidebar palette
  const countAnswered = Array.from(statuses.values()).filter(s => s === 'answered').length;
  const countNotAnswered = Array.from(statuses.values()).filter(s => s === 'not_answered').length;
  const countNotVisited = Array.from(statuses.values()).filter(s => s === 'not_visited').length;
  const countMarked = Array.from(statuses.values()).filter(s => s === 'marked').length;
  const countAnsweredMarked = Array.from(statuses.values()).filter(s => s === 'answered_marked').length;

  // 1. Loading screen
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

  // =========================================================================
  // SCREEN 1: TEST DETAILS VIEW (SCREENSHOT 1)
  // =========================================================================
  if (step === 'details') {
    const totalScoreValue = questions.length * 4;
    const testDurationMinutes = config.questionCount === 90 ? 180 : 50;

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in p-6 bg-slate-950 border border-slate-900 rounded-2xl">
        
        {/* Back and title bar */}
        <div className="flex justify-between items-center border-b border-slate-900 pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onExit}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h2 className="text-xl font-black text-white">{getTestTitle()}</h2>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-0.5">
                Release Date: 15 Apr, 9:00 am
              </span>
            </div>
          </div>
          
          <Button 
            onClick={() => setStep('instructions')}
            className="bg-indigo-650 hover:bg-indigo-750 text-white font-black text-xs px-6 py-2.5 rounded-lg uppercase tracking-wider"
          >
            Attempt Test
          </Button>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* TOTAL QS */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 font-black text-sm">
              ?
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Total Qs</span>
              <span className="text-xl font-black text-white">{questions.length} <span className="text-xs text-slate-400 font-medium">Qs</span></span>
            </div>
          </div>

          {/* TEST DURATION */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-sm">
              🕒
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Test Duration</span>
              <span className="text-xl font-black text-white">{testDurationMinutes} <span className="text-xs text-slate-400 font-medium">min</span></span>
            </div>
          </div>

          {/* TOTAL SCORE */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-black text-sm">
              A+
            </div>
            <div>
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Total Score</span>
              <span className="text-xl font-black text-white">{totalScoreValue}</span>
            </div>
          </div>

        </div>

        {/* Collapsible Accordions */}
        <div className="space-y-3">
          
          {/* 1. Syllabus Accordion */}
          <div className="border border-slate-900 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenAccordion(openAccordion === 'syllabus' ? null : 'syllabus')}
              className="w-full flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-900 text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900"
            >
              <span>Syllabus</span>
              <span>{openAccordion === 'syllabus' ? '▲' : '▼'}</span>
            </button>
            {openAccordion === 'syllabus' && (
              <div className="p-4 text-xs text-slate-350 leading-relaxed bg-[#0b0f19]/30">
                This test contains questions from all topics of this chapter included in the JEE Main syllabus. It includes a mix of questions from PYQs of JEE Main 2019 - 2025.
              </div>
            )}
          </div>

          {/* 2. Exam Structure & Marking Scheme Accordion */}
          <div className="border border-slate-900 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenAccordion(openAccordion === 'marking' ? null : 'marking')}
              className="w-full flex items-center justify-between p-4 bg-slate-900/60 hover:bg-slate-900 text-xs font-bold text-white uppercase tracking-wider border-b border-slate-900"
            >
              <span>Exam Structure & Marking Scheme</span>
              <span>{openAccordion === 'marking' ? '▲' : '▼'}</span>
            </button>
            {openAccordion === 'marking' && (
              <div className="p-4 space-y-3 bg-[#0b0f19]/30 text-xs">
                <p className="text-slate-400">This paper is divided into 1 sections</p>
                <div className="flex items-center gap-3 text-slate-200 pl-2">
                  <div className="text-sm">⚛</div>
                  <div>
                    <h4 className="font-bold text-white uppercase">{getSubjectName()}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">
                      Single Correct: {questions.length} questions (+4 for correct, false -1 for incorrect, 0 for no response)
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
      <div className="w-full min-h-screen bg-white text-slate-800 flex flex-col justify-between font-sans border border-slate-300">
        
        {/* Instructions Header */}
        <div className="bg-[#BFE5F0] border-b border-slate-300 px-6 py-3 shrink-0 flex items-center justify-between">
          <h2 className="text-md font-bold text-slate-900">Instructions</h2>
        </div>

        {/* Instructions Candidate Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Scrollable General Instructions Text */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 border-r border-slate-300 max-h-[500px]">
            <h3 className="text-center font-bold text-md text-slate-900">INSTRUCTIONS TO CANDIDATES</h3>
            
            <div className="space-y-3 text-xs leading-relaxed text-slate-700">
              <p className="font-bold uppercase tracking-wider text-slate-900 border-b pb-1">General Instructions</p>
              
              <ol className="list-decimal pl-4 space-y-2.5">
                <li>Total duration of the paper is {testDurationMinutes} minutes.</li>
                <li>
                  The on-screen computer clock will be set at the server. The countdown timer in the top right corner of the computer screen will display the remaining time (in minutes) available for you to complete the examination. When the timer reaches zero, the examination will end by itself automatically. You will not be required to end or submit the answers of examination. Please note that only the answers that you have saved will be recorded and submitted.
                </li>
                <li>
                  The Question Palette displayed on the right side of screen will show the status of each question using one of the following symbols:
                  
                  <div className="border border-slate-300 rounded-lg overflow-hidden mt-3 max-w-xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-300 font-bold text-slate-900">
                          <th className="p-2 border-r border-slate-300">Symbol</th>
                          <th className="p-2 border-r border-slate-300">Meaning of the symbol</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-350">
                          <td className="p-2 border-r border-slate-300 text-center font-bold">1</td>
                          <td className="p-2">You have not visited this question.</td>
                        </tr>
                        <tr className="border-b border-slate-350">
                          <td className="p-2 border-r border-slate-300 text-center bg-orange-500 text-white font-bold">1</td>
                          <td className="p-2">You have not answered this question.</td>
                        </tr>
                        <tr className="border-b border-slate-350">
                          <td className="p-2 border-r border-slate-300 text-center bg-emerald-500 text-white font-bold">1</td>
                          <td className="p-2">You have answered this question.</td>
                        </tr>
                        <tr className="border-b border-slate-350">
                          <td className="p-2 border-r border-slate-300 text-center bg-purple-500 text-white font-bold rounded-full">1</td>
                          <td className="p-2">You have NOT answered the question but have marked the question for review.</td>
                        </tr>
                        <tr>
                          <td className="p-2 border-r border-slate-300 text-center bg-purple-500 text-white font-bold rounded-full relative">
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

              <p className="font-bold uppercase tracking-wider text-slate-900 border-b pb-1 pt-3">Navigating to a Question</p>
              <ul className="list-disc pl-4 space-y-2">
                <li>To navigate between questions, you need to do the following:</li>
                <li className="list-none pl-2">
                  a. Click on the question number in the Question Palette at the right of the screen to go to that numbered question directly. Note that using this procedure does NOT save the answer to the current question.
                </li>
              </ul>
            </div>
          </div>

          {/* Right sidebar profile photo */}
          <div className="w-full md:w-56 p-6 flex flex-col items-center shrink-0 bg-slate-50 border-b md:border-b-0 border-slate-300">
            <div className="w-28 h-32 rounded border border-slate-350 bg-slate-200 flex items-center justify-center overflow-hidden shadow-inner">
              <svg className="w-16 h-16 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider text-center mt-3 leading-relaxed">
              Candidate<br/>Ayush Dixit
            </span>
          </div>

        </div>

        {/* Declarations checklist and Ready button bottom panel */}
        <div className="bg-slate-100 border-t border-slate-300 p-6 space-y-4 shrink-0">
          <div className="text-[10px] text-rose-600 font-bold tracking-wider">
            All the questions will appear in English language.
          </div>

          <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={declarationChecked}
              onChange={(e) => setDeclarationChecked(e.target.checked)}
              className="w-4 h-4 mt-0.5 border border-slate-400 rounded focus:ring-0 text-blue-650"
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
                  toast.error("Please read and check the candidate declaration box first.");
                }
              }}
              disabled={!declarationChecked}
              className={cn(
                "px-8 py-3 text-sm font-bold text-white rounded shadow-md transition-all uppercase tracking-wider",
                declarationChecked 
                  ? "bg-blue-650 hover:bg-blue-750" 
                  : "bg-slate-350 cursor-not-allowed text-slate-500 shadow-none"
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
  // SCREEN 3: MOCK TEST PLAYER VIEW (SCREENSHOT 4)
  // =========================================================================
  if (step === 'quiz') {
    const currentQ = questions[currentIndex];
    
    // Total score value
    const totalScoreValue = questions.length * 4;

    return (
      <div className="w-full min-h-screen bg-slate-100 text-slate-900 flex flex-col justify-between font-sans border border-slate-300 select-none">
        
        {/* Header Bar */}
        <div className="bg-[#1e293b] border-b border-slate-800 px-6 py-2.5 shrink-0 flex items-center justify-between">
          <h2 className="text-sm font-black text-amber-450 tracking-wider uppercase">
            {getTestTitle().toUpperCase()}
          </h2>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setStep('instructions')}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-wider border border-slate-750"
            >
              <Info className="w-3.5 h-3.5" /> Instructions
            </button>
            <button 
              onClick={() => {
                setSyllabusModalText(`Dynamic Question Paper format: Standard single section featuring ${questions.length} multiple-choice questions. Section: Physics Single Correct.`);
              }}
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-[10px] px-3.5 py-1.5 rounded flex items-center gap-1.5 uppercase tracking-wider border border-slate-750"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Question Paper
            </button>
          </div>
        </div>

        {/* Sub-header sections & countdown timer bar */}
        <div className="bg-slate-100 border-b border-slate-300 px-4 py-2 shrink-0 flex justify-between items-center">
          <div className="flex items-center">
            <span className="bg-[#1d4ed8] text-white text-[11px] font-black px-4 py-1.5 border-r border-indigo-700 flex items-center gap-1.5 uppercase tracking-wider shadow-inner">
              {getTestTitle()} <Info className="w-3 h-3 text-white" />
            </span>
          </div>

          <div className="text-slate-900 font-bold text-xs flex items-center gap-2">
            Time Left : <span className="font-mono text-sm bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800 font-black">{formatTimer(timeLeftSeconds)}</span>
          </div>
        </div>

        {/* Main Test Arena splits Panel */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden items-stretch">
          
          {/* LEFT: QUESTION PANEL VIEWPORT */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white border-r border-slate-300">
            
            {/* Subject tabs details */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex justify-between items-center text-xs text-slate-650 shrink-0">
              <span className="bg-indigo-750 text-white font-black px-3 py-1 rounded flex items-center gap-1 uppercase tracking-widest text-[9px]">
                {getSubjectLabel(activeCategory)} Single Correct <Info className="w-3 h-3" />
              </span>
              <div className="flex gap-4 font-bold">
                <span>Question Type: <strong>Single Correct</strong></span>
                <span className="border-l border-slate-300 pl-4">Marks for correct answer: <strong className="text-emerald-600">4</strong></span>
                <span className="border-l border-slate-300 pl-4">Negative Marks: <strong className="text-rose-600">-1.0</strong></span>
              </div>
            </div>

            {/* Scrollable Question Content panel */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 max-h-[500px]">
              
              <div className="flex justify-between items-start border-b pb-3">
                <span className="font-bold text-slate-900 text-sm">Question No. {currentIndex + 1} #{currentIndex + 1}</span>
                <button className="text-slate-400 hover:text-slate-600">
                  <span>▼</span>
                </button>
              </div>

              {/* Maximum Marks border warning box */}
              <div className="border border-slate-300 rounded-lg p-4 bg-slate-50 space-y-2">
                <h4 className="font-black text-xs text-slate-800 uppercase tracking-wide border-b pb-1">
                  {getSubjectLabel(activeCategory)} Single Correct (Maximum Marks: {totalScoreValue})
                </h4>
                <ul className="text-[11px] text-slate-600 space-y-1 leading-relaxed">
                  <li>• This section contains <strong>{questions.length}</strong> questions.</li>
                  <li>• Each question has 4 options. <strong>ONLY ONE</strong> of these 4 options is the correct answer.</li>
                  <li>• For each question, choose the option corresponding to the correct answer.</li>
                  <li>• Marking Scheme: <strong className="text-emerald-600">+4</strong> if only the correct option is chosen, <strong className="text-slate-600">0</strong> if unanswered, and <strong className="text-rose-600">-1</strong> in all other cases.</li>
                </ul>
              </div>

              {/* Rendering question content details */}
              <div className="space-y-4 pt-2">
                <JeeQuestion 
                  question={currentQ.question_text}
                  className="text-base text-slate-900 font-medium leading-relaxed"
                />

                {/* Option Selector List */}
                <div className="grid grid-cols-1 gap-3 pt-4">
                  {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                    const optText = {
                      A: currentQ.option_a,
                      B: currentQ.option_b,
                      C: currentQ.option_c,
                      D: currentQ.option_d
                    }[opt];

                    return (
                      <label 
                        key={opt}
                        className={cn(
                          "flex items-center gap-3 p-3.5 rounded-lg border transition-all cursor-pointer select-none",
                          selectedOption === opt 
                            ? "bg-blue-50/50 border-blue-500" 
                            : "border-slate-250 bg-white hover:bg-slate-50"
                        )}
                      >
                        <input
                          type="radio"
                          name={`q-${currentIndex}`}
                          checked={selectedOption === opt}
                          onChange={() => setSelectedOption(opt)}
                          className="w-4 h-4 text-blue-650 focus:ring-0"
                        />
                        <span className="font-mono font-black text-xs text-slate-500 border border-slate-300 rounded w-6 h-6 flex items-center justify-center bg-slate-100 shrink-0">
                          {opt}
                        </span>
                        <JeeOption option={optText} className="flex-1 text-slate-800 text-xs font-semibold" />
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT: CANDIDATE GRID AND PALETTE */}
          <div className="w-full md:w-64 bg-slate-50 overflow-y-auto p-4 flex flex-col justify-between border-b md:border-b-0 border-slate-300 shrink-0">
            
            <div className="space-y-4">
              {/* Candidate Info */}
              <div className="flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                <div className="w-12 h-14 rounded border bg-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  <svg className="w-7 h-7 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="text-xs">
                  <div className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Candidate Name</div>
                  <div className="font-bold text-slate-800 leading-tight">Ayush Dixit</div>
                </div>
              </div>

              {/* Status Palette Legend */}
              <div className="grid grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-650">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-emerald-500 text-white flex items-center justify-center font-black">
                    {countAnswered}
                  </span>
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-orange-500 text-white flex items-center justify-center font-black">
                    {countNotAnswered}
                  </span>
                  <span>Not Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center font-black">
                    {countNotVisited}
                  </span>
                  <span>Not Visited</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center font-black">
                    {countMarked}
                  </span>
                  <span>Marked</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 border-t pt-1.5 mt-1">
                  <span className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center font-black relative shrink-0">
                    {countAnsweredMarked}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                  </span>
                  <span>Answered & Marked for Review</span>
                </div>
              </div>

              {/* Active Section tab selector title */}
              <div className="bg-[#1d4ed8] text-white text-[10px] font-black p-2 rounded uppercase tracking-wider shadow-inner text-center">
                {getSubjectLabel(activeCategory)} Single Correct
              </div>

              {/* Question palette numbers grid selector */}
              <div className="grid grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-slate-200">
                {questions.map((_, idx) => {
                  const qStatus = statuses.get(idx) || 'not_visited';
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => handleJumpToQuestion(idx)}
                      className={cn(
                        "h-8 rounded text-xs font-black transition-all flex items-center justify-center relative",
                        idx === currentIndex && "ring-2 ring-blue-600 scale-[1.05] z-10",
                        
                        // Status styling maps to legend colors
                        qStatus === 'answered' && "bg-emerald-500 text-white",
                        qStatus === 'not_answered' && "bg-orange-500 text-white",
                        qStatus === 'not_visited' && "bg-slate-200 border border-slate-300 text-slate-700",
                        qStatus === 'marked' && "bg-purple-500 text-white rounded-full",
                        qStatus === 'answered_marked' && "bg-purple-500 text-white rounded-full"
                      )}
                    >
                      {idx + 1}
                      {/* corner check node for answered and marked */}
                      {qStatus === 'answered_marked' && (
                        <span className="absolute bottom-0.5 right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-slate-500 text-center italic mt-4">
              Solving questions with marking rules matches final standards.
            </div>

          </div>

        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="bg-slate-200 border-t border-slate-350 px-6 py-4 shrink-0 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleMarkForReviewAndNext}
              className="bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs h-10 px-4 rounded shadow-sm uppercase tracking-wider"
            >
              Mark for Review & Next
            </Button>
            <Button
              variant="outline"
              onClick={handleClearResponse}
              className="bg-white border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs h-10 px-4 rounded shadow-sm uppercase tracking-wider"
            >
              Clear Response
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSaveAndNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-6 rounded shadow-sm uppercase tracking-wider"
            >
              Save & Next
            </Button>
            <Button
              onClick={handleSubmitTest}
              className="bg-indigo-650 hover:bg-indigo-750 text-white font-black text-xs h-10 px-6 rounded shadow-sm uppercase tracking-wider"
            >
              Submit
            </Button>
          </div>

        </div>

      </div>
    );
  }

  // Results screen view wrapper
  if (step === 'results') {
    return (
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
