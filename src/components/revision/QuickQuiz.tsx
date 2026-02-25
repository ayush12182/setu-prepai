import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';

interface QuickQuizProps {
  onBack: () => void;
}

const baseQuestions = [
  {
    question: 'At the highest point of projectile motion, what is the velocity?',
    options: ['Zero', 'Maximum', 'u cosθ', 'u sinθ'],
    correct: 2, subject: 'physics',
    explanation: 'At highest point, vertical component = 0, only horizontal u cosθ remains'
  },
  {
    question: 'Which gas has the highest value of Cp/Cv?',
    options: ['Monoatomic', 'Diatomic', 'Triatomic', 'All equal'],
    correct: 0, subject: 'physics',
    explanation: 'Monoatomic: γ = 5/3, Diatomic: γ = 7/5, Triatomic: γ = 4/3'
  },
  {
    question: 'The hybridization of carbon in benzene is:',
    options: ['sp', 'sp²', 'sp³', 'sp³d'],
    correct: 1, subject: 'chemistry',
    explanation: 'Each C in benzene has 3 sigma bonds + 1 pi bond = sp² hybridization'
  },
  {
    question: 'Which has highest ionization energy?',
    options: ['Na', 'Mg', 'Al', 'Si'],
    correct: 1, subject: 'chemistry',
    explanation: 'Mg has stable 3s² configuration, removing electron needs more energy'
  },
  {
    question: 'What is the SI unit of magnetic flux?',
    options: ['Tesla', 'Weber', 'Henry', 'Gauss'],
    correct: 1, subject: 'physics',
    explanation: 'Magnetic flux φ = B × A, unit is Weber (Wb) = T·m²'
  },
  {
    question: 'Which is the strongest nucleophile in polar aprotic solvent?',
    options: ['F⁻', 'Cl⁻', 'Br⁻', 'I⁻'],
    correct: 0, subject: 'chemistry',
    explanation: 'In polar aprotic solvents, nucleophilicity follows basicity: F⁻ is strongest'
  },
  {
    question: 'In photoelectric effect, if frequency is doubled:',
    options: ['KE doubles', 'KE more than doubles', 'Current doubles', 'No emission'],
    correct: 1, subject: 'physics',
    explanation: 'KE = hν - φ. If ν doubles, KE increases by more than 2x since φ is subtracted'
  }
];

const jeeQuestions = [
  {
    question: 'd/dx (tan x) = ?',
    options: ['sec x', 'sec² x', 'cot x', 'cosec² x'],
    correct: 1, subject: 'maths',
    explanation: 'd/dx (sin x/cos x) = (cos²x + sin²x)/cos²x = sec²x'
  },
  {
    question: '∫(1/x) dx = ?',
    options: ['x', 'ln x', 'ln|x| + C', '1/x²'],
    correct: 2, subject: 'maths',
    explanation: 'Absolute value needed for negative x, and constant of integration'
  },
  {
    question: 'lim(x→0) sin x / x = ?',
    options: ['0', '1', '∞', 'Does not exist'],
    correct: 1, subject: 'maths',
    explanation: 'Standard limit. Use L\'Hospital or Taylor series: sin x ≈ x for small x'
  }
];

const neetQuestions = [
  {
    question: 'Which organelle is called the "powerhouse of the cell"?',
    options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'],
    correct: 2, subject: 'biology',
    explanation: 'Mitochondria produce ATP through cellular respiration — the main energy currency'
  },
  {
    question: 'The process of producing RNA from DNA is called:',
    options: ['Translation', 'Replication', 'Transcription', 'Transduction'],
    correct: 2, subject: 'biology',
    explanation: 'Transcription = DNA → RNA, done by RNA polymerase in the nucleus'
  },
  {
    question: 'Which part of the brain controls breathing and heartbeat?',
    options: ['Cerebrum', 'Cerebellum', 'Medulla oblongata', 'Hypothalamus'],
    correct: 2, subject: 'biology',
    explanation: 'Medulla oblongata (part of brainstem) regulates autonomic functions like respiration and heart rate'
  }
];

const cuetQuestions = [
  {
    question: 'GDP at Market Price = GDP at Factor Cost + ?',
    options: ['Subsidies', 'Net Indirect Taxes', 'Depreciation', 'Net Factor Income from Abroad'],
    correct: 1, subject: 'economics',
    explanation: 'GDP(MP) = GDP(FC) + Indirect Taxes - Subsidies = GDP(FC) + Net Indirect Taxes'
  },
  {
    question: 'Who gave the 14 Principles of Management?',
    options: ['F.W. Taylor', 'Henri Fayol', 'Peter Drucker', 'Elton Mayo'],
    correct: 1, subject: 'business_studies',
    explanation: 'Henri Fayol is the father of General Management and gave 14 Principles'
  },
  {
    question: 'Which market has only one seller and many buyers?',
    options: ['Perfect Competition', 'Monopoly', 'Oligopoly', 'Monopolistic Competition'],
    correct: 1, subject: 'economics',
    explanation: 'Monopoly = single seller, no close substitutes, barriers to entry'
  },
  {
    question: 'Goodwill is a:',
    options: ['Tangible asset', 'Intangible asset', 'Fictitious asset', 'Current asset'],
    correct: 1, subject: 'accountancy',
    explanation: 'Goodwill is an intangible, non-physical asset representing reputation and brand value'
  },
  {
    question: 'The antonym of "Benevolent" is:',
    options: ['Kind', 'Generous', 'Malevolent', 'Charitable'],
    correct: 2, subject: 'english',
    explanation: 'Benevolent = well-meaning, kind. Malevolent = having evil intent'
  },
  {
    question: 'If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D?',
    options: ['Father', 'Uncle', 'Grandfather', 'Brother'],
    correct: 1, subject: 'general_test',
    explanation: 'A is brother of B, B is sister of C (so A & B are siblings of C\'s generation), C is father of D → A is uncle of D'
  },
  {
    question: 'Which Article of the Indian Constitution deals with Right to Equality?',
    options: ['Article 12', 'Article 14', 'Article 19', 'Article 21'],
    correct: 1, subject: 'general_test',
    explanation: 'Article 14: Equality before law and equal protection of laws'
  },
  {
    question: 'LPG reforms were introduced in India in which year?',
    options: ['1985', '1991', '1995', '2000'],
    correct: 1, subject: 'economics',
    explanation: 'Liberalisation, Privatisation, Globalisation reforms started in 1991 under PM Narasimha Rao'
  },
  {
    question: 'Select the correctly spelled word:',
    options: ['Accomodate', 'Accommodate', 'Acommodate', 'Acomodate'],
    correct: 1, subject: 'english',
    explanation: 'Accommodate has double C and double M'
  },
  {
    question: 'Which is NOT a function of management?',
    options: ['Planning', 'Cooperating', 'Controlling', 'Organizing'],
    correct: 1, subject: 'business_studies',
    explanation: 'Functions of management: Planning, Organizing, Staffing, Directing, Controlling. Cooperating is not one.'
  },
];

const QuickQuiz: React.FC<QuickQuizProps> = ({ onBack }) => {
  const { isNeet, isCuet } = useExamMode();
  const quizQuestions = isCuet
    ? cuetQuestions
    : isNeet
      ? [...baseQuestions, ...neetQuestions]
      : [...baseQuestions, ...jeeQuestions];

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
    physics: 'bg-physics/10 text-physics',
    chemistry: 'bg-chemistry/10 text-chemistry',
    maths: 'bg-maths/10 text-maths',
    biology: 'bg-green-500/10 text-green-600',
    economics: 'bg-amber-500/10 text-amber-600',
    english: 'bg-indigo-500/10 text-indigo-600',
    general_test: 'bg-purple-500/10 text-purple-600',
    accountancy: 'bg-teal-500/10 text-teal-600',
    business_studies: 'bg-orange-500/10 text-orange-600',
  };

  const subjectLabels: Record<string, string> = {
    physics: 'Physics', chemistry: 'Chemistry', maths: 'Maths', biology: 'Biology',
    economics: 'Economics', english: 'English', general_test: 'General Test',
    accountancy: 'Accountancy', business_studies: 'Business Studies',
  };

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
          <Button onClick={restart} className="gap-2"><RotateCcw className="w-4 h-4" />Try Again</Button>
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
        <span className="text-sm text-muted-foreground">{currentQ + 1} / {quizQuestions.length}</span>
      </div>

      <div className="flex gap-1">
        {quizQuestions.map((_, i) => (
          <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors',
            i === currentQ ? 'bg-primary' : i < currentQ ? 'bg-primary/50' : 'bg-secondary'
          )} />
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('text-xs px-2 py-1 rounded-full capitalize', subjectColors[question.subject] || 'bg-primary/10 text-primary')}>
            {subjectLabels[question.subject] || question.subject}
          </span>
        </div>
        <p className="text-lg font-medium mb-6">{question.question}</p>
        <div className="space-y-3">
          {question.options.map((option, i) => {
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
            <p className="text-sm text-muted-foreground"><strong>Explanation:</strong> {question.explanation}</p>
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
