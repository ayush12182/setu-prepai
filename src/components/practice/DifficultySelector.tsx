import { LearningNode } from '@/hooks/useLearningEngine';

interface DifficultySelectorProps {
  node: LearningNode;
  onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'mixed') => void;
  onBack: () => void;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  node,
  onSelectDifficulty,
  onBack
}) => {
  const { isNeet, isCuet, jeeSubMode } = useExamMode();

  const getMediumDesc = () => {
    if (isNeet) return 'NEET UG level';
    if (isCuet) return 'CUET standard level';
    if (jeeSubMode === 'advanced') return 'JEE Advanced level';
    return 'JEE Main level';
  };
  const getHardDesc = () => {
    if (isNeet) return 'NEET challenge level';
    if (isCuet) return 'CUET high-difficulty application';
    if (jeeSubMode === 'main') return 'JEE Main hard variant';
    return 'JEE Advanced level';
  };

  const examLabel = isNeet ? 'NEET' : isCuet ? 'CUET' : 'JEE';

  const difficulties = [
    {
      level: 'easy' as const,
      name: 'Easy',
      description: 'NCERT level basics',
      timePerQ: '30-60 sec',
      icon: Zap,
      color: 'bg-setu-success/10 border-setu-success/30 hover:bg-setu-success/20',
      iconColor: 'text-setu-success',
      questions: 5
    },
    {
      level: 'medium' as const,
      name: 'Medium',
      description: getMediumDesc(),
      timePerQ: '1-2 min',
      icon: Target,
      color: 'bg-setu-warning/10 border-setu-warning/30 hover:bg-setu-warning/20',
      iconColor: 'text-setu-warning',
      questions: 5
    },
    {
      level: 'hard' as const,
      name: 'Hard',
      description: getHardDesc(),
      timePerQ: '2-3 min',
      icon: Flame,
      color: 'bg-destructive/10 border-destructive/30 hover:bg-destructive/20',
      iconColor: 'text-destructive',
      questions: 5
    }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Change Topic
      </Button>

      {/* Topic Info */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground uppercase mb-1 tracking-widest font-black">
          {node.type} level • {examLabel}
        </p>
        <h2 className="text-3xl font-black text-foreground">{node.name}</h2>
        <p className="text-muted-foreground mt-2">Select your challenge level</p>
      </div>

      {/* Difficulty Cards */}
      <div className="grid grid-cols-1 gap-4">
        {difficulties.map((diff) => (
          <button
            key={diff.level}
            onClick={() => onSelectDifficulty(diff.level)}
            className={cn(
              'p-5 rounded-xl border-2 transition-all text-left flex items-center gap-4',
              diff.color
            )}
          >
            <div className={cn(
              'w-14 h-14 rounded-xl flex items-center justify-center bg-background',
              diff.iconColor
            )}>
              <diff.icon className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-foreground">{diff.name}</h3>
              <p className="text-sm text-muted-foreground">{diff.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                <span>{diff.questions} questions</span>
                <span>•</span>
                <span>{diff.timePerQ}/question</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Selection Tip */}
      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6 text-center">
        <p className="text-sm text-accent font-bold">
          "The engine will adapt to your speed and accuracy in real-time."
        </p>
      </div>
    </div>
  );
};

export default DifficultySelector;
