import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickQuizProps {
  onBack: () => void;
}

const quizQuestions = [
  {
    question: 'At the highest point of projectile motion, what is the velocity?',
    options: ['Zero', 'Maximum', 'u cosθ', 'u sinθ'],
    correct: 2,
    subject: 'physics',
    explanation: 'At highest point, vertical component = 0, only horizontal u cosθ remains'
  },
  {
    question: 'Which gas has the highest value of Cp/Cv?',
    options: ['Monoatomic', 'Diatomic', 'Triatomic', 'All equal'],
    correct: 0,
    subject: 'physics',
    explanation: 'Monoatomic: γ = 5/3, Diatomic: γ = 7/5, Triatomic: γ = 4/3'
  },
  {
    question: 'The hybridization of carbon in benzene is:',
    options: ['sp', 'sp²', 'sp³', 'sp³d'],
    correct: 1,
    subject: 'chemistry',
    explanation: 'Each C in benzene has 3 sigma bonds + 1 pi bond = sp² hybridization'
  },
  {
    question: 'Which has highest ionization energy?',
    options: ['Na', 'Mg', 'Al', 'Si'],
    correct: 1,
    subject: 'chemistry',
    explanation: 'Mg has stable 3s² configuration, removing electron needs more energy'
  },
  {
    question: 'd/dx (tan x) = ?',
    options: ['sec x', 'sec² x', 'cot x', 'cosec² x'],
    correct: 1,
    subject: 'maths',
    explanation: 'd/dx (sin x/cos x) = (cos²x + sin²x)/cos²x = sec²x'
  },
  {
    question: '∫(1/x) dx = ?',
    options: ['x', 'ln x', 'ln|x| + C', '1/x²'],
    correct: 2,
    subject: 'maths',
    explanation: 'Absolute value needed for negative x, and constant of integration'
  },
  {
    question: 'What is the SI unit of magnetic flux?',
    options: ['Tesla', 'Weber', 'Henry', 'Gauss'],
    correct: 1,
    subject: 'physics',
    explanation: 'Magnetic flux φ = B × A, unit is Weber (Wb) = T·m²'
  },
  {
    question: 'Which is the strongest nucleophile in polar aprotic solvent?',
    options: ['F⁻', 'Cl⁻', 'Br⁻', 'I⁻'],
    correct: 0,
    subject: 'chemistry',
    explanation: 'In polar aprotic solvents, nucleophilicity follows basicity: F⁻ is strongest'
  },
  {
    question: 'lim(x→0) sin x / x = ?',
    options: ['0', '1', '∞', 'Does not exist'],
    correct: 1,
    subject: 'maths',
    explanation: 'Standard limit. Use L\'Hospital or Taylor series: sin x ≈ x for small x'
  },
  {
    question: 'In photoelectric effect, if frequency is doubled:',
    options: ['KE doubles', 'KE more than doubles', 'Current doubles', 'No emission'],
    correct: 1,
    subject: 'physics',
    explanation: 'KE = hν - φ. If ν doubles, KE increases by more than 2x since φ is subtracted'
  }
];

const QuickQuiz: React.FC<QuickQuizProps> = ({ onBack }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean[]>(new Array(quizQuestions.length).fill(false));

  const question = quizQuestions[currentQ];

  const handleSelect = (idx: number) => {
    if (answered[currentQ]) return;
    
    setSelected(idx);
    const newAnswered = [...answered];
    newAnswered[currentQ] = true;
    setAnswered(newAnswered);
    
    if (idx === question.correct) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentQ < quizQuestions.length - 1) {
      setCurrentQ(currentQ + 1);
      setSelected(null);
    } else {
      setShowResult(true);
    }
  };

  const restart = () => {
    setCurrentQ(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setAnswered(new Array(quizQuestions.length).fill(false));
  };

  const subjectColors: Record<string, string> = {
    physics: 'bg-physics/10 text-physics',
    chemistry: 'bg-chemistry/10 text-chemistry',
    maths: 'bg-maths/10 text-maths'
  };

  if (showResult) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold">Quiz Complete!</h2>
        </div>

        <div className="bg-card border border-border rounded-xl p-8 text-center">
          <div className="text-6xl font-bold text-primary mb-2">
            {score}/{quizQuestions.length}
          </div>
          <p className="text-muted-foreground mb-6">
            {score >= 8 ? 'Excellent! Ready for exam.' : 
             score >= 5 ? 'Good! Revise weak areas.' : 
             'Need more practice. Review formulas.'}
          </p>
          <Button onClick={restart} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold">1-Mark Quick Quiz</h2>
        </div>
        <span className="text-sm text-muted-foreground">
          {currentQ + 1} / {quizQuestions.length}
        </span>
      </div>

      {/* Progress */}
      <div className="flex gap-1">
        {quizQuestions.map((_, i) => (
          <div 
            key={i} 
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i === currentQ ? 'bg-primary' : 
              i < currentQ ? 'bg-primary/50' : 'bg-secondary'
            )}
          />
        ))}
      </div>

      {/* Question */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('text-xs px-2 py-1 rounded-full capitalize', subjectColors[question.subject])}>
            {question.subject}
          </span>
        </div>
        
        <p className="text-lg font-medium mb-6">{question.question}</p>

        <div className="space-y-3">
          {question.options.map((option, i) => {
            const isSelected = selected === i;
            const isCorrect = i === question.correct;
            const showFeedback = answered[currentQ];

            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={answered[currentQ]}
                className={cn(
                  'w-full text-left px-4 py-3 rounded-xl border transition-all flex items-center gap-3',
                  !showFeedback && 'hover:border-primary hover:bg-primary/5',
                  showFeedback && isCorrect && 'border-green-500 bg-green-500/10',
                  showFeedback && isSelected && !isCorrect && 'border-red-500 bg-red-500/10',
                  !showFeedback && 'border-border'
                )}
              >
                <span className={cn(
                  'w-6 h-6 rounded-full border flex items-center justify-center text-sm',
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
            <p className="text-sm text-muted-foreground">
              <strong>Explanation:</strong> {question.explanation}
            </p>
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
