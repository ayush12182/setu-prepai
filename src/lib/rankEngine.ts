/**
 * NTA Historical Ranks mapping scores to relative ranks for competitive exams
 * Format: { [score: string]: rank }
 */

const JEE_MAINS_RANKS: Record<number, number> = {
  300: 1,
  280: 100,
  260: 500,
  240: 2000,
  220: 5000,
  200: 10000,
  180: 20000,
  160: 40000,
  140: 70000,
  120: 120000,
  100: 200000,
  80: 350000,
  60: 600000,
  40: 900000,
  20: 1200000,
  0: 1500000
};

const NEET_RANKS: Record<number, number> = {
  720: 1, 700: 50, 680: 200, 660: 500, 640: 1000, 
  620: 2000, 600: 4000, 580: 7000, 560: 12000, 
  540: 20000, 520: 35000, 500: 55000, 480: 80000, 
  460: 110000, 440: 150000, 420: 200000, 400: 260000, 0: 2500000
};

const CUET_RANKS: Record<number, number> = {
  300: 1, 280: 500, 260: 2000, 240: 5000, 220: 10000, 
  200: 20000, 180: 40000, 160: 80000, 140: 130000, 
  120: 200000, 0: 1500000
};

export type ExamTarget = 'JEE_MAINS' | 'NEET' | 'CUET';

export interface RankPrediction {
  rank: number;
  totalCandidates: number;
  percentile: number;
  collegeProjection: string;
}

const getCollegeBracket = (rank: number, exam: ExamTarget): string => {
  if (exam !== 'JEE_MAINS') {
    if (rank < 5000) return "Top Tier Institution";
    if (rank < 50000) return "Reputed State College";
    return "Private/State Tier 2 College";
  }

  // JEE specific logic
  if (rank < 1000) return "IIT Top Branches";
  if (rank < 5000) return "IIT Any Branch";
  if (rank < 15000) return "NIT Tier 1 (CS)";
  if (rank < 35000) return "NIT Tier 1 (Any Branch)";
  if (rank < 80000) return "NIT Tier 2";
  if (rank < 200000) return "IIIT / Top State Colleges";
  return "State Engineering Colleges (Tier 3)";
};

export const predictRank = (score: number, maxScore: number, exam: ExamTarget): RankPrediction => {
  const ranksTable = exam === 'JEE_MAINS' ? JEE_MAINS_RANKS : exam === 'NEET' ? NEET_RANKS : CUET_RANKS;
  const totalCandidates = exam === 'JEE_MAINS' ? 1200000 : exam === 'NEET' ? 2000000 : 1500000;
  
  // Normalize score mathematically to standard brackets if maxScore differs (e.g. from Mock test)
  const normalizedScore = Math.min((score / maxScore) * (exam === 'NEET' ? 720 : 300), exam === 'NEET' ? 720 : 300);

  const thresholds = Object.keys(ranksTable).map(Number).sort((a, b) => b - a);
  
  let interpolatedRank = 0;
  
  if (normalizedScore >= thresholds[0]) {
    interpolatedRank = ranksTable[thresholds[0]];
  } else if (normalizedScore <= thresholds[thresholds.length - 1]) {
    interpolatedRank = ranksTable[thresholds[thresholds.length - 1]];
  } else {
    // Linear Interpolation
    for (let i = 0; i < thresholds.length - 1; i++) {
      const upperScore = thresholds[i];
      const lowerScore = thresholds[i + 1];
      
      if (normalizedScore <= upperScore && normalizedScore >= lowerScore) {
        const upperRank = ranksTable[upperScore];
        const lowerRank = ranksTable[lowerScore];
        
        // y = y1 + (x - x1) * (y2 - y1) / (x2 - x1)
        const rawRank = upperRank + ((normalizedScore - upperScore) * (lowerRank - upperRank)) / (lowerScore - upperScore);
        interpolatedRank = Math.round(rawRank / 100) * 100; // Round to nearest 100
        break;
      }
    }
  }

  const percentile = Number((((totalCandidates - interpolatedRank) / totalCandidates) * 100).toFixed(2));
  
  return {
    rank: interpolatedRank || 1, // Fallback
    totalCandidates,
    percentile: Math.max(0, percentile),
    collegeProjection: getCollegeBracket(interpolatedRank, exam)
  };
};
