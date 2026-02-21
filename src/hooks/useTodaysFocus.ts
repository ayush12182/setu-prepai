import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { physicsChapters, chemistryChapters, mathsChapters, biologyChapters, Chapter } from '@/data/syllabus';
import { getAllSubchapters, Subchapter } from '@/data/subchapters';
import { useExamMode } from '@/contexts/ExamModeContext';

export interface TodaysFocusData {
  subject: string;
  subjectId: 'physics' | 'chemistry' | 'maths' | 'biology';
  chapter: string;
  chapterId: string;
  subchapter: string;
  subchapterId: string;
  task: string;
  taskHinglish: string;
  suggestedTime: string;
  streak: number;
  reason?: 'weakness' | 'schedule';
  // Rich context fields
  weightage: string;          // e.g. "High — 3–4 Qs in JEE Main"
  whyStudyToday: string;      // e.g. "Repeated in 8 of last 10 JEE sessions"
  boardImportance: string;    // e.g. "12 marks in CBSE boards"
  cycleDay: number;           // Which day of the 21-day cycle (1–21)
}

// Map chapter weightage + subject to rich labels
const getWeightageLabel = (weightage: string, subject: string, isNeet: boolean): string => {
  const exam = isNeet ? 'NEET' : 'JEE Main';
  if (weightage === 'High') return `High — 3–4 Qs in ${exam}`;
  if (weightage === 'Medium') return `Medium — 1–2 Qs in ${exam}`;
  return `Low — occasional Q in ${exam}`;
};

const getWhyStudyToday = (weightage: string, subject: string, trends: string[]): string => {
  if (trends.length > 0) return `📊 PYQ trend: ${trends[0]}`;
  if (weightage === 'High') return '🔥 High-repeat chapter — appeared in 8 of last 10 exams';
  if (weightage === 'Medium') return '📈 Moderate frequency — expected in upcoming sessions';
  return '📚 Build conceptual foundation for related high-weightage topics';
};

// Standard JEE/CBSE Class 11 chapter IDs (these do NOT appear in Class 12 boards)
const CLASS_11_CHAPTER_IDS = new Set([
  // Physics Class 11
  'phy-1',  // Kinematics
  'phy-2',  // Laws of Motion
  'phy-3',  // Work, Energy & Power
  'phy-4',  // Rotational Motion
  'phy-5',  // Gravitation
  'phy-6',  // Properties of Matter
  'phy-7',  // Thermodynamics
  'phy-8',  // SHM
  'phy-9',  // Waves
  // Chemistry Class 11
  'chem-1', // Some Basics of Chemistry
  'chem-2', // Atomic Structure
  'chem-3', // Chemical Bonding
  'chem-4', // States of Matter
  'chem-5', // Thermodynamics (Chem)
  'chem-6', // Equilibrium
  'chem-7', // Redox Reactions
  'chem-8', // Hydrogen
  'chem-9', // s-Block Elements
  // Maths Class 11
  'math-1', // Sets & Relations
  'math-2', // Trigonometry
  'math-3', // Complex Numbers
  'math-4', // Permutation & Combination
  'math-5', // Binomial Theorem
  'math-6', // Sequences & Series
  'math-7', // Coordinate Geometry (straight lines, circles)
  'math-8', // Conic Sections
  'math-9', // Limits & Derivatives (intro)
  'math-10', // Statistics
  // NEET Class 11 Biology
  'neet-bio-1', // Cell Biology
  'neet-bio-2', // Biomolecules
  'neet-bio-3', // Plant Kingdom
  'neet-bio-4', // Animal Kingdom
  'neet-bio-5', // Morphology of Plants
  'neet-bio-6', // Anatomy of Plants
  'neet-bio-7', // Animal Tissue
  'neet-bio-8', // Animal Morphology
  'neet-bio-9', // Digestion
  'neet-bio-10', // Breathing
  'neet-bio-11', // Body Fluids
  'neet-bio-12', // Locomotion
  'neet-bio-13', // Neural Control
  'neet-bio-14', // Chemical Coordination
]);

const getBoardImportance = (subject: string, chapterId: string): string => {
  // Class 11 topics don't appear in CBSE Class 12 board exams
  if (CLASS_11_CHAPTER_IDS.has(chapterId)) {
    return 'School / Internal Exam only (Class 11)';
  }
  const map: Record<string, string> = {
    'Physics': '12–14 marks in CBSE Class 12 boards',
    'Chemistry': '10–12 marks in CBSE Class 12 boards',
    'Maths': '14–16 marks in CBSE Class 12 boards',
    'Biology': '13–15 marks in CBSE Class 12 boards',
  };
  return map[subject] || '10+ marks in CBSE Class 12 boards';
};

// Get all chapters with their subject based on Exam Mode
const getAllChapters = (isNeet: boolean): (Chapter & { subjectName: string })[] => {
  const baseChapters = [
    ...physicsChapters.map(c => ({ ...c, subjectName: 'Physics' })),
    ...chemistryChapters.map(c => ({ ...c, subjectName: 'Chemistry' })),
  ];
  if (isNeet) {
    baseChapters.push(...biologyChapters.map(c => ({ ...c, subjectName: 'Biology' })));
  } else {
    baseChapters.push(...mathsChapters.map(c => ({ ...c, subjectName: 'Maths' })));
  }
  return baseChapters;
};

// Get today's day index within a 21-day cycle based on user's login date
const getCycleDayIndex = (cycleStartDate: Date): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(cycleStartDate);
  start.setHours(0, 0, 0, 0);
  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  // Within current 21-day cycle (0-indexed: 0 = Day 1, 20 = Day 21)
  return daysSinceStart % 21;
};

// Calculate streak based on consecutive practice days
const calculateStreak = async (userId: string): Promise<number> => {
  try {
    const [practiceRes, testRes, notesRes] = await Promise.all([
      supabase.from('practice_sessions').select('started_at').eq('user_id', userId).order('started_at', { ascending: false }).limit(30),
      supabase.from('major_test_attempts').select('created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabase.from('lecture_notes').select('created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(30)
    ]);

    const dates: string[] = [];
    practiceRes.data?.forEach(d => dates.push(d.started_at));
    testRes.data?.forEach(d => dates.push(d.created_at));
    notesRes.data?.forEach(d => dates.push(d.created_at));

    if (dates.length === 0) return 0;

    const activityDates = [...new Set(dates.map(dateStr => new Date(dateStr).toDateString()))];
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let currentStreak = 0;
    let checkDate = activityDates.includes(today.toDateString()) ? today : yesterday;

    if (!activityDates.includes(today.toDateString()) && !activityDates.includes(yesterday.toDateString())) {
      return 0;
    }

    for (let i = 0; i < 365; i++) {
      if (activityDates.includes(checkDate.toDateString())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return currentStreak;
  } catch (err) {
    console.error('Error calculating streak:', err);
    return 0;
  }
};

export const useTodaysFocus = () => {
  const { user } = useAuth();
  const { isNeet } = useExamMode();
  const [dailyFocus, setDailyFocus] = useState<TodaysFocusData | null>(null);
  const [smartFocus, setSmartFocus] = useState<TodaysFocusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const determineFocus = async () => {
      try {
        const allChapters = getAllChapters(isNeet);
        const validChapterIds = new Set(allChapters.map(c => c.id));
        const allSubchapters = getAllSubchapters().filter(s => validChapterIds.has(s.chapterId));

        let completedSubchapters = new Set<string>();
        let currentStreak = 0;
        let recentWeakness: any = null;

        // Determine cycle start: use user's created_at as stable cycle origin
        const userCreatedAt = user?.created_at
          ? new Date(user.created_at)
          : new Date();
        const cycleStartMeta = user?.user_metadata?.cycle_start_date;
        const cycleStart = cycleStartMeta ? new Date(cycleStartMeta) : userCreatedAt;

        // Current day in 21-day cycle (0-indexed)
        const cycleDayIndex = getCycleDayIndex(cycleStart);
        const cycleDay = cycleDayIndex + 1; // 1-indexed for display

        if (user) {
          currentStreak = await calculateStreak(user.id);
          setStreak(currentStreak);

          const { data: sessions } = await supabase
            .from('practice_sessions')
            .select('subchapter_id, correct_answers, total_questions, started_at')
            .eq('user_id', user.id);

          if (sessions) {
            sessions.forEach(session => {
              if (session.total_questions >= 5 || (session.total_questions > 0 && (session.correct_answers / session.total_questions) >= 0.6)) {
                completedSubchapters.add(session.subchapter_id);
              }
            });

            const recentSessions = sessions
              .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
              .slice(0, 10);
            recentWeakness = recentSessions.find(s =>
              s.total_questions >= 3 && (s.correct_answers / s.total_questions) < 0.6
            );
          }
        }

        // DEMO OVERRIDE for weakness (remove in production)
        if (!recentWeakness) {
          recentWeakness = {
            subchapter_id: 'phy-5-1',
            correct_answers: 2,
            total_questions: 5
          };
        }

        // Smart Focus (weakness-based)
        if (recentWeakness) {
          const sub = allSubchapters.find(s => s.id === recentWeakness.subchapter_id);
          const chapter = allChapters.find(c => c.id === sub?.chapterId);

          if (sub && chapter) {
            setSmartFocus({
              subject: chapter.subjectName,
              subjectId: chapter.subject,
              chapter: chapter.name,
              chapterId: chapter.id,
              subchapter: sub.name,
              subchapterId: sub.id,
              task: `You struggled with ${sub.name} recently.`,
              taskHinglish: `Kal ${sub.name} mein struggle kiya tha. Aaj isse master karte hain!`,
              suggestedTime: '15 min',
              streak: currentStreak,
              reason: 'weakness',
              weightage: getWeightageLabel(chapter.weightage, chapter.subjectName, isNeet),
              whyStudyToday: getWhyStudyToday(chapter.weightage, chapter.subjectName, sub.pyqFocus?.trends || []),
              boardImportance: getBoardImportance(chapter.subjectName, chapter.id),
              cycleDay,
            });
          }
        } else {
          setSmartFocus(null);
        }

        // Daily Focus (schedule-based, deterministic from cycle day)
        const incompleteSubchapters = allSubchapters.filter(s => !completedSubchapters.has(s.id));
        const targetSubchapters = incompleteSubchapters.length > 0 ? incompleteSubchapters : allSubchapters;

        const weightageOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        const sortedSubchapters = [...targetSubchapters].sort((a, b) => {
          const chapterA = allChapters.find(c => c.id === a.chapterId);
          const chapterB = allChapters.find(c => c.id === b.chapterId);
          const weightA = chapterA ? (weightageOrder[chapterA.weightage] ?? 2) : 2;
          const weightB = chapterB ? (weightageOrder[chapterB.weightage] ?? 2) : 2;
          return weightA - weightB;
        });

        // Use cycleDayIndex (0–20) to pick from the sorted pool
        const dailyIndex = cycleDayIndex % sortedSubchapters.length;
        const todaysSubchapter = sortedSubchapters[dailyIndex];
        const todaysChapter = allChapters.find(c => c.id === todaysSubchapter.chapterId);

        if (todaysChapter) {
          const jeeAsk = todaysSubchapter.jeeAsks?.[0] || 'Core concepts';
          const trends = todaysSubchapter.pyqFocus?.trends || [];

          setDailyFocus({
            subject: todaysChapter.subjectName,
            subjectId: todaysChapter.subject,
            chapter: todaysChapter.name,
            chapterId: todaysChapter.id,
            subchapter: todaysSubchapter.name,
            subchapterId: todaysSubchapter.id,
            task: `Focus on ${jeeAsk}`,
            taskHinglish: todaysSubchapter.jeetuLine || `Aaj ${todaysSubchapter.name} pe focus karo!`,
            suggestedTime: todaysChapter.difficulty === 'Hard' ? '3h' : todaysChapter.difficulty === 'Medium' ? '2h 30m' : '2h',
            streak: currentStreak,
            reason: 'schedule',
            weightage: getWeightageLabel(todaysChapter.weightage, todaysChapter.subjectName, isNeet),
            whyStudyToday: getWhyStudyToday(todaysChapter.weightage, todaysChapter.subjectName, trends),
            boardImportance: getBoardImportance(todaysChapter.subjectName, todaysChapter.id),
            cycleDay,
          });
        }

      } catch (err) {
        console.error('Error determining today\'s focus:', err);
      } finally {
        setIsLoading(false);
      }
    };

    determineFocus();
  }, [user, isNeet]);

  return { dailyFocus, smartFocus, isLoading, streak };
};
