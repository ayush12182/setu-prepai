import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, RefreshCw, CheckCircle2, XCircle, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExamMode } from '@/contexts/ExamModeContext';

interface MatchSet {
    title: string;
    columnA: string[];
    columnB: string[];
    correctMapping: number[]; // correctMapping[i] = index in columnB that matches columnA[i]
    explanation: string;
}

interface MatchTheFollowingProps {
    subchapterName: string;
    chapterName: string;
    subject: string;
    onBack: () => void;
}

function generateMatchSets(
    subchapterName: string,
    chapterName: string,
    subject: string,
    isNeet: boolean
): MatchSet[] {
    if (subject === 'physics') {
        return [
            {
                title: 'Physical Quantities and Units',
                columnA: ['Force', 'Pressure', 'Work', 'Power'],
                columnB: ['Watt', 'Newton', 'Joule', 'Pascal'],
                correctMapping: [1, 3, 2, 0],
                explanation: 'Force → Newton, Pressure → Pascal, Work → Joule, Power → Watt'
            },
            {
                title: 'Laws and Scientists',
                columnA: ['Gravitation', 'Electromagnetism', 'Thermodynamics', 'Photoelectric effect'],
                columnB: ['Faraday', 'Einstein', 'Newton', 'Carnot'],
                correctMapping: [2, 0, 3, 1],
                explanation: 'Newton (Gravitation), Faraday (Electromagnetism), Carnot (Thermodynamics), Einstein (Photoelectric)'
            },
            {
                title: 'Motions and Examples',
                columnA: ['SHM', 'Projectile', 'Circular', 'Rotational'],
                columnB: ['Earth orbiting sun', 'Spinning top', 'Pendulum', 'Ball thrown at angle'],
                correctMapping: [2, 3, 0, 1],
                explanation: 'SHM → Pendulum, Projectile → Ball thrown at angle, Circular → Earth orbiting sun, Rotational → Spinning top'
            },
        ];
    }

    if (subject === 'chemistry') {
        return [
            {
                title: 'Elements and their Group',
                columnA: ['Sodium (Na)', 'Chlorine (Cl)', 'Iron (Fe)', 'Helium (He)'],
                columnB: ['Noble gas', 'Transition metal', 'Alkali metal', 'Halogen'],
                correctMapping: [2, 3, 1, 0],
                explanation: 'Na → Alkali metal (Group 1), Cl → Halogen (Group 17), Fe → Transition metal (d-block), He → Noble gas (Group 18)'
            },
            {
                title: 'Chemical Bonds and Examples',
                columnA: ['Ionic bond', 'Covalent bond', 'Metallic bond', 'Hydrogen bond'],
                columnB: ['Water (H₂O)', 'NaCl', 'Copper wire', 'O₂'],
                correctMapping: [1, 3, 2, 0],
                explanation: 'Ionic → NaCl, Covalent → O₂, Metallic → Copper, Hydrogen → Water'
            },
            {
                title: 'Reactions and Types',
                columnA: ['Combustion', 'Neutralization', 'Displacement', 'Decomposition'],
                columnB: ['CaCO₃ → CaO + CO₂', 'Zn + CuSO₄ → ZnSO₄ + Cu', 'Acid + Base → Salt', 'CH₄ + 2O₂ → CO₂ + H₂O'],
                correctMapping: [3, 2, 1, 0],
                explanation: 'Combustion → CH₄ burning, Neutralization → Acid+Base, Displacement → Zn + CuSO₄, Decomposition → CaCO₃ heating'
            },
        ];
    }

    if (subject === 'biology') {
        return [
            {
                title: 'Cell Organelles and Functions',
                columnA: ['Mitochondria', 'Ribosome', 'Lysosome', 'Golgi body'],
                columnB: ['Packaging & secretion', 'Cellular digestion', 'Protein synthesis', 'ATP production'],
                correctMapping: [3, 2, 1, 0],
                explanation: 'Mitochondria → ATP production, Ribosome → Protein synthesis, Lysosome → Cellular digestion, Golgi → Packaging'
            },
            {
                title: 'Plant Hormones and Effects',
                columnA: ['Auxin', 'Gibberellin', 'Cytokinin', 'Abscisic acid'],
                columnB: ['Stress/dormancy', 'Cell division', 'Stem elongation', 'Phototropism/apical dominance'],
                correctMapping: [3, 2, 1, 0],
                explanation: 'Auxin → Phototropism, Gibberellin → Stem elongation, Cytokinin → Cell division, ABA → Stress/dormancy'
            },
            {
                title: 'Diseases and Causative Agents',
                columnA: ['Malaria', 'Tuberculosis', 'Polio', 'Ringworm'],
                columnB: ['Fungus', 'Virus', 'Bacterium', 'Protozoan'],
                correctMapping: [3, 2, 1, 0],
                explanation: 'Malaria → Protozoan (Plasmodium), TB → Bacterium (M. tuberculosis), Polio → Virus, Ringworm → Fungus'
            },
        ];
    }

    // Maths (JEE)
    return [
        {
            title: 'Functions and Their Properties',
            columnA: ['y = sin x', 'y = eˣ', 'y = ln x', 'y = |x|'],
            columnB: ['Always positive', 'Not differentiable at 0', 'Domain: x > 0', 'Range: [-1, 1]'],
            correctMapping: [3, 0, 2, 1],
            explanation: 'sin x → Range [-1,1], eˣ → Always positive, ln x → Domain x>0, |x| → Not differentiable at 0'
        },
        {
            title: 'Conic Sections',
            columnA: ['x² + y² = r²', 'x²/a² + y²/b² = 1', 'x²/a² - y²/b² = 1', 'y² = 4ax'],
            columnB: ['Hyperbola', 'Parabola', 'Circle', 'Ellipse'],
            correctMapping: [2, 3, 0, 1],
            explanation: 'Circle, Ellipse, Hyperbola, Parabola — standard forms'
        },
        {
            title: 'Sequences and Formulas',
            columnA: ['AP sum', 'GP sum', 'nth term AP', 'nth term GP'],
            columnB: ['arⁿ⁻¹', 'a + (n-1)d', 'n/2[2a + (n-1)d]', 'a(rⁿ-1)/(r-1)'],
            correctMapping: [2, 3, 1, 0],
            explanation: 'AP sum = n/2[2a+(n-1)d], GP sum = a(rⁿ-1)/(r-1), AP nth = a+(n-1)d, GP nth = arⁿ⁻¹'
        },
    ];
}

const MatchTheFollowing: React.FC<MatchTheFollowingProps> = ({
    subchapterName,
    chapterName,
    subject,
    onBack
}) => {
    const { isNeet } = useExamMode();
    const matchSets = generateMatchSets(subchapterName, chapterName, subject, isNeet);

    const [setIdx, setSetIdx] = useState(0);
    const [selectedA, setSelectedA] = useState<number | null>(null);
    const [userMatches, setUserMatches] = useState<Record<number, number>>({});
    const [submitted, setSubmitted] = useState(false);
    const [done, setDone] = useState(false);
    const [scores, setScores] = useState<number[]>([]);

    const matchSet = matchSets[setIdx];

    // Shuffle columnB for display
    const [shuffledB] = useState(() =>
        matchSets.map(s => {
            const indices = s.columnB.map((_, i) => i);
            for (let i = indices.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [indices[i], indices[j]] = [indices[j], indices[i]];
            }
            return indices;
        })
    );

    const currentShuffledB = shuffledB[setIdx];

    const handleSelectA = (idx: number) => {
        if (submitted) return;
        setSelectedA(idx === selectedA ? null : idx);
    };

    const handleSelectB = (shuffledIdx: number) => {
        if (submitted || selectedA === null) return;
        const actualBIdx = currentShuffledB[shuffledIdx];
        setUserMatches(prev => ({ ...prev, [selectedA]: actualBIdx }));
        setSelectedA(null);
    };

    const handleSubmit = () => {
        let correct = 0;
        matchSet.columnA.forEach((_, aIdx) => {
            if (userMatches[aIdx] === matchSet.correctMapping[aIdx]) correct++;
        });
        setScores(prev => [...prev, correct]);
        setSubmitted(true);
    };

    const handleNext = () => {
        if (setIdx < matchSets.length - 1) {
            setSetIdx(i => i + 1);
            setSelectedA(null);
            setUserMatches({});
            setSubmitted(false);
        } else {
            setDone(true);
        }
    };

    const handleRestart = () => {
        setSetIdx(0);
        setSelectedA(null);
        setUserMatches({});
        setSubmitted(false);
        setDone(false);
        setScores([]);
    };

    const totalScore = scores.reduce((a, b) => a + b, 0);
    const totalPossible = matchSets.reduce((a, s) => a + s.columnA.length, 0);

    if (done) {
        return (
            <div className="space-y-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Practice
                </Button>
                <div className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
                    <div className="text-5xl">🔗</div>
                    <h2 className="text-2xl font-bold">{totalScore}/{totalPossible} matches correct</h2>
                    <p className="text-muted-foreground">
                        {totalScore === totalPossible ? 'Perfect matching! 🎉' :
                            totalScore >= totalPossible * 0.7 ? 'Good work! Review incorrect ones.' :
                                'Keep practicing — matching takes pattern recognition!'}
                    </p>
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
                    <Link className="w-4 h-4" />
                    <span>Match the Following · {setIdx + 1}/{matchSets.length}</span>
                </div>
            </div>

            {/* Progress */}
            <div className="flex gap-1">
                {matchSets.map((_, i) => (
                    <div key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors',
                        i < setIdx ? 'bg-primary/60' :
                            i === setIdx ? 'bg-primary' : 'bg-secondary'
                    )} />
                ))}
            </div>

            {/* Match set */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h3 className="font-semibold text-lg">{matchSet.title}</h3>
                <p className="text-sm text-muted-foreground">
                    {!submitted
                        ? 'Click an item from Column A, then click its match in Column B.'
                        : 'Results shown below.'}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    {/* Column A */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Column A</p>
                        {matchSet.columnA.map((item, aIdx) => {
                            const matchedBIdx = userMatches[aIdx];
                            const isSelected = selectedA === aIdx;
                            const isCorrect = submitted && matchedBIdx === matchSet.correctMapping[aIdx];
                            const isWrong = submitted && matchedBIdx !== undefined && matchedBIdx !== matchSet.correctMapping[aIdx];

                            return (
                                <button
                                    key={aIdx}
                                    onClick={() => handleSelectA(aIdx)}
                                    className={cn(
                                        'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all',
                                        isSelected && 'border-primary bg-primary/10 font-semibold',
                                        !isSelected && !submitted && 'border-border hover:border-primary/50',
                                        submitted && isCorrect && 'border-green-500 bg-green-500/10',
                                        submitted && isWrong && 'border-red-500 bg-red-500/10',
                                        submitted && matchedBIdx === undefined && 'border-amber-400 bg-amber-400/10',
                                        !submitted && matchedBIdx !== undefined && !isSelected && 'border-blue-400 bg-blue-400/10'
                                    )}
                                >
                                    <span className="text-muted-foreground mr-2">{aIdx + 1}.</span>
                                    {item}
                                    {matchedBIdx !== undefined && (
                                        <span className="block text-xs text-muted-foreground mt-0.5">
                                            → {matchSet.columnB[matchedBIdx]}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Column B (shuffled) */}
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Column B</p>
                        {currentShuffledB.map((actualBIdx, displayIdx) => {
                            const isAlreadyMatched = Object.values(userMatches).includes(actualBIdx);
                            const isCorrectAnswer = submitted && matchSet.columnA.some(
                                (_, aIdx) => matchSet.correctMapping[aIdx] === actualBIdx && userMatches[aIdx] === actualBIdx
                            );
                            const isWrongAnswer = submitted && isAlreadyMatched && !isCorrectAnswer;

                            return (
                                <button
                                    key={displayIdx}
                                    onClick={() => handleSelectB(displayIdx)}
                                    disabled={submitted}
                                    className={cn(
                                        'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all',
                                        !submitted && selectedA !== null && !isAlreadyMatched && 'border-primary/50 hover:border-primary hover:bg-primary/5 cursor-pointer',
                                        !submitted && selectedA === null && 'border-border cursor-default',
                                        !submitted && isAlreadyMatched && 'border-blue-400 bg-blue-400/10 cursor-default',
                                        submitted && isCorrectAnswer && 'border-green-500 bg-green-500/10',
                                        submitted && isWrongAnswer && 'border-red-500 bg-red-500/10',
                                        submitted && !isAlreadyMatched && 'border-amber-400 bg-amber-400/10'
                                    )}
                                >
                                    <span className="text-muted-foreground mr-2">{String.fromCharCode(65 + displayIdx)}.</span>
                                    {matchSet.columnB[actualBIdx]}
                                    {submitted && (
                                        isCorrectAnswer
                                            ? <CheckCircle2 className="inline w-3.5 h-3.5 text-green-500 ml-1" />
                                            : isWrongAnswer
                                                ? <XCircle className="inline w-3.5 h-3.5 text-red-500 ml-1" />
                                                : null
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Explanation (after submit) */}
                {submitted && (
                    <div className="bg-secondary/50 rounded-lg p-3 text-sm">
                        <p className="font-medium mb-1">Correct Matching:</p>
                        <p className="text-muted-foreground">{matchSet.explanation}</p>
                    </div>
                )}

                {/* Actions */}
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
                        {setIdx < matchSets.length - 1 ? 'Next Set →' : 'See Results'}
                    </Button>
                )}
            </div>
        </div>
    );
};

export default MatchTheFollowing;
