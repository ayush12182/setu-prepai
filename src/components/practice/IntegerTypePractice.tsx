import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';

interface IntegerQuestion {
    question: string;
    answer: number;
    tolerance?: number; // allowed margin e.g. ±0
    explanation: string;
    unit?: string;
}

interface IntegerTypePracticeProps {
    subchapterName: string;
    chapterName: string;
    subject: string;
    onBack: () => void;
}

// Generate questions dynamically based on chapter/subject
function generateIntegerQuestions(
    subchapterName: string,
    chapterName: string,
    subject: string,
    isNeet: boolean
): IntegerQuestion[] {
    const key = `${subject}-${chapterName}`.toLowerCase();

    // Physics questions (JEE & NEET)
    if (subject === 'physics') {
        return [
            {
                question: `A body starts from rest and accelerates uniformly. If it covers 45 m in the 5th second, what is the acceleration (in m/s²)?`,
                answer: 10,
                explanation: 'Using s_n = u + a(2n-1)/2: 45 = 0 + a(9)/2 → a = 10 m/s²',
                unit: 'm/s²'
            },
            {
                question: `A projectile is launched at 60° with speed 20 m/s. What is the maximum height reached (in m)? (g = 10 m/s²)`,
                answer: 15,
                explanation: 'H = u²sin²θ / 2g = 400 × 0.75 / 20 = 15 m',
                unit: 'm'
            },
            {
                question: `Two blocks of mass 3 kg and 7 kg are connected by a string over a frictionless pulley. What is the acceleration of the system (in m/s²)? (g = 10 m/s²)`,
                answer: 4,
                explanation: 'a = (m₂ - m₁)g / (m₁ + m₂) = (7-3)×10 / 10 = 4 m/s²',
                unit: 'm/s²'
            },
            {
                question: `A spring of spring constant 200 N/m is compressed by 10 cm. What is the elastic potential energy stored (in J)?`,
                answer: 1,
                explanation: 'PE = ½kx² = ½ × 200 × 0.01 = 1 J',
                unit: 'J'
            },
            {
                question: `A current of 2 A flows through a resistor of 5 Ω. What is the power dissipated (in W)?`,
                answer: 20,
                explanation: 'P = I²R = 4 × 5 = 20 W',
                unit: 'W'
            },
        ];
    }

    // Chemistry questions (JEE & NEET)
    if (subject === 'chemistry') {
        return [
            {
                question: `How many moles of CO₂ are produced when 44 g of CO₂ is completely burnt? (Molar mass of CO₂ = 44 g/mol)`,
                answer: 1,
                explanation: 'Moles = mass / molar mass = 44 / 44 = 1 mol',
                unit: 'mol'
            },
            {
                question: `The pH of a 0.01 M HCl solution is?`,
                answer: 2,
                explanation: 'pH = -log[H⁺] = -log(0.01) = -log(10⁻²) = 2',
                unit: ''
            },
            {
                question: `How many σ bonds are present in one molecule of ethyne (C₂H₂)?`,
                answer: 3,
                explanation: 'C≡C has 1 σ, C-H × 2 = 2 σ bonds. Total = 3 σ bonds',
                unit: ''
            },
            {
                question: `What is the oxidation state of Mn in KMnO₄?`,
                answer: 7,
                explanation: 'K = +1, O = -2 × 4 = -8. So 1 + Mn - 8 = 0 → Mn = +7',
                unit: ''
            },
            {
                question: `How many electrons are transferred in the reaction: Zn + CuSO₄ → ZnSO₄ + Cu? (Give number of electrons per formula unit)`,
                answer: 2,
                explanation: 'Zn → Zn²⁺ + 2e⁻ and Cu²⁺ + 2e⁻ → Cu. So 2 electrons transferred.',
                unit: ''
            },
        ];
    }

    // Biology (NEET) - numerical/integer type
    if (subject === 'biology') {
        return [
            {
                question: `How many chromosomes does a normal human somatic cell have?`,
                answer: 46,
                explanation: 'Humans have 46 chromosomes (23 pairs) in diploid somatic cells.',
                unit: ''
            },
            {
                question: `How many ATP molecules are produced in one cycle of Krebs cycle?`,
                answer: 1,
                explanation: 'One turn of Krebs cycle produces 1 ATP (GTP) directly, plus NADH and FADH₂ for oxidative phosphorylation.',
                unit: 'ATP'
            },
            {
                question: `How many chambers does the human heart have?`,
                answer: 4,
                explanation: '2 atria (right and left) + 2 ventricles (right and left) = 4 chambers',
                unit: ''
            },
            {
                question: `How many pairs of cranial nerves are present in humans?`,
                answer: 12,
                explanation: 'There are 12 pairs of cranial nerves arising from the brain.',
                unit: 'pairs'
            },
            {
                question: `How many base pairs are in one complete turn of a B-DNA helix?`,
                answer: 10,
                explanation: 'One complete turn of B-form DNA contains approximately 10 base pairs.',
                unit: 'bp'
            },
        ];
    }

    // Maths (JEE)
    return [
        {
            question: `If f(x) = x³ - 3x² + 3x - 1, what is f(1)?`,
            answer: 0,
            explanation: 'f(1) = 1 - 3 + 3 - 1 = 0. Note: f(x) = (x-1)³',
            unit: ''
        },
        {
            question: `How many 3-digit numbers can be formed using digits 1, 2, 3, 4 without repetition?`,
            answer: 24,
            explanation: '⁴P₃ = 4!/(4-3)! = 4 × 3 × 2 = 24',
            unit: ''
        },
        {
            question: `The number of terms in the expansion of (x + y)¹⁰ is?`,
            answer: 11,
            explanation: 'Number of terms in (x+y)ⁿ = n + 1 = 10 + 1 = 11',
            unit: ''
        },
        {
            question: `If |z| = 2 for complex number z, what is the maximum value of |z + 1|?`,
            answer: 3,
            explanation: '|z + 1| ≤ |z| + |1| = 2 + 1 = 3 (triangle inequality, maximum)',
            unit: ''
        },
        {
            question: `∫₀¹ x² dx = ? (Enter answer × 3)`,
            answer: 1,
            explanation: '∫₀¹ x² dx = [x³/3]₀¹ = 1/3. So 1/3 × 3 = 1',
            unit: ''
        },
    ];
}

const IntegerTypePractice: React.FC<IntegerTypePracticeProps> = ({
    subchapterName,
    chapterName,
    subject,
    onBack
}) => {
    const { isNeet } = useExamMode();
    const questions = generateIntegerQuestions(subchapterName, chapterName, subject, isNeet);

    const [currentIdx, setCurrentIdx] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState<{ correct: boolean; userAnswer: number }[]>([]);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const question = questions[currentIdx];
    const isCorrect = submitted && Math.abs(parseFloat(userInput) - question.answer) <= (question.tolerance ?? 0);

    const handleSubmit = () => {
        if (!userInput.trim()) return;
        setSubmitted(true);
        const correct = Math.abs(parseFloat(userInput) - question.answer) <= (question.tolerance ?? 0);
        setResults(prev => [...prev, { correct, userAnswer: parseFloat(userInput) }]);
    };

    const handleNext = () => {
        if (currentIdx < questions.length - 1) {
            setCurrentIdx(i => i + 1);
            setUserInput('');
            setSubmitted(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        } else {
            setDone(true);
        }
    };

    const handleRestart = () => {
        setCurrentIdx(0);
        setUserInput('');
        setSubmitted(false);
        setResults([]);
        setDone(false);
    };

    const score = results.filter(r => r.correct).length;

    if (done) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Practice
                </Button>
                <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
                    <div className="text-5xl">🎯</div>
                    <h2 className="text-2xl font-bold">{score}/{questions.length} correct</h2>
                    <p className="text-muted-foreground">
                        {score === questions.length ? 'Perfect! All integers correct! 🎉' :
                            score >= questions.length * 0.7 ? 'Great work! Keep practicing.' :
                                'Review the solutions below and try again.'}
                    </p>
                    <div className="text-left space-y-3 mt-6">
                        {questions.map((q, i) => (
                            <div key={i} className={cn('rounded-lg p-3 text-sm', results[i]?.correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30')}>
                                <p className="font-medium mb-1">{q.question}</p>
                                <p className={cn('font-bold', results[i]?.correct ? 'text-green-600' : 'text-red-500')}>
                                    Your answer: {results[i]?.userAnswer ?? '—'} | Correct: {q.answer}{q.unit ? ` ${q.unit}` : ''}
                                </p>
                            </div>
                        ))}
                    </div>
                    <Button onClick={handleRestart} className="gap-2 mt-4">
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="w-4 h-4" />
                    <span>Integer Type · {currentIdx + 1}/{questions.length}</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="flex gap-1">
                {questions.map((_, i) => (
                    <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors',
                        i < currentIdx ? 'bg-primary/60' :
                            i === currentIdx ? 'bg-primary' : 'bg-secondary'
                    )} />
                ))}
            </div>

            {/* Question */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <div className="space-y-1">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide capitalize">{subject}</span>
                    <p className="text-lg font-medium leading-relaxed">{question.question}</p>
                    {question.unit && <span className="text-xs text-muted-foreground">Answer in: <strong>{question.unit}</strong></span>}
                </div>

                {/* Input */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Enter your answer (integer/number):</label>
                    <div className="flex gap-3">
                        <Input
                            ref={inputRef}
                            type="number"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !submitted && handleSubmit()}
                            placeholder="Type your answer..."
                            disabled={submitted}
                            className="text-center text-xl font-bold h-14 text-2xl"
                            autoFocus
                        />
                    </div>

                    {!submitted ? (
                        <Button onClick={handleSubmit} disabled={!userInput.trim()} className="w-full h-12">
                            Submit Answer
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <div className={cn('flex items-center gap-3 p-4 rounded-xl', isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30')}>
                                {isCorrect
                                    ? <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
                                    : <XCircle className="w-6 h-6 text-red-500 flex-shrink-0" />}
                                <div>
                                    <p className={cn('font-bold', isCorrect ? 'text-green-600' : 'text-red-600')}>
                                        {isCorrect ? 'Correct! ✓' : `Incorrect. Correct answer: ${question.answer}${question.unit ? ` ${question.unit}` : ''}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">{question.explanation}</p>
                                </div>
                            </div>
                            <Button onClick={handleNext} className="w-full h-12">
                                {currentIdx < questions.length - 1 ? 'Next Question →' : 'See Results'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntegerTypePractice;
