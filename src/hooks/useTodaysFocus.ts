import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { physicsChapters, chemistryChapters, mathsChapters, Chapter } from '@/data/syllabus';
import { getAllSubchapters, Subchapter } from '@/data/subchapters';

export interface TodaysFocusData {
  subject: string;
  subjectId: 'physics' | 'chemistry' | 'maths';
  chapter: string;
  chapterId: string;
  subchapter: string;
  subchapterId: string;
  task: string;
  taskHinglish: string;
  suggestedTime: string;
  streak: number;
}

// Get all chapters with their subject
const getAllChapters = (): (Chapter & { subjectName: string })[] => {
  return [
    ...physicsChapters.map(c => ({ ...c, subjectName: 'Physics' })),
    ...chemistryChapters.map(c => ({ ...c, subjectName: 'Chemistry' })),
    ...mathsChapters.map(c => ({ ...c, subjectName: 'Maths' })),
  ];
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
const calculateStreak = async (userId: string): Promise<number> => {
  try {
    const { data: sessions, error } = await supabase
      .from('practice_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(30);

    if (error || !sessions || sessions.length === 0) return 0;

    // Get unique practice dates
    const practiceDates = [...new Set(
      sessions.map(s => new Date(s.started_at).toDateString())
    )];

    // Check for consecutive days starting from today or yesterday
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let streak = 0;
    let checkDate = practiceDates.includes(today.toDateString()) ? today : yesterday;

    // If neither today nor yesterday has practice, streak is 0
    if (!practiceDates.includes(today.toDateString()) && !practiceDates.includes(yesterday.toDateString())) {
      return 0;
    }

    // Count consecutive days
    for (let i = 0; i < 30; i++) {
      if (practiceDates.includes(checkDate.toDateString())) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (err) {
    console.error('Error calculating streak:', err);
    return 0;
  }
};

export const useTodaysFocus = () => {
  const { user } = useAuth();
  const [focus, setFocus] = useState<TodaysFocusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const determineFocus = async () => {
      try {
        const allChapters = getAllChapters();
        const allSubchapters = getAllSubchapters();
        
        // Get completed subchapters if user is logged in
        let completedSubchapters = new Set<string>();
        let streak = 0;

        if (user) {
          const { data: sessions } = await supabase
            .from('practice_sessions')
            .select('subchapter_id, correct_answers, total_questions')
            .eq('user_id', user.id);

          if (sessions) {
            const subchapterProgress: Record<string, { correct: number; total: number }> = {};
            
            sessions.forEach(session => {
              if (!subchapterProgress[session.subchapter_id]) {
                subchapterProgress[session.subchapter_id] = { correct: 0, total: 0 };
              }
              subchapterProgress[session.subchapter_id].correct += session.correct_answers;
              subchapterProgress[session.subchapter_id].total += session.total_questions;
            });

            Object.entries(subchapterProgress).forEach(([subchapterId, stats]) => {
              if (stats.total >= 5 || (stats.total > 0 && (stats.correct / stats.total) >= 0.6)) {
                completedSubchapters.add(subchapterId);
              }
            });
          }

          streak = await calculateStreak(user.id);
        }

        // Filter to incomplete subchapters, prioritizing high-weightage chapters
        const incompleteSubchapters = allSubchapters.filter(s => !completedSubchapters.has(s.id));
        
        // If all completed, cycle through all subchapters for revision
        const targetSubchapters = incompleteSubchapters.length > 0 ? incompleteSubchapters : allSubchapters;

        // Sort by chapter weightage (High > Medium > Low)
        const weightageOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        const sortedSubchapters = [...targetSubchapters].sort((a, b) => {
          const chapterA = allChapters.find(c => c.id === a.chapterId);
          const chapterB = allChapters.find(c => c.id === b.chapterId);
          const weightA = chapterA ? weightageOrder[chapterA.weightage] : 2;
          const weightB = chapterB ? weightageOrder[chapterB.weightage] : 2;
          return weightA - weightB;
        });

        // Use daily index to pick today's focus
        const dailyIndex = getDailyIndex(sortedSubchapters.length);
        const todaysSubchapter = sortedSubchapters[dailyIndex];
        const todaysChapter = allChapters.find(c => c.id === todaysSubchapter.chapterId);

        if (!todaysChapter) {
          setIsLoading(false);
          return;
        }

        // Generate dynamic task based on subchapter data
        const pyqTrend = todaysSubchapter.pyqFocus?.trends?.[0] || 'High frequency in recent JEE exams';
        const jeeAsk = todaysSubchapter.jeeAsks?.[0] || 'Core concepts';

        const focusData: TodaysFocusData = {
          subject: todaysChapter.subjectName,
          subjectId: todaysChapter.subject,
          chapter: todaysChapter.name,
          chapterId: todaysChapter.id,
          subchapter: todaysSubchapter.name,
          subchapterId: todaysSubchapter.id,
          task: `Focus on ${jeeAsk} - ${pyqTrend}`,
          taskHinglish: todaysSubchapter.jeetuLine || `Aaj ${todaysSubchapter.name} pe focus karo!`,
          suggestedTime: todaysChapter.difficulty === 'Hard' ? '3h' : todaysChapter.difficulty === 'Medium' ? '2h 30m' : '2h',
          streak
        };

        setFocus(focusData);
      } catch (err) {
        console.error('Error determining today\'s focus:', err);
      } finally {
        setIsLoading(false);
      }
    };

    determineFocus();
  }, [user]);

  return { focus, isLoading };
};
