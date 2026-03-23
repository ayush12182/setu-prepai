export type ExamType = 'JEE' | 'NEET' | 'CUET';

export type BehaviorType = 'Normal' | 'Rushing' | 'Overthinking' | 'Skipping';

export interface BehavioralProfile {
  type: BehaviorType;
  avgTimeSeconds: number;
}

export interface ChapterStats {
  name: string;
  accuracy: number;
  attempts: number;
  behavior: BehavioralProfile;
}

export interface SubjectPerformance {
  name: string;
  accuracy: number;
  totalAttempted: number;
  percentile: number;
  chapters: ChapterStats[];
}

export interface StudentAnalyticsData {
  examType: ExamType;
  overallAccuracy: number;
  totalTimeStudied: number; // minutes
  questionsAttempted: number;
  mistakeProfile: {
    conceptual: number;
    silly: number;
    timeTracker: number;
    guess: number;
  };
  subjects: SubjectPerformance[];
  timeDropoff: {
    peakMinutes: number;
    dropPercentage: number;
    behaviorTrend: string;
  };
  weeklyImprovement: {
    subject: string;
    percentage: number;
  };
}

export function generateMockAnalytics(examType: ExamType = 'JEE'): StudentAnalyticsData {
  if (examType === 'JEE') {
    return {
      examType: 'JEE',
      overallAccuracy: 58,
      totalTimeStudied: 1420,
      questionsAttempted: 845,
      mistakeProfile: {
        conceptual: 45,
        silly: 25,
        timeTracker: 20,
        guess: 10,
      },
      timeDropoff: {
        peakMinutes: 35,
        dropPercentage: 22,
        behaviorTrend: 'You rush after 35 minutes → accuracy drops by 22%'
      },
      weeklyImprovement: {
        subject: 'Physics',
        percentage: 12,
      },
      subjects: [
        {
          name: 'Mathematics',
          accuracy: 42,
          totalAttempted: 310,
          percentile: 45,
          chapters: [
            { name: 'Integration', accuracy: 28, attempts: 85, behavior: { type: 'Rushing', avgTimeSeconds: 45 } },
            { name: 'Coordinate Geometry', accuracy: 45, attempts: 60, behavior: { type: 'Overthinking', avgTimeSeconds: 210 } },
            { name: 'Algebra', accuracy: 72, attempts: 110, behavior: { type: 'Normal', avgTimeSeconds: 120 } },
            { name: 'Trigonometry', accuracy: 35, attempts: 55, behavior: { type: 'Skipping', avgTimeSeconds: 15 } },
          ]
        },
        {
          name: 'Physics',
          accuracy: 68,
          totalAttempted: 280,
          percentile: 62,
          chapters: [
            { name: 'Mechanics', accuracy: 75, attempts: 120, behavior: { type: 'Normal', avgTimeSeconds: 110 } },
            { name: 'Modern Physics', accuracy: 48, attempts: 70, behavior: { type: 'Overthinking', avgTimeSeconds: 185 } },
            { name: 'Electromagnetism', accuracy: 65, attempts: 90, behavior: { type: 'Normal', avgTimeSeconds: 140 } },
          ]
        },
        {
          name: 'Chemistry',
          accuracy: 65,
          totalAttempted: 255,
          percentile: 55,
          chapters: [
            { name: 'Organic Chemistry', accuracy: 42, attempts: 100, behavior: { type: 'Rushing', avgTimeSeconds: 30 } },
            { name: 'Physical Chemistry', accuracy: 82, attempts: 85, behavior: { type: 'Normal', avgTimeSeconds: 90 } },
            { name: 'Inorganic Chemistry', accuracy: 70, attempts: 70, behavior: { type: 'Skipping', avgTimeSeconds: 20 } },
          ]
        }
      ]
    };
  }
  
  // Default mock for NEET...
  return {
    examType: 'NEET',
    overallAccuracy: 72,
    totalTimeStudied: 1850,
    questionsAttempted: 1200,
    mistakeProfile: {
      conceptual: 20,
      silly: 40,
      timeTracker: 35,
      guess: 5,
    },
    timeDropoff: {
      peakMinutes: 60,
      dropPercentage: 15,
      behaviorTrend: 'Focus wavers after 60 mins → Silly mistakes increase'
    },
    weeklyImprovement: {
      subject: 'Biology',
      percentage: 8,
    },
    subjects: [
      {
        name: 'Biology',
        accuracy: 85,
        totalAttempted: 600,
        percentile: 80,
        chapters: [
          { name: 'Human Physiology', accuracy: 90, attempts: 200, behavior: { type: 'Normal', avgTimeSeconds: 40 } },
          { name: 'Genetics', accuracy: 55, attempts: 150, behavior: { type: 'Overthinking', avgTimeSeconds: 95 } },
        ]
      },
      {
        name: 'Physics',
        accuracy: 55,
        totalAttempted: 300,
        percentile: 30,
        chapters: [
          { name: 'Mechanics', accuracy: 45, attempts: 150, behavior: { type: 'Rushing', avgTimeSeconds: 35 } },
        ]
      }
    ]
  };
}
