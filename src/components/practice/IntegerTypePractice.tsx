import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle2, XCircle, RefreshCw, Hash, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AIIntegerQuestion {
    question_text: string;
    integer_answer: number;
    tolerance?: number;
    explanation: string;
    concept_tested?: string;
    common_mistake?: string;
}

interface IntegerTypePracticeProps {
    subchapterId: string;
    subchapterName: string;
    chapterId: string;
    chapterName: string;
    subject: string;
    onBack: () => void;
}

// Fallback static questions in case AI fails
function getFallbackQuestions(subject: string): AIIntegerQuestion[] {
    if (subject === 'physics') return [
        { question_text: 'A body starts from rest and gains velocity 20 m/s in 4 s. What is its acceleration (m/s²)?', integer_answer: 5, explanation: 'a = Δv/t = 20/4 = 5 m/s²', concept_tested: 'Kinematics' },
        { question_text: 'A spring of k = 100 N/m is compressed by 0.2 m. Elastic PE stored (in J)?', integer_answer: 2, explanation: 'PE = ½kx² = ½ × 100 × 0.04 = 2 J', concept_tested: 'Work & Energy' },
    ];
    if (subject === 'chemistry') return [
        { question_text: 'Moles of H₂O in 36 g of water? (Molar mass = 18 g/mol)', integer_answer: 2, explanation: 'moles = 36/18 = 2', concept_tested: 'Mole concept' },
        { question_text: 'pH of 0.001 M HCl solution?', integer_answer: 3, explanation: 'pH = -log(0.001) = 3', concept_tested: 'Ionic equilibrium' },
    ];
    if (subject === 'biology') return [
        { question_text: 'How many chromosomes does a normal human somatic cell contain?', integer_answer: 46, explanation: '23 pairs × 2 = 46 chromosomes in diploid cells', concept_tested: 'Cell biology' },
        { question_text: 'How many chambers does the human heart have?', integer_answer: 4, explanation: '2 atria + 2 ventricles = 4 chambers', concept_tested: 'Physiology' },
    ];
    return [
        { question_text: 'How many terms are in the expansion of (x + y)¹⁰?', integer_answer: 11, explanation: 'Terms in (x+y)ⁿ = n + 1 = 11', concept_tested: 'Binomial theorem' },
        { question_text: '∫₀² x dx = ?', integer_answer: 2, explanation: '[x²/2]₀² = 4/2 = 2', concept_tested: 'Integration' },
    ];
}

const IntegerTypePractice: React.FC<IntegerTypePracticeProps> = ({
    subchapterId,
    subchapterName,
    chapterId,
    chapterName,
    subject,
    onBack,
}) => {
    const [questions, setQuestions] = useState<AIIntegerQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState<{ correct: boolean; userAnswer: number }[]>([]);
    const [done, setDone] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            setLoadError(null);
            try {
                const { data, error } = await supabase.functions.invoke('generate-questions', {
                    body: {
                        subchapterId,
                        subchapterName,
                        chapterId,
                        chapterName,
                        subject,
                        difficulty: 'medium',
                        type: 'INTEGER',
                        count: 5,
                    },
                });

                if (error) throw new Error(error.message);
                if (data?.error) throw new Error(data.error);

                const qs: AIIntegerQuestion[] = (data?.questions || []).map((q: any) => ({
                    question_text: q.question_text,
                    integer_answer: Number(q.integer_answer ?? 0),
                    tolerance: q.tolerance ?? 0,
                    explanation: q.explanation || '',
                    concept_tested: q.concept_tested || '',
                    common_mistake: q.common_mistake || '',
                }));

                if (qs.length === 0) throw new Error('No questions returned');
                setQuestions(qs);
            } catch (err: any) {
                console.warn('AI question generation failed, using fallback:', err.message);
                setLoadError('Using sample questions (AI unavailable)');
                setQuestions(getFallbackQuestions(subject));
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [subchapterId, subject]);

    const question = questions[currentIdx];
    const isCorrect = submitted && Math.abs(parseFloat(userInput) - question.integer_answer) <= (question.tolerance ?? 0);

    const handleSubmit = () => {
        if (!userInput.trim()) return;
        setSubmitted(true);
        const correct = Math.abs(parseFloat(userInput) - question.integer_answer) <= (question.tolerance ?? 0);
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

    // ─── Loading state ───
    if (isLoading) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className="bg-card border border-border rounded-xl p-10 text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 text-primary">
                        <Sparkles className="w-6 h-6 animate-pulse" />
                        <Loader2 className="w-6 h-6 animate-spin" />
                    </div>
                    <p className="font-semibold text-lg">Generating questions for <span className="text-primary">{subchapterName}</span>...</p>
                    <p className="text-sm text-muted-foreground">AI is crafting chapter-specific Integer Type questions</p>
                    <div className="flex gap-2 justify-center mt-2">
                        {[0, 1, 2, 3, 4].map(i => (
                            <div key={i} className="h-2 w-10 bg-secondary rounded-full animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Results screen ───
    const score = results.filter(r => r.correct).length;
    if (done) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Practice
                </Button>
                <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
                    <div className="text-5xl">{score === questions.length ? '🎯' : score >= questions.length * 0.7 ? '💪' : '📖'}</div>
                    <h2 className="text-2xl font-bold">{score}/{questions.length} correct</h2>
                    <p className="text-muted-foreground">
                        {score === questions.length ? 'Perfect! All integers correct! 🎉' :
                            score >= questions.length * 0.7 ? 'Great work! Keep practicing.' :
                                'Review the solutions below and try again.'}
                    </p>
                    {loadError && <p className="text-xs text-amber-500">{loadError}</p>}
                    <div className="text-left space-y-3 mt-4">
                        {questions.map((q, i) => (
                            <div key={i} className={cn('rounded-lg p-3 text-sm', results[i]?.correct ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30')}>
                                <p className="font-medium mb-1">{q.question_text}</p>
                                <p className={cn('font-bold text-xs', results[i]?.correct ? 'text-green-600' : 'text-red-500')}>
                                    Your answer: {results[i]?.userAnswer ?? '—'} | Correct: {q.integer_answer}
                                </p>
                                {!results[i]?.correct && <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>}
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

    // ─── Main practice UI ───
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

            {loadError && (
                <p className="text-xs text-amber-500 text-center">{loadError}</p>
            )}

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
            <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{subject}</span>
                        {question.concept_tested && (
                            <span className="text-xs text-muted-foreground">{question.concept_tested}</span>
                        )}
                    </div>
                    <p className="text-base font-medium leading-relaxed">{question.question_text}</p>
                </div>

                {/* Input */}
                <div className="space-y-3">
                    <label className="text-sm font-medium">Enter your answer (integer):</label>
                    <div className="flex gap-3">
                        <Input
                            ref={inputRef}
                            type="number"
                            value={userInput}
                            onChange={e => setUserInput(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !submitted && handleSubmit()}
                            placeholder="0"
                            disabled={submitted}
                            className="text-center text-2xl font-bold h-14"
                            autoFocus
                        />
                    </div>

                    {!submitted ? (
                        <Button onClick={handleSubmit} disabled={!userInput.trim()} className="w-full h-12">
                            Submit Answer
                        </Button>
                    ) : (
                        <div className="space-y-3">
                            <div className={cn('flex items-start gap-3 p-4 rounded-xl', isCorrect ? 'bg-green-500/10 border border-green-500/30' : 'bg-red-500/10 border border-red-500/30')}>
                                {isCorrect
                                    ? <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0 mt-0.5" />
                                    : <XCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />}
                                <div>
                                    <p className={cn('font-bold', isCorrect ? 'text-green-600' : 'text-red-600')}>
                                        {isCorrect ? 'Correct! ✓' : `Incorrect. Answer: ${question.integer_answer}`}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">{question.explanation}</p>
                                    {question.common_mistake && (
                                        <p className="text-xs text-amber-500 mt-1">⚠ Common mistake: {question.common_mistake}</p>
                                    )}
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
