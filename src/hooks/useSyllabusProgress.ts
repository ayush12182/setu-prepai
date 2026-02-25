import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useExamMode } from '@/contexts/ExamModeContext';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { neetBiologyChapters, neetChemistryChapters, neetPhysicsChapters } from '@/data/neetSyllabus';
import { CUET_SUBJECTS, getCuetChaptersBySubject } from '@/data/cuetSyllabus';
import { getAllSubchapters } from '@/data/subchapters';

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
  const [progress, setProgress] = useState<SubjectProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
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

        if (isCuet) {
          // CUET: show subjects that have chapters with subchapters
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
            .filter(s => s.totalSubchapters > 0); // Only show subjects with content
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
    };

    fetchProgress();
  }, [user, isNeet, isCuet]);

  return { progress, isLoading };
};
