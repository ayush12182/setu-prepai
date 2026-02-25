import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle, XCircle, RotateCcw, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface QuickQuizProps {
  onBack: () => void;
}

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  subject?: string;
  explanation: string;
}

// Static fallbacks
const cuetFallbackQuestions: QuizQuestion[] = [
  { question: 'GDP at Market Price = GDP at Factor Cost + ?', options: ['Subsidies', 'Net Indirect Taxes', 'Depreciation', 'NFIA'], correct: 1, subject: 'economics', explanation: 'GDP(MP) = GDP(FC) + Net Indirect Taxes' },
  { question: 'Who gave the 14 Principles of Management?', options: ['Taylor', 'Henri Fayol', 'Drucker', 'Mayo'], correct: 1, subject: 'business_studies', explanation: 'Henri Fayol is the father of General Management' },
  { question: 'Goodwill is a:', options: ['Tangible asset', 'Intangible asset', 'Fictitious asset', 'Current asset'], correct: 1, subject: 'accountancy', explanation: 'Goodwill is intangible — reputation/brand value' },
  { question: 'The antonym of "Benevolent" is:', options: ['Kind', 'Generous', 'Malevolent', 'Charitable'], correct: 2, subject: 'english', explanation: 'Benevolent = kind. Malevolent = evil intent' },
  { question: 'Article 14 deals with:', options: ['Freedom of speech', 'Right to Equality', 'Right to Education', 'Right to Privacy'], correct: 1, subject: 'general_test', explanation: 'Article 14: Equality before law' },
  { question: 'LPG reforms year:', options: ['1985', '1991', '1995', '2000'], correct: 1, subject: 'economics', explanation: '1991 under PM Narasimha Rao' },
  { question: 'Which is NOT a function of management?', options: ['Planning', 'Cooperating', 'Controlling', 'Organizing'], correct: 1, subject: 'business_studies', explanation: 'Cooperating is not a management function' },
  { question: 'Monopoly means:', options: ['Many sellers', 'One seller', 'Two sellers', 'No sellers'], correct: 1, subject: 'economics', explanation: 'Monopoly = single seller, no close substitutes' },
  { question: 'Select correctly spelled:', options: ['Accomodate', 'Accommodate', 'Acommodate', 'Acomodate'], correct: 1, subject: 'english', explanation: 'Double C, double M' },
  { question: 'Current Ratio = ?', options: ['Fixed Assets / CL', 'CA / CL', 'CA / Fixed Assets', 'Sales / CA'], correct: 1, subject: 'accountancy', explanation: 'Current Assets / Current Liabilities. Ideal = 2:1' },
];

const jeeFallbackQuestions: QuizQuestion[] = [
  { question: 'At highest point of projectile, velocity = ?', options: ['Zero', 'Maximum', 'u cosθ', 'u sinθ'], correct: 2, subject: 'physics', explanation: 'Only horizontal component u cosθ remains' },
  { question: 'Hybridization of C in benzene:', options: ['sp', 'sp²', 'sp³', 'sp³d'], correct: 1, subject: 'chemistry', explanation: '3 sigma + 1 pi = sp²' },
  { question: 'd/dx (tan x) = ?', options: ['sec x', 'sec² x', 'cot x', 'cosec² x'], correct: 1, subject: 'maths', explanation: 'Standard derivative result' },
  { question: 'SI unit of magnetic flux?', options: ['Tesla', 'Weber', 'Henry', 'Gauss'], correct: 1, subject: 'physics', explanation: 'Weber (Wb) = T·m²' },
  { question: '∫(1/x) dx = ?', options: ['x', 'ln x', 'ln|x| + C', '1/x²'], correct: 2, subject: 'maths', explanation: 'Absolute value + constant C needed' },
];

const neetFallbackQuestions: QuizQuestion[] = [
  { question: 'Powerhouse of the cell?', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi'], correct: 2, subject: 'biology', explanation: 'Mitochondria produce ATP' },
  { question: 'DNA → RNA process?', options: ['Translation', 'Replication', 'Transcription', 'Transduction'], correct: 2, subject: 'biology', explanation: 'Transcription by RNA polymerase' },
  { question: 'Breathing controlled by?', options: ['Cerebrum', 'Cerebellum', 'Medulla oblongata', 'Hypothalamus'], correct: 2, subject: 'biology', explanation: 'Medulla regulates autonomic functions' },
];

const QuickQuiz: React.FC<QuickQuizProps> = ({ onBack }) => {
  const { isNeet, isCuet } = useExamMode();
  const { language } = useLanguage();

  const getFallbackQuestions = (): QuizQuestion[] => {
    if (isCuet) return cuetFallbackQuestions;
    if (isNeet) return [...jeeFallbackQuestions.filter(q => q.subject !== 'maths'), ...neetFallbackQuestions];
    return jeeFallbackQuestions;
  };

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(getFallbackQuestions());
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>(new Array(quizQuestions.length).fill(false));
  const [isLoading, setIsLoading] = useState(false);

  const generateAIQuiz = async () => {
    setIsLoading(true);
    try {
      const subject = isCuet ? 'all CUET subjects (Economics, Business Studies, Accountancy, English, General Test)' : isNeet ? 'Physics, Chemistry, Biology' : 'Physics, Chemistry, Maths';
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-revision-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'quiz',
          subject,
          examMode: isCuet ? 'CUET' : isNeet ? 'NEET' : 'JEE',
          language,
        }),
      });

      if (!response.ok) throw new Error('Failed');
      const result = await response.json();
      if (result.data && Array.isArray(result.data) && result.data.length > 0) {
        setQuizQuestions(result.data);
        setCurrentQ(0);
        setSelected(null);
        setShowResult(false);
        setScore(0);
        setAnswered(new Array(result.data.length).fill(false));
        toast.success('Fresh quiz generated!');
      }
    } catch (error) {
      console.error('AI quiz generation failed:', error);
      toast.error('Could not generate quiz. Using saved questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const question = quizQuestions[currentQ];

  const handleSelect = (idx: number) => {
    if (answered[currentQ]) return;
    setSelected(idx);
    const newAnswered = [...answered];
    newAnswered[currentQ] = true;
    setAnswered(newAnswered);
    if (idx === question.correct) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (currentQ < quizQuestions.length - 1) { setCurrentQ(currentQ + 1); setSelected(null); }
    else setShowResult(true);
  };

  const restart = () => {
    setCurrentQ(0); setSelected(null); setShowResult(false); setScore(0);
    setAnswered(new Array(quizQuestions.length).fill(false));
  };

  const subjectColors: Record<string, string> = {
    physics: 'bg-physics/10 text-physics', chemistry: 'bg-chemistry/10 text-chemistry',
    maths: 'bg-maths/10 text-maths', biology: 'bg-green-500/10 text-green-600',
    economics: 'bg-amber-500/10 text-amber-600', english: 'bg-indigo-500/10 text-indigo-600',
    general_test: 'bg-purple-500/10 text-purple-600', accountancy: 'bg-teal-500/10 text-teal-600',
    business_studies: 'bg-orange-500/10 text-orange-600',
  };

  const subjectLabels: Record<string, string> = {
    physics: 'Physics', chemistry: 'Chemistry', maths: 'Maths', biology: 'Biology',
    economics: 'Economics', english: 'English', general_test: 'General Test',
    accountancy: 'Accountancy', business_studies: 'Business Studies',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="text-xl font-bold">1-Mark Quick Quiz</h2>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Generating fresh questions...</span>
        </div>
      </div>
    );
  }

  if (showResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="text-xl font-bold">Quiz Complete!</h2>
        </div>
        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="text-6xl font-bold text-primary mb-2">{score}/{quizQuestions.length}</div>
          <p className="text-muted-foreground mb-6">
            {score >= quizQuestions.length * 0.8 ? 'Excellent! Ready for exam.' :
              score >= quizQuestions.length * 0.5 ? 'Good! Revise weak areas.' :
                'Need more practice. Review concepts.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={restart} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" />Try Again</Button>
            <Button onClick={generateAIQuiz} className="gap-2"><RefreshCw className="w-4 h-4" />New Quiz</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}><ChevronLeft className="w-5 h-5" /></Button>
          <h2 className="text-xl font-bold">1-Mark Quick Quiz</h2>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={generateAIQuiz} className="gap-2">
            <RefreshCw className="w-4 h-4" />New Quiz
          </Button>
          <span className="text-sm text-muted-foreground">{currentQ + 1} / {quizQuestions.length}</span>
        </div>
      </div>

      <div className="flex gap-1">
        {quizQuestions.map((_, i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors',
            i === currentQ ? 'bg-primary' : i < currentQ ? 'bg-primary/50' : 'bg-secondary'
          )} />
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        {question?.subject && (
          <div className="flex items-center gap-2 mb-4">
            <span className={cn('text-xs px-2 py-1 rounded-full', subjectColors[question.subject] || 'bg-primary/10 text-primary')}>
              {subjectLabels[question.subject] || question.subject}
            </span>
          </div>
        )}
        <p className="text-lg font-medium mb-6">{question?.question}</p>
        <div className="space-y-3">
          {question?.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrect = i === question.correct;
            const showFeedback = answered[currentQ];
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={answered[currentQ]}
                className={cn('w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3',
                  !showFeedback && 'hover:border-primary hover:bg-primary/5',
                  showFeedback && isCorrect && 'border-green-500 bg-green-500/10',
                  showFeedback && isSelected && !isCorrect && 'border-red-500 bg-red-500/10',
                  !showFeedback && 'border-border'
                )}>
                <span className={cn('w-6 h-6 rounded-full border flex items-center justify-center text-sm',
                  showFeedback && isCorrect && 'bg-green-500 text-white border-green-500',
                  showFeedback && isSelected && !isCorrect && 'bg-red-500 text-white border-red-500'
                )}>
                  {showFeedback && isCorrect ? <CheckCircle className="w-4 h-4" /> :
                    showFeedback && isSelected && !isCorrect ? <XCircle className="w-4 h-4" /> :
                      String.fromCharCode(65 + i)}
                </span>
                {option}
              </button>
            );
          })}
        </div>
        {answered[currentQ] && (
          <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground"><strong>Explanation:</strong> {question?.explanation}</p>
          </div>
        )}
      </div>

      {answered[currentQ] && (
        <Button onClick={nextQuestion} className="w-full">
          {currentQ < quizQuestions.length - 1 ? 'Next Question' : 'See Results'}
        </Button>
      )}
    </div>
  );
};

export default QuickQuiz;
