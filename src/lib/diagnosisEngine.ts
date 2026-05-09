import { StudentAnalyticsData, ChapterStats } from './analyticsSimulation';

export interface AIAction {
  label: string;
  actionType: 'practice_chapter' | 'fix_mistakes' | 'focus_sprint';
  target: string;
}

export interface AIDiagnosisReport {
  isReliable: boolean;
  confidenceMessage?: string;
  problemSummary: string;
  rootCause: string;
  whatToFixFirst: string;
  marksPotential: string;
  timeInsight: string;
  benchmarks: { subject: string; message: string }[];
  weeklyStory: string;
  setuMessage: string;
  priorityActions: AIAction[];
  topWeakChapters: { subject: string; chapter: string; accuracy: number; attempts: number; marksLost: number }[];
  topMistakeType: { type: string; percentage: number };
}

export function generateDiagnosticReport(data: StudentAnalyticsData): AIDiagnosisReport {
  // RELIABILITY CHECK: Return generic/empty if data is insufficient
  if (data.questionsAttempted < 100) {
    return {
      isReliable: false,
      confidenceMessage: "Not enough data — attempt at least 100 questions for AI diagnosis.",
      problemSummary: '', rootCause: '', whatToFixFirst: '', marksPotential: '', timeInsight: '',
      benchmarks: [], weeklyStory: '', setuMessage: '', priorityActions: [], topWeakChapters: [], topMistakeType: { type: '', percentage: 0 }
    };
  }

  // 1. Strict Prioritization Engine: Find top 2 weakest chapters (minimum 15 attempts)
  const allChapters: { subject: string; chapter: string; accuracy: number; attempts: number; marksLost: number }[] = [];
  data.subjects.forEach(sub => {
    sub.chapters.forEach(ch => {
      if (ch.attempts >= 15) {
        // Real-world Exam Impact Calculation:
        // Instead of calculating lifetime practice marks lost (which scales infinitely),
        // we calculate the expected marks lost in a single standard mock test.
        let chapterWeight = 8; // Base weight
        if (data.examType === 'JEE') chapterWeight = 12; // e.g. 3 questions of 4 marks
        if (data.examType === 'NEET') chapterWeight = 16; // e.g. 4 questions of 4 marks
        
        const marksLost = Math.round(chapterWeight * (1 - (ch.accuracy / 100)));
        
        allChapters.push({
          subject: sub.name,
          chapter: ch.name,
          accuracy: ch.accuracy,
          attempts: ch.attempts,
          marksLost: marksLost
        });
      }
    });
  });

  allChapters.sort((a, b) => b.marksLost - a.marksLost); // Prioritize by absolute marks lost
  const topWeakChapters = allChapters.slice(0, 2);

  // 2. Strict Priority: Top 1 Mistake Type
  const mistakes = [
    { type: 'Conceptual', percentage: data.mistakeProfile.conceptual },
    { type: 'Silly Mistakes', percentage: data.mistakeProfile.silly },
    { type: 'Time Pressure', percentage: data.mistakeProfile.timeTracker },
    { type: 'Blind Guessing', percentage: data.mistakeProfile.guess },
  ];
  mistakes.sort((a, b) => b.percentage - a.percentage);
  const topMistakeType = mistakes[0];

  // 3. Competitive Benchmarking
  const benchmarks = data.subjects.map(sub => {
    if (sub.percentile >= 60) return { subject: sub.name, message: `Ahead of ${sub.percentile}% students in ${sub.name}` };
    if (sub.percentile >= 40) return { subject: sub.name, message: `Average in ${sub.name} (Top ${100 - sub.percentile}%)` };
    return { subject: sub.name, message: `Below average in ${sub.name}` };
  });

  // 4. Exam-Specific Context & AI Mentor Personality Upgrades
  let examStrategy = '';
  if (data.examType === 'JEE') {
    examStrategy = 'For JEE, conceptual depth is non-negotiable. Rote learning won’t save you in Match-the-following or multi-concept questions.';
  } else if (data.examType === 'NEET') {
    examStrategy = 'For NEET, skipping Biology chapters is suicide. You need massive volume and multiple revision cycles.';
  } else {
    examStrategy = 'For CUET, speed is the only king. If a question takes more than 45 seconds, dump it and move on.';
  }

  const totalMarksLost = topWeakChapters.reduce((acc, curr) => acc + curr.marksLost, 0);
  const potentialScoreJump = Math.round(totalMarksLost * 0.7); // Assume 70% recovery is possible
  const predictionStr = `If you follow this strict plan for 7 days → +${potentialScoreJump} to +${totalMarksLost} marks improvement.`;

  const timeInsightStr = data.timeDropoff.behaviorTrend + `. Attempt your toughest subjects in the first ${data.timeDropoff.peakMinutes} minutes.`;
  
  const weeklyStoryStr = `This week you pushed your ${data.weeklyImprovement.subject} by ${data.weeklyImprovement.percentage}%. But let's be honest, you are bleeding ~${topWeakChapters[0].marksLost} marks solely due to ${topWeakChapters[0].chapter}. You are ${benchmarks[0].message.toLowerCase()}, which is holding everything back.`;

  const setuMessage = `Listen, your biggest score-blocking problem is ${topWeakChapters[0].chapter} and ${topWeakChapters[1].chapter}.\n\nYour ${topMistakeType.percentage}% mistakes are happening just because of ${topMistakeType.type.toLowerCase()}. Pay attention, you are losing ~${totalMarksLost} marks just in these two chapters.\n\n${examStrategy}\n\nWhat to do now:\n1. Solve EXACTLY 10 questions of ${topWeakChapters[0].chapter} right now.\n2. Do not touch new topics until this leak is fixed.\n\n${predictionStr}`;

  // 5. Real-Time Action Engine
  const priorityActions: AIAction[] = [
    { label: `Right now → Solve 5 ${topWeakChapters[0].chapter} Qs (10 min)`, actionType: 'practice_chapter', target: topWeakChapters[0].chapter },
    { label: `Fix ${topMistakeType.type} Errors (15 min sprint)`, actionType: 'fix_mistakes', target: topMistakeType.type },
  ];

  return {
    isReliable: true,
    confidenceMessage: `Confidence: High (${data.questionsAttempted} attempts)`,
    problemSummary: `Losing ~${topWeakChapters[0].marksLost} marks in ${topWeakChapters[0].chapter}.`,
    rootCause: `Highest leak: ${topMistakeType.percentage}% ${topMistakeType.type.toLowerCase()} mistakes.`,
    whatToFixFirst: `${topWeakChapters[0].chapter} & ${topWeakChapters[1].chapter}`,
    marksPotential: `+${potentialScoreJump} to +${totalMarksLost} Marks`,
    timeInsight: timeInsightStr,
    benchmarks,
    weeklyStory: weeklyStoryStr,
    setuMessage: setuMessage,
    topWeakChapters: topWeakChapters,
    topMistakeType: topMistakeType,
    priorityActions: priorityActions
  };
}
