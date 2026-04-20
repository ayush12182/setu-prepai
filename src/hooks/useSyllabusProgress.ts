import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { neetBiologyChapters, neetChemistryChapters, neetPhysicsChapters } from '@/data/neetSyllabus';
import { CUET_SUBJECTS, getCuetChaptersBySubject } from '@/data/cuetSyllabus';
import { getAllSubchapters } from '@/data/subchapters';
import { useClassContext } from '@/contexts/ClassContext';
import { getSchoolSubjects, getSchoolChapters } from '@/data/schoolSyllabus';

export interface SubjectProgress {
  subject: string;
  chaptersCount: number;
  totalSubchapters: number;
  completedSubchapters: number;
  progress: number;
}

const getSubchaptersForSubjectChapters = (chapterIds: string[]): string[] => {
  const allSubchapters = getAllSubchapters();
  return allSubchapters
    .filter(s => chapterIds.includes(s.chapterId))
    .map(s => s.id);
};

export const useSyllabusProgress = () => {
  const { user } = useAuth();
  const { isNeet, isCuet } = useExamMode();
  const { isFoundation, studentClass } = useClassContext();
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) { setIsLoading(false); return; }

    try {
      const { data: sessions, error } = await supabase
        .from('practice_sessions')
        .select('subchapter_id, correct_answers, total_questions')
        .eq('user_id', user.id);

      if (error) { console.error('Error fetching practice sessions:', error); setIsLoading(false); return; }

      const completedSubchapters = new Set<string>();
      if (sessions) {
        const subchapterProgress: Record<string, { correct: number; total: number }> = {};
        sessions.forEach(session => {
          if (!subchapterProgress[session.subchapter_id]) subchapterProgress[session.subchapter_id] = { correct: 0, total: 0 };
          subchapterProgress[session.subchapter_id].correct += session.correct_answers;
          subchapterProgress[session.subchapter_id].total += session.total_questions;
        });
        Object.entries(subchapterProgress).forEach(([subchapterId, stats]) => {
          if (stats.total >= 5 || (stats.total > 0 && (stats.correct / stats.total) >= 0.6)) {
            completedSubchapters.add(subchapterId);
          }
        });
      }

      let newProgress: SubjectProgress[];

      if (isFoundation) {
        const schoolSubjects = getSchoolSubjects(studentClass);
        newProgress = schoolSubjects.map(subj => {
          const chapters = getSchoolChapters(studentClass, subj.key);
          const chapterIds = chapters.map(c => c.id);

          // Foundation subchapters are currently mocked via their chapters
          const subchapterIds = chapterIds.map(id => `${id}-basics`);
          const completedCount = subchapterIds.filter(id => completedSubchapters.has(id)).length;

          return {
            subject: subj.key.charAt(0).toUpperCase() + subj.key.slice(1).replace('_', ' '),
            chaptersCount: chapters.length,
            totalSubchapters: subchapterIds.length,
            completedSubchapters: completedCount,
            progress: subchapterIds.length > 0 ? Math.round((completedCount / subchapterIds.length) * 100) : 0,
          };
        }).filter(s => s.chaptersCount > 0);
      } else if (isCuet) {
        newProgress = CUET_SUBJECTS
          .map(subj => {
            const chapters = getCuetChaptersBySubject(subj.key);
            const chapterIds = chapters.map(c => c.id);
            const subchapterIds = getSubchaptersForSubjectChapters(chapterIds);
            const completedCount = subchapterIds.filter(id => completedSubchapters.has(id)).length;
            return {
              subject: subj.key,
              chaptersCount: chapters.length,
              totalSubchapters: subchapterIds.length,
              completedSubchapters: completedCount,
              progress: subchapterIds.length > 0 ? Math.round((completedCount / subchapterIds.length) * 100) : 0,
            };
          })
          .filter(s => s.totalSubchapters > 0);
      } else if (isNeet) {
        const neetSubjects = [
          { key: 'biology', chapters: neetBiologyChapters },
          { key: 'chemistry', chapters: neetChemistryChapters },
          { key: 'physics', chapters: neetPhysicsChapters },
        ];
        newProgress = neetSubjects.map(({ key, chapters }) => {
          const chapterIds = chapters.map(c => c.id);
          const subchapterIds = getSubchaptersForSubjectChapters(chapterIds);
          const completedCount = subchapterIds.filter(id => completedSubchapters.has(id)).length;
          return {
            subject: key,
            chaptersCount: chapters.length,
            totalSubchapters: subchapterIds.length,
            completedSubchapters: completedCount,
            progress: subchapterIds.length > 0 ? Math.round((completedCount / subchapterIds.length) * 100) : 0,
          };
        });
      } else {
        const jeeSubjects = [
          { key: 'physics', chapters: physicsChapters },
          { key: 'chemistry', chapters: chemistryChapters },
          { key: 'maths', chapters: mathsChapters },
        ];
        newProgress = jeeSubjects.map(({ key, chapters }) => {
          const chapterIds = chapters.map(c => c.id);
          const subchapterIds = getSubchaptersForSubjectChapters(chapterIds);
          const completedCount = subchapterIds.filter(id => completedSubchapters.has(id)).length;
          return {
            subject: key,
            chaptersCount: chapters.length,
            totalSubchapters: subchapterIds.length,
            completedSubchapters: completedCount,
            progress: subchapterIds.length > 0 ? Math.round((completedCount / subchapterIds.length) * 100) : 0,
          };
        });
      }

      setProgress(newProgress);
    } catch (err) {
      console.error('Error calculating syllabus progress:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isNeet, isCuet, isFoundation, studentClass]);

  // Initial fetch
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Realtime sync: re-fetch when practice_sessions change
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('syllabus-progress-sync')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'practice_sessions',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, fetchProgress]);

  return { progress, isLoading, refetch: fetchProgress };
};
