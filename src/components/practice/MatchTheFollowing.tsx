import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, Link, Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AIMatchQuestion {
    question_text: string;
    match_pairs: {
        left: string[];
        right: string[];
        mapping: Record<string, string>; // { "A": "Q", "B": "R", ... }
    };
    explanation: string;
    concept_tested?: string;
}

interface MatchTheFollowingProps {
    subchapterId: string;
    subchapterName: string;
    chapterId: string;
    chapterName: string;
    subject: string;
    examMode?: 'JEE' | 'NEET';
    onBack: () => void;
}

// Convert AI mapping format to internal indexes
function buildDisplaySet(q: AIMatchQuestion, shuffledRightOrder: number[]) {
    const { left, right, mapping } = q.match_pairs;
    // mapping keys are left[0], left[1] etc OR A,B,C... but stored as actual text. Let's build index-based correct map
    const correctMap: Record<number, number> = {};
    left.forEach((lItem, li) => {
        const rItem = mapping[lItem] ?? Object.values(mapping)[li];
        const ri = right.indexOf(rItem);
        correctMap[li] = ri >= 0 ? ri : li;
    });
    return correctMap;
}

function getFallbackQuestions(subject: string): AIMatchQuestion[] {
    if (subject === 'physics') return [{
        question_text: 'Match physical quantities to their SI units:',
        match_pairs: { left: ['Force', 'Pressure', 'Work', 'Power'], right: ['Pascal', 'Watt', 'Newton', 'Joule'], mapping: { Force: 'Newton', Pressure: 'Pascal', Work: 'Joule', Power: 'Watt' } },
        explanation: 'Force→Newton, Pressure→Pascal, Work→Joule, Power→Watt', concept_tested: 'Units'
    }];
    if (subject === 'chemistry') return [{
        question_text: 'Match elements to their groups:',
        match_pairs: { left: ['Sodium', 'Chlorine', 'Iron', 'Helium'], right: ['Halogen', 'Noble gas', 'Transition metal', 'Alkali metal'], mapping: { Sodium: 'Alkali metal', Chlorine: 'Halogen', Iron: 'Transition metal', Helium: 'Noble gas' } },
        explanation: 'Na→Group 1, Cl→Group 17, Fe→d-block, He→Group 18', concept_tested: 'Periodic table'
    }];
    if (subject === 'biology') return [{
        question_text: 'Match organelles to their functions:',
        match_pairs: { left: ['Mitochondria', 'Ribosome', 'Lysosome', 'Golgi'], right: ['Protein synthesis', 'ATP production', 'Packaging', 'Digestion'], mapping: { Mitochondria: 'ATP production', Ribosome: 'Protein synthesis', Lysosome: 'Digestion', Golgi: 'Packaging' } },
        explanation: 'Mitochondria→ATP, Ribosome→Protein, Lysosome→Digestion, Golgi→Packaging', concept_tested: 'Cell biology'
    }];
    return [{
        question_text: 'Match conic sections to their standard equations:',
        match_pairs: { left: ['Circle', 'Ellipse', 'Hyperbola', 'Parabola'], right: ['x²/a² - y²/b² = 1', 'y² = 4ax', 'x² + y² = r²', 'x²/a² + y²/b² = 1'], mapping: { Circle: 'x² + y² = r²', Ellipse: 'x²/a² + y²/b² = 1', Hyperbola: 'x²/a² - y²/b² = 1', Parabola: 'y² = 4ax' } },
        explanation: 'Standard forms for each conic section', concept_tested: 'Coordinate geometry'
    }];
}

// Shuffle array, returns new shuffled index array
function shuffleIndexes(len: number): number[] {
    const arr = Array.from({ length: len }, (_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

const MatchTheFollowing: React.FC<MatchTheFollowingProps> = ({
    subchapterId,
    subchapterName,
    chapterId,
    chapterName,
    subject,
    examMode = 'JEE',
    onBack,
}) => {
    const [questions, setQuestions] = useState<AIMatchQuestion[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // Per-question state
    const [qIdx, setQIdx] = useState(0);
    const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
    const [userMatches, setUserMatches] = useState<Record<number, number>>({}); // leftIdx → rightIdx
    const [submitted, setSubmitted] = useState(false);
    const [scores, setScores] = useState<number[]>([]);
    const [done, setDone] = useState(false);

    // Shuffled order of right column per question
    const [shuffles, setShuffles] = useState<number[][]>([]);

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
                        type: 'MATCH',
                        count: 3,
                        examMode,
                    },
                });

                if (error) throw new Error(error.message);
                if (data?.error) throw new Error(data.error);

                const qs: AIMatchQuestion[] = (data?.questions || []).map((q: any) => ({
                    question_text: q.question_text || 'Match the following:',
                    match_pairs: q.match_pairs || { left: [], right: [], mapping: {} },
                    explanation: q.explanation || '',
                    concept_tested: q.concept_tested || '',
                })).filter((q: AIMatchQuestion) => q.match_pairs.left.length > 0);

                if (qs.length === 0) throw new Error('No questions returned');
                setQuestions(qs);
                setShuffles(qs.map(q => shuffleIndexes(q.match_pairs.right.length)));
            } catch (err: any) {
                console.warn('AI match generation failed, using fallback:', err.message);
                setLoadError('Using sample questions (AI unavailable)');
                const fallback = getFallbackQuestions(subject);
                setQuestions(fallback);
                setShuffles(fallback.map(q => shuffleIndexes(q.match_pairs.right.length)));
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuestions();
    }, [subchapterId, subject]);

    const q = questions[qIdx];
    const shuffledRight = shuffles[qIdx] ?? [];
    const correctMap = q ? buildDisplaySet(q, shuffledRight) : {};

    const handleSelectLeft = (li: number) => {
        if (submitted) return;
        setSelectedLeft(li === selectedLeft ? null : li);
    };

    const handleSelectRight = (displayIdx: number) => {
        if (submitted || selectedLeft === null) return;
        const actualRi = shuffledRight[displayIdx];
        setUserMatches(prev => ({ ...prev, [selectedLeft]: actualRi }));
        setSelectedLeft(null);
    };

    const handleSubmit = () => {
        if (!q) return;
        let correct = 0;
        q.match_pairs.left.forEach((_, li) => {
            if (userMatches[li] === correctMap[li]) correct++;
        });
        setScores(prev => [...prev, correct]);
        setSubmitted(true);
    };

    const handleNext = () => {
        if (qIdx < questions.length - 1) {
            setQIdx(i => i + 1);
            setSelectedLeft(null);
            setUserMatches({});
            setSubmitted(false);
        } else {
            setDone(true);
        }
    };

    const handleRestart = () => {
        setQIdx(0);
        setSelectedLeft(null);
        setUserMatches({});
        setSubmitted(false);
        setScores([]);
        setDone(false);
    };

    const totalCorrect = scores.reduce((a, b) => a + b, 0);
    const totalPossible = questions.reduce((a, q2) => a + (q2.match_pairs.left.length), 0);

    // ─── Loading ───
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
                    <p className="font-semibold text-lg">Generating matches for <span className="text-primary">{subchapterName}</span>...</p>
                    <p className="text-sm text-muted-foreground">AI is crafting chapter-specific matching questions</p>
                    <div className="flex gap-2 justify-center mt-2">
                        {[0, 1, 2].map(i => (
                            <div key={i} className="h-2 w-16 bg-secondary rounded-full animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // ─── Done ───
    if (done) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Practice
                </Button>
                <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
                    <div className="text-5xl">{totalCorrect === totalPossible ? '🔗' : totalCorrect >= totalPossible * 0.7 ? '💪' : '📖'}</div>
                    <h2 className="text-2xl font-bold">{totalCorrect}/{totalPossible} matches correct</h2>
                    <p className="text-muted-foreground">
                        {totalCorrect === totalPossible ? 'Perfect matching! 🎉' :
                            totalCorrect >= totalPossible * 0.7 ? 'Good work! Review any incorrect matches.' :
                                'Keep practicing — matching takes pattern recognition!'}
                    </p>
                    {loadError && <p className="text-xs text-amber-500">{loadError}</p>}
                    <Button onClick={handleRestart} className="gap-2 mt-4">
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </Button>
                </div>
            </div>
        );
    }

    if (!q) return null;

    // ─── Main UI ───
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Link className="w-4 h-4" />
                    <span>Match the Following · {qIdx + 1}/{questions.length}</span>
                </div>
            </div>

            {loadError && <p className="text-xs text-amber-500 text-center">{loadError}</p>}

            {/* Progress */}
            <div className="flex gap-1">
                {questions.map((_, i) => (
                    <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors',
                        i < qIdx ? 'bg-primary/60' : i === qIdx ? 'bg-primary' : 'bg-secondary'
                    )} />
                ))}
            </div>

            {/* Match set */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full capitalize">{subject}</span>
                        {q.concept_tested && <span className="text-xs text-muted-foreground">{q.concept_tested}</span>}
                    </div>
                    <h3 className="font-semibold">{q.question_text}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                        {!submitted ? 'Click a Column A item, then click its match in Column B.' : 'Results below.'}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Column A */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Column A</p>
                        {q.match_pairs.left.map((item, li) => {
                            const matchedRi = userMatches[li];
                            const isSelected = selectedLeft === li;
                            const isCorrectMatch = submitted && matchedRi === correctMap[li];
                            const isWrongMatch = submitted && matchedRi !== undefined && matchedRi !== correctMap[li];
                            return (
                                <button
                                    key={li}
                                    onClick={() => handleSelectLeft(li)}
                                    className={cn(
                                        'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all',
                                        isSelected && 'border-primary bg-primary/10 font-semibold',
                                        !isSelected && !submitted && 'border-border hover:border-primary/50',
                                        submitted && isCorrectMatch && 'border-green-500 bg-green-500/10',
                                        submitted && isWrongMatch && 'border-red-500 bg-red-500/10',
                                        !submitted && matchedRi !== undefined && !isSelected && 'border-blue-400 bg-blue-400/10',
                                    )}
                                >
                                    <span className="text-muted-foreground mr-2 text-xs">{li + 1}.</span>
                                    {item}
                                    {matchedRi !== undefined && (
                                        <span className="block text-xs text-muted-foreground mt-0.5">
                                            → {q.match_pairs.right[matchedRi]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Column B (shuffled) */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Column B</p>
                        {shuffledRight.map((actualRi, displayIdx) => {
                            const isMatched = Object.values(userMatches).includes(actualRi);
                            const isCorrectAnswer = submitted && q.match_pairs.left.some(
                                (_, li) => correctMap[li] === actualRi && userMatches[li] === actualRi
                            );
                            const isWrongAnswer = submitted && isMatched && !isCorrectAnswer;
                            return (
                                <button
                                    key={displayIdx}
                                    onClick={() => handleSelectRight(displayIdx)}
                                    disabled={submitted}
                                    className={cn(
                                        'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all',
                                        !submitted && selectedLeft !== null && !isMatched && 'border-primary/50 hover:border-primary hover:bg-primary/5 cursor-pointer',
                                        !submitted && selectedLeft === null && 'border-border cursor-default',
                                        !submitted && isMatched && 'border-blue-400 bg-blue-400/10 cursor-default',
                                        submitted && isCorrectAnswer && 'border-green-500 bg-green-500/10',
                                        submitted && isWrongAnswer && 'border-red-500 bg-red-500/10',
                                        submitted && !isMatched && 'border-amber-400 bg-amber-400/10',
                                    )}
                                >
                                    <span className="text-muted-foreground mr-2 text-xs">{String.fromCharCode(65 + displayIdx)}.</span>
                                    {q.match_pairs.right[actualRi]}
                                    {submitted && (
                                        isCorrectAnswer ? <CheckCircle2 className="inline w-3.5 h-3.5 text-green-500 ml-1" /> :
                                            isWrongAnswer ? <XCircle className="inline w-3.5 h-3.5 text-red-500 ml-1" /> : null
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Explanation after submit */}
                {submitted && (
                    <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                        <p className="font-medium mb-1">Correct Matching:</p>
                        <p className="text-muted-foreground">{q.explanation}</p>
                    </div>
                )}

                {!submitted ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={Object.keys(userMatches).length === 0}
                        className="w-full h-12 mt-2"
                    >
                        Submit Matches
                    </Button>
                ) : (
                    <Button onClick={handleNext} className="w-full h-12 mt-2">
                        {qIdx < questions.length - 1 ? 'Next Set →' : 'See Results'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default MatchTheFollowing;
