export interface StudentInsightData {
  id: string;
  name: string;
  accuracy: number;
  reflection: number;
  confidenceMismatches: number;
  weakSubtopics: string[];
  mistakeBreakdown: {
    conceptual: number;
    calculation: number;
    silly: number;
    guessed: number;
  };
  totalAttempts: number;
  avgTimeSeconds?: number;
}

export interface InsightFeature {
  type: 'critical' | 'alert' | 'positive' | 'neutral';
  text: string;
  targetId?: string; // If this applies to a specific student
}

export function scanReliability(timeTakenSeconds: number, isCorrect: boolean): 'guessing' | 'overthinking' | 'normal' {
  if (timeTakenSeconds < 15 && !isCorrect) return 'guessing';
  // If they take an unusually long time and still get it wrong. 
  // (Thresholds vary by exam, using 150s as a generic ceiling)
  if (timeTakenSeconds > 150 && !isCorrect) return 'overthinking'; 
  return 'normal';
}

export function generateBatchInsights(students: StudentInsightData[]): InsightFeature[] {
  const insights: InsightFeature[] = [];
  if (students.length === 0) return insights;

  // 1. Conceptual Error Flags
  const highConceptuals = students.filter(s => s.mistakeBreakdown.conceptual > 40);
  if (highConceptuals.length > 0) {
    if (highConceptuals.length > students.length * 0.3) {
      insights.push({
        type: 'critical',
        text: `Batch-wide issue: ${Math.round((highConceptuals.length / students.length) * 100)}% of students are making high conceptual errors in core subtopics. Focus heavily on theory review over practice volume.`
      });
    } else {
      for (const st of highConceptuals) {
        insights.push({
          type: 'alert',
          text: `${st.name}'s mistakes are ${st.mistakeBreakdown.conceptual}% conceptual. Prioritize theory over drills.`,
          targetId: st.id
        });
      }
    }
  }

  // 2. Confidence Mismatches (Perception Gap)
  const highMismatches = students.filter(s => s.confidenceMismatches > 15);
  if (highMismatches.length > 0) {
    insights.push({
      type: 'alert',
      text: `${highMismatches.length} student(s) show severe confidence mismatches (answering wrong with high confidence). Indicates deeply rooted conceptual flaws in ${highMismatches.map(s => s.weakSubtopics[0] || 'various topics').join(', ')}.`
    });
  }

  // 3. Guessing Behavior
  // (Assuming guessed > 20% identifies chronic guessing)
  const guessers = students.filter(s => s.mistakeBreakdown.guessed > 20);
  if (guessers.length > 0) {
    insights.push({
      type: 'alert',
      text: `${guessers.map(g => g.name).join(', ')} are exhibiting high guessing rates (low time + incorrect). Monitor their engagement levels.`
    });
  }

  // 4. Positive Outliers
  const highReflectors = students.filter(s => s.reflection > 85 && s.accuracy > 65);
  if (highReflectors.length > 0) {
    insights.push({
      type: 'positive',
      text: `Strong reflection logic from ${highReflectors.map(h => h.name).join(', ')}. They correctly identify their mistake types.`
    });
  }

  // Fallback neutral summary
  if (insights.length === 0) {
    insights.push({
      type: 'neutral',
      text: 'Batch performance is stable within normal variances. No critical conceptual gaps detected at this time.'
    });
  }

  return insights;
}
