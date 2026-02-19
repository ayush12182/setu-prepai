import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { physicsChapters, chemistryChapters, mathsChapters, biologyChapters, Chapter } from '@/data/syllabus';
import { getAllSubchapters, Subchapter } from '@/data/subchapters';
import { useExamMode } from '@/contexts/ExamModeContext'; // Import useExamMode

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
}

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

// Generate a deterministic daily index based on date
const getDailyIndex = (totalItems: number): number => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  return dayOfYear % totalItems;
};

// Calculate streak based on consecutive practice days
// NOTE: This logic is now handled in useStreak logic below, 
// using multiple tables (practice, tests, notes) as per System Rules.
const calculateStreak = async (userId: string): Promise<number> => {
  try {
    // 1. Fetch dates from all academic activities
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

    // 2. Normalize and Deduplicate
    const activityDates = [...new Set(
      dates.map(dateStr => new Date(dateStr).toDateString())
    )];

    // 3. Calculate Streak
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
  const { isNeet } = useExamMode(); // Get exam mode
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
        let weakSubchapter: { id: string; name: string; score: number } | null = null;
        let recentWeakness: any = null;

        if (user) {
          // 1. Fetch Streak & Completed
          currentStreak = await calculateStreak(user.id);
          setStreak(currentStreak);


          const { data: sessions } = await supabase
            .from('practice_sessions')
            .select('subchapter_id, correct_answers, total_questions, started_at')
            .eq('user_id', user.id);

          if (sessions) {
            // Completed check
            sessions.forEach(session => {
              if (session.total_questions >= 5 || (session.total_questions > 0 && (session.correct_answers / session.total_questions) >= 0.6)) {
                completedSubchapters.add(session.subchapter_id);
              }
            });

            // Weakness check (last 10)
            const recentSessions = sessions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()).slice(0, 10);
            recentWeakness = recentSessions.find(s =>
              s.total_questions >= 3 && (s.correct_answers / s.total_questions) < 0.6
            );
          }
        }

        // --- DEMO OVERRIDE: FORCE WEAKNESS ---
        // Uncomment to test Smart Suggestion
        if (!recentWeakness) {
          recentWeakness = {
            subchapter_id: 'phy-5-1',
            correct_answers: 2,
            total_questions: 5
          };
        }
        // -------------------------------------

        // 2. Set Smart Focus (if weakness found)
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
              reason: 'weakness'
            });
          }
        } else {
          setSmartFocus(null);
        }

        // 3. Set Daily Focus (Schedule - Always runs)
        const incompleteSubchapters = allSubchapters.filter(s => !completedSubchapters.has(s.id));
        const targetSubchapters = incompleteSubchapters.length > 0 ? incompleteSubchapters : allSubchapters;

        // Sort by chapter weightage
        const weightageOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        const sortedSubchapters = [...targetSubchapters].sort((a, b) => {
          const chapterA = allChapters.find(c => c.id === a.chapterId);
          const chapterB = allChapters.find(c => c.id === b.chapterId);
          const weightA = chapterA ? weightageOrder[chapterA.weightage] : 2;
          const weightB = chapterB ? weightageOrder[chapterB.weightage] : 2;
          return weightA - weightB;
        });

        const dailyIndex = getDailyIndex(sortedSubchapters.length);
        const todaysSubchapter = sortedSubchapters[dailyIndex];
        const todaysChapter = allChapters.find(c => c.id === todaysSubchapter.chapterId);

        if (todaysChapter) {
          const pyqTrend = todaysSubchapter.pyqFocus?.trends?.[0] || 'High frequency in recent JEE exams';
          const jeeAsk = todaysSubchapter.jeeAsks?.[0] || 'Core concepts';

          setDailyFocus({
            subject: todaysChapter.subjectName,
            subjectId: todaysChapter.subject,
            chapter: todaysChapter.name,
            chapterId: todaysChapter.id,
            subchapter: todaysSubchapter.name,
            subchapterId: todaysSubchapter.id,
            task: `Focus on ${jeeAsk} - ${pyqTrend}`,
            taskHinglish: todaysSubchapter.jeetuLine || `Aaj ${todaysSubchapter.name} pe focus karo!`,
            suggestedTime: todaysChapter.difficulty === 'Hard' ? '3h' : todaysChapter.difficulty === 'Medium' ? '2h 30m' : '2h',
            streak: currentStreak,
            reason: 'schedule'
          });
        }

      } catch (err) {
        console.error('Error determining today\'s focus:', err);
      } finally {
        setIsLoading(false);
      }
    };

    determineFocus();
  }, [user]);

  return { dailyFocus, smartFocus, isLoading, streak };
};
