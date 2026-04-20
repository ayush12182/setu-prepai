import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  Clock,
  AlertTriangle,
  Send,
  Hash,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MajorTestQuestion,
  MajorTestAnswer,
  SubjectName,
  isAnswered,
} from '@/hooks/useMajorTest';
import { cn } from '@/lib/utils';
import { JeeQuestion, JeeOption } from '@/lib/jeeMathRenderer';

interface MajorTestExamProps {
  questions: MajorTestQuestion[];
  answers: Map<string, MajorTestAnswer>;
  timeRemaining: number;
  tabSwitchCount: number;
  onUpdateAnswer: (questionId: string, option: 'A' | 'B' | 'C' | 'D' | null) => void;
  onUpdateNumericalAnswer: (questionId: string, value: number | null) => void;
  onToggleMarkReview: (questionId: string) => void;
  onUpdateTimeSpent: (questionId: string, seconds: number) => void;
  onTabSwitch: () => Promise<number>;
  onSubmit: () => void;
}

const SUBJECTS: { key: SubjectName; label: string }[] = [
  { key: 'physics', label: 'Physics' },
  { key: 'chemistry', label: 'Chemistry' },
  { key: 'maths', label: 'Mathematics' },
];

const MajorTestExam: React.FC<MajorTestExamProps> = ({
  questions,
  answers,
  timeRemaining,
  tabSwitchCount,
  onUpdateAnswer,
  onUpdateNumericalAnswer,
  onToggleMarkReview,
  onUpdateTimeSpent,
  onTabSwitch,
  onSubmit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSubject, setActiveSubject] = useState<SubjectName>('physics');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [numericalInput, setNumericalInput] = useState('');
  const lastQuestionTime = useRef<number>(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : null;

  // ── Format time ──────────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ── Get questions by subject ─────────────────────────────────────────
  const getSubjectQuestions = (subject: SubjectName) =>
    questions.filter(q => q.subject === subject);

  const sectionAQuestions = (subject: SubjectName) =>
    getSubjectQuestions(subject).filter(q => q.section === 'A');

  const sectionBQuestions = (subject: SubjectName) =>
    getSubjectQuestions(subject).filter(q => q.section === 'B');

  // ── Enter fullscreen ─────────────────────────────────────────────────
  useEffect(() => {
    try { document.documentElement.requestFullscreen(); } catch {}
  }, []);

  // ── Visibility / tab switch ──────────────────────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => { if (document.hidden) onTabSwitch(); };
    const handleBlur = () => onTabSwitch();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onTabSwitch]);

  // ── Disable shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'a', 'p', 's', 'r', 'f'].includes(e.key.toLowerCase())) e.preventDefault();
      if (['F5', 'F12'].includes(e.key)) e.preventDefault();
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // ── Time tracking per question ───────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentQuestion) onUpdateTimeSpent(currentQuestion.id, 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [currentQuestion, onUpdateTimeSpent]);

  useEffect(() => { lastQuestionTime.current = Date.now(); }, [currentQuestionIndex]);

  // ── Sync numerical input when question changes ───────────────────────
  useEffect(() => {
    if (currentAnswer?.questionType === 'integer') {
      setNumericalInput(currentAnswer.numericalAnswer !== null ? String(currentAnswer.numericalAnswer) : '');
    }
  }, [currentQuestionIndex, currentAnswer?.questionType, currentAnswer?.numericalAnswer]);

  // ── Navigation helpers ───────────────────────────────────────────────
  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    const q = questions[index];
    if (q) setActiveSubject(q.subject);
  };

  const handleNext = () => { if (currentQuestionIndex < questions.length - 1) goToQuestion(currentQuestionIndex + 1); };
  const handlePrevious = () => { if (currentQuestionIndex > 0) goToQuestion(currentQuestionIndex - 1); };

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (currentQuestion) onUpdateAnswer(currentQuestion.id, option);
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    if (currentQuestion.questionType === 'integer') {
      onUpdateNumericalAnswer(currentQuestion.id, null);
      setNumericalInput('');
    } else {
      onUpdateAnswer(currentQuestion.id, null);
    }
  };

  const handleMarkReview = () => {
    if (currentQuestion) onToggleMarkReview(currentQuestion.id);
  };

  const handleNumericalChange = (value: string) => {
    // Allow digits, minus sign, and decimal point only
    const sanitized = value.replace(/[^0-9.\-]/g, '');
    setNumericalInput(sanitized);
    const parsed = parseFloat(sanitized);
    if (currentQuestion) {
      onUpdateNumericalAnswer(currentQuestion.id, isNaN(parsed) ? null : parsed);
    }
  };

  // ── Question status helpers ──────────────────────────────────────────
  const getQuestionStatus = (question: MajorTestQuestion) => {
    const answer = answers.get(question.id);
    if (!answer) return 'unattempted';
    const answered = isAnswered(answer);
    if (answer.isMarkedReview && answered) return 'review-answered';
    if (answer.isMarkedReview) return 'review';
    if (answered) return 'answered';
    return 'unattempted';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'review': return 'bg-purple-500 text-white';
      case 'review-answered': return 'bg-purple-500 text-white ring-2 ring-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStats = () => {
    let answered = 0, unattempted = 0, markedReview = 0;
    answers.forEach(answer => {
      if (isAnswered(answer)) answered++; else unattempted++;
      if (answer.isMarkedReview) markedReview++;
    });
    return { answered, unattempted, markedReview };
  };

  const stats = getStats();

  if (!currentQuestion) {
    return <div className="p-8 text-center">Loading questions...</div>;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col select-none">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-card border-b border-border px-4 py-2.5 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-bold text-lg">JEE Main — Major Test</h1>
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Warnings: {tabSwitchCount}/3</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg',
            timeRemaining <= 600 ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary',
          )}>
            <Clock className="w-5 h-5" />
            <span className="font-bold">{formatTime(timeRemaining)}</span>
          </div>
          <Button onClick={() => setShowSubmitDialog(true)} className="bg-primary text-primary-foreground gap-2">
            <Send className="w-4 h-4" /> Submit Test
          </Button>
        </div>
      </header>

      {/* ── Subject Tabs ───────────────────────────────────────────────── */}
      <div className="bg-card border-b border-border px-4 py-1.5 flex gap-1">
        {SUBJECTS.map(sub => (
          <button
            key={sub.key}
            onClick={() => {
              setActiveSubject(sub.key);
              const first = questions.find(q => q.subject === sub.key);
              if (first) goToQuestion(questions.indexOf(first));
            }}
            className={cn(
              'px-5 py-2 rounded-t-lg font-medium text-sm transition-colors',
              activeSubject === sub.key
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
          >
            {sub.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Main Question Area ─────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            {/* Question header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium">
                  Q{currentQuestion.questionNumber}
                </span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded font-semibold uppercase',
                  currentQuestion.section === 'B'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-blue-100 text-blue-700',
                )}>
                  {currentQuestion.section === 'B' ? 'Integer Type' : 'MCQ'}
                </span>
                <span className="text-sm text-muted-foreground">{currentQuestion.chapterName}</span>
                <span className={cn(
                  'text-xs px-2 py-0.5 rounded capitalize',
                  currentQuestion.difficulty === 'easy' && 'bg-green-100 text-green-700',
                  currentQuestion.difficulty === 'medium' && 'bg-yellow-100 text-yellow-700',
                  currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-700',
                )}>
                  {currentQuestion.difficulty}
                </span>
                <span className="text-xs text-muted-foreground ml-2">
                  {currentQuestion.questionType === 'mcq' ? '+4 / −1' : '+4 / 0'}
                </span>
              </div>
              <button
                onClick={handleMarkReview}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors',
                  currentAnswer?.isMarkedReview
                    ? 'bg-purple-100 text-purple-700'
                    : 'text-muted-foreground hover:bg-muted',
                )}
              >
                <Flag className="w-4 h-4" />
                <span className="text-sm">
                  {currentAnswer?.isMarkedReview ? 'Marked' : 'Mark for Review'}
                </span>
              </button>
            </div>

            {/* Question text */}
            <div className="prose prose-lg max-w-none mb-6">
              <JeeQuestion question={currentQuestion.questionText} className="text-foreground" />
            </div>

            {/* ── Answer Area ─────────────────────────────────────────── */}
            {currentQuestion.questionType === 'integer' ? (
              /* Integer Type Input */
              <div className="max-w-md">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Enter your numerical answer:
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={numericalInput}
                    onChange={e => handleNumericalChange(e.target.value)}
                    placeholder="e.g. 42 or 3.14"
                    className={cn(
                      'w-full pl-10 pr-4 py-3 rounded-xl border-2 text-lg font-mono',
                      'bg-card text-foreground placeholder:text-muted-foreground',
                      'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50',
                      numericalInput ? 'border-primary' : 'border-border',
                    )}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Decimal and negative values are allowed. No negative marking for integer type.
                </p>
              </div>
            ) : (
              /* MCQ Options */
              <div className="space-y-3">
                {(['A', 'B', 'C', 'D'] as const).map(option => {
                  const optionText = currentQuestion[`option${option}` as keyof MajorTestQuestion] as string;
                  const isSelected = currentAnswer?.selectedOption === option;

                  return (
                    <button
                      key={option}
                      onClick={() => handleSelectOption(option)}
                      className={cn(
                        'w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4',
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30',
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-medium',
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground',
                      )}>
                        {option}
                      </div>
                      <JeeOption option={optionText} className="flex-1 pt-1" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Bottom Navigation ─────────────────────────────────────── */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={handleClearResponse}
              disabled={currentQuestion.questionType === 'integer' ? !numericalInput : !currentAnswer?.selectedOption}>
              Clear Response
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>
              <Button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </main>

        {/* ── Question Palette Sidebar ────────────────────────────────── */}
        <aside className="w-72 bg-card border-l border-border overflow-y-auto p-4 flex flex-col">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4 text-center text-xs">
            <div className="bg-green-50 rounded-lg p-2">
              <div className="font-bold text-green-700">{stats.answered}</div>
              <div className="text-green-600">Answered</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="font-bold text-muted-foreground">{stats.unattempted}</div>
              <div className="text-muted-foreground">Unattempted</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="font-bold text-purple-700">{stats.markedReview}</div>
              <div className="text-purple-600">Review</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-4 text-[11px]">
            <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded bg-green-500" /><span>Answered</span></div>
            <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded bg-muted border border-border" /><span>Unattempted</span></div>
            <div className="flex items-center gap-1"><div className="w-3.5 h-3.5 rounded bg-purple-500" /><span>Review</span></div>
          </div>

          {/* Per-subject Section A + B Navigator */}
          {SUBJECTS.map(sub => {
            const secA = sectionAQuestions(sub.key);
            const secB = sectionBQuestions(sub.key);

            return (
              <div key={sub.key} className="mb-5">
                <h3 className="font-semibold text-foreground text-sm mb-2">{sub.label}</h3>

                {/* Section A */}
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Section A — MCQ</p>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {secA.map(q => {
                    const globalIdx = questions.indexOf(q);
                    const status = getQuestionStatus(q);
                    const isActive = currentQuestionIndex === globalIdx;
                    // Show subject-local number (1-20)
                    const localNum = secA.indexOf(q) + 1;

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(globalIdx)}
                        className={cn(
                          'w-9 h-9 rounded-md text-xs font-medium transition-all',
                          getStatusColor(status),
                          isActive && 'ring-2 ring-primary ring-offset-1',
                        )}
                      >
                        {localNum}
                      </button>
                    );
                  })}
                </div>

                {/* Section B */}
                <p className="text-[10px] uppercase tracking-wider text-amber-600 mb-1">Section B — Integer</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {secB.map(q => {
                    const globalIdx = questions.indexOf(q);
                    const status = getQuestionStatus(q);
                    const isActive = currentQuestionIndex === globalIdx;
                    const localNum = secA.length + secB.indexOf(q) + 1;

                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(globalIdx)}
                        className={cn(
                          'w-9 h-9 rounded-md text-xs font-medium transition-all border border-amber-300/50',
                          getStatusColor(status),
                          isActive && 'ring-2 ring-primary ring-offset-1',
                        )}
                      >
                        {localNum}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>
      </div>

      {/* ── Submit Confirmation Dialog ────────────────────────────────── */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              Review your attempt summary before submitting. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-3 gap-4 py-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{stats.answered}</div>
              <div className="text-xs text-green-600">Answered</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">{stats.unattempted}</div>
              <div className="text-xs text-muted-foreground">Unattempted</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{stats.markedReview}</div>
              <div className="text-xs text-purple-600">Marked for Review</div>
            </div>
          </div>

          {stats.unattempted > 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              ⚠️ You have {stats.unattempted} unattempted questions. Are you sure you want to submit?
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>Continue Test</Button>
            <Button onClick={() => { setShowSubmitDialog(false); onSubmit(); }}>Submit Test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MajorTestExam;
