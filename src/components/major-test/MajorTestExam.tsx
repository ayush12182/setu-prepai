import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Clock, 
  CheckCircle2, 
  Circle,
  AlertTriangle,
  Send
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
import { MajorTestQuestion, MajorTestAnswer } from '@/hooks/useMajorTest';
import { cn } from '@/lib/utils';

interface MajorTestExamProps {
  questions: MajorTestQuestion[];
  answers: Map<string, MajorTestAnswer>;
  timeRemaining: number;
  tabSwitchCount: number;
  onUpdateAnswer: (questionId: string, option: 'A' | 'B' | 'C' | 'D' | null) => void;
  onToggleMarkReview: (questionId: string) => void;
  onUpdateTimeSpent: (questionId: string, seconds: number) => void;
  onTabSwitch: () => Promise<number>;
  onSubmit: () => void;
}

const MajorTestExam: React.FC<MajorTestExamProps> = ({
  questions,
  answers,
  timeRemaining,
  tabSwitchCount,
  onUpdateAnswer,
  onToggleMarkReview,
  onUpdateTimeSpent,
  onTabSwitch,
  onSubmit
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [activeSection, setActiveSection] = useState<'physics' | 'chemistry' | 'maths'>('physics');
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const lastQuestionTime = useRef<number>(Date.now());
  
  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : null;

  // Format time
  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get questions by section
  const physicsQuestions = questions.filter(q => q.subject === 'physics');
  const chemistryQuestions = questions.filter(q => q.subject === 'chemistry');
  const mathsQuestions = questions.filter(q => q.subject === 'maths');

  const getSectionQuestions = () => {
    switch (activeSection) {
      case 'physics': return physicsQuestions;
      case 'chemistry': return chemistryQuestions;
      case 'maths': return mathsQuestions;
    }
  };

  // Enter fullscreen
  const enterFullScreen = useCallback(async () => {
    try {
      await document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } catch (err) {
      console.error('Fullscreen failed:', err);
    }
  }, []);

  // Handle visibility change (tab switch)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        onTabSwitch();
      }
    };

    const handleBlur = () => {
      onTabSwitch();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [onTabSwitch]);

  // Disable context menu and shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable common shortcuts
      if (
        (e.ctrlKey || e.metaKey) && 
        ['c', 'v', 'x', 'a', 'p', 's', 'r', 'f'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }
      // Disable F5, F12
      if (['F5', 'F12'].includes(e.key)) {
        e.preventDefault();
      }
    };
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Track time spent on current question
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentQuestion) {
        const now = Date.now();
        const elapsed = Math.floor((now - lastQuestionTime.current) / 1000);
        if (elapsed > 0) {
          onUpdateTimeSpent(currentQuestion.id, 1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentQuestion, onUpdateTimeSpent]);

  // Update time tracking when question changes
  useEffect(() => {
    lastQuestionTime.current = Date.now();
  }, [currentQuestionIndex]);

  // Request fullscreen on mount
  useEffect(() => {
    enterFullScreen();
  }, [enterFullScreen]);

  const handleSelectOption = (option: 'A' | 'B' | 'C' | 'D') => {
    if (currentQuestion) {
      onUpdateAnswer(currentQuestion.id, option);
    }
  };

  const handleClearResponse = () => {
    if (currentQuestion) {
      onUpdateAnswer(currentQuestion.id, null);
    }
  };

  const handleMarkReview = () => {
    if (currentQuestion) {
      onToggleMarkReview(currentQuestion.id);
    }
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    const question = questions[index];
    if (question) {
      setActiveSection(question.subject);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      goToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      goToQuestion(currentQuestionIndex - 1);
    }
  };

  const getQuestionStatus = (question: MajorTestQuestion) => {
    const answer = answers.get(question.id);
    if (!answer) return 'unattempted';
    if (answer.isMarkedReview && answer.selectedOption) return 'review-answered';
    if (answer.isMarkedReview) return 'review';
    if (answer.selectedOption) return 'answered';
    return 'unattempted';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'review': return 'bg-purple-500 text-white';
      case 'review-answered': return 'bg-purple-500 text-white border-2 border-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStats = () => {
    let answered = 0, unattempted = 0, markedReview = 0;
    answers.forEach(answer => {
      if (answer.selectedOption) answered++;
      else unattempted++;
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
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-bold text-lg">Major Test - JEE Main</h1>
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Warnings: {tabSwitchCount}/3</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-6">
          {/* Timer */}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg",
            timeRemaining <= 600 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
          )}>
            <Clock className="w-5 h-5" />
            <span className="font-bold">{formatTime(timeRemaining)}</span>
          </div>
          
          <Button 
            onClick={() => setShowSubmitDialog(true)}
            className="bg-primary text-primary-foreground"
          >
            <Send className="w-4 h-4 mr-2" />
            Submit Test
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Question Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Section Tabs */}
          <div className="flex gap-2 mb-6">
            {(['physics', 'chemistry', 'maths'] as const).map(section => (
              <button
                key={section}
                onClick={() => {
                  setActiveSection(section);
                  const firstQ = questions.find(q => q.subject === section);
                  if (firstQ) {
                    goToQuestion(questions.indexOf(firstQ));
                  }
                }}
                className={cn(
                  "px-6 py-2 rounded-lg font-medium capitalize transition-colors",
                  activeSection === section
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {section}
              </button>
            ))}
          </div>

          {/* Question */}
          <div className="bg-card border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-lg font-medium">
                  Q{currentQuestion.questionNumber}
                </span>
                <span className="text-sm text-muted-foreground capitalize">
                  {currentQuestion.chapterName}
                </span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded capitalize",
                  currentQuestion.difficulty === 'easy' && "bg-green-100 text-green-700",
                  currentQuestion.difficulty === 'medium' && "bg-yellow-100 text-yellow-700",
                  currentQuestion.difficulty === 'hard' && "bg-red-100 text-red-700"
                )}>
                  {currentQuestion.difficulty}
                </span>
              </div>
              <button
                onClick={handleMarkReview}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors",
                  currentAnswer?.isMarkedReview
                    ? "bg-purple-100 text-purple-700"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Flag className="w-4 h-4" />
                <span className="text-sm">
                  {currentAnswer?.isMarkedReview ? 'Marked for Review' : 'Mark for Review'}
                </span>
              </button>
            </div>

            <div className="prose prose-lg max-w-none mb-6">
              <p className="text-foreground whitespace-pre-wrap">{currentQuestion.questionText}</p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {(['A', 'B', 'C', 'D'] as const).map(option => {
                const optionText = currentQuestion[`option${option}` as keyof MajorTestQuestion] as string;
                const isSelected = currentAnswer?.selectedOption === option;
                
                return (
                  <button
                    key={option}
                    onClick={() => handleSelectOption(option)}
                    className={cn(
                      "w-full p-4 rounded-xl border-2 text-left transition-all flex items-start gap-4",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-medium",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    )}>
                      {option}
                    </div>
                    <span className="flex-1 pt-1">{optionText}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleClearResponse}
              disabled={!currentAnswer?.selectedOption}
            >
              Clear Response
            </Button>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                onClick={handleNext}
                disabled={currentQuestionIndex === questions.length - 1}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </main>

        {/* Question Palette Sidebar */}
        <aside className="w-80 bg-card border-l border-border overflow-y-auto p-4">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 mb-6 text-center text-sm">
            <div className="bg-green-50 rounded-lg p-2">
              <div className="font-bold text-green-700">{stats.answered}</div>
              <div className="text-xs text-green-600">Answered</div>
            </div>
            <div className="bg-muted rounded-lg p-2">
              <div className="font-bold text-muted-foreground">{stats.unattempted}</div>
              <div className="text-xs text-muted-foreground">Unattempted</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2">
              <div className="font-bold text-purple-700">{stats.markedReview}</div>
              <div className="text-xs text-purple-600">Review</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 mb-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-muted"></div>
              <span>Unattempted</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span>Review</span>
            </div>
          </div>

          {/* Section Palettes */}
          {(['physics', 'chemistry', 'maths'] as const).map(section => {
            const sectionQuestions = questions.filter(q => q.subject === section);
            const startIndex = section === 'physics' ? 0 
              : section === 'chemistry' ? 30 
              : 60;
            
            return (
              <div key={section} className="mb-6">
                <h3 className="font-medium text-foreground capitalize mb-3">{section}</h3>
                <div className="grid grid-cols-5 gap-2">
                  {sectionQuestions.map((q, idx) => {
                    const globalIndex = startIndex + idx;
                    const status = getQuestionStatus(q);
                    const isActive = currentQuestionIndex === globalIndex;
                    
                    return (
                      <button
                        key={q.id}
                        onClick={() => goToQuestion(globalIndex)}
                        className={cn(
                          "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                          getStatusColor(status),
                          isActive && "ring-2 ring-primary ring-offset-2"
                        )}
                      >
                        {q.questionNumber}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Test?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit the test? This action cannot be undone.
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
              <div className="text-xs text-purple-600">Marked Review</div>
            </div>
          </div>
          
          {stats.unattempted > 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              ⚠️ You have {stats.unattempted} unattempted questions. Are you sure you want to submit?
            </p>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              Continue Test
            </Button>
            <Button onClick={() => { setShowSubmitDialog(false); onSubmit(); }}>
              Submit Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MajorTestExam;
