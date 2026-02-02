import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { physicsChapters, chemistryChapters, mathsChapters } from '@/data/syllabus';
import { getAllSubchapters } from '@/data/subchapters';

export interface SubjectProgress {
  subject: 'physics' | 'chemistry' | 'maths';
  chaptersCount: number;
  totalSubchapters: number;
  completedSubchapters: number;
  progress: number; // percentage 0-100
}

// Get subchapters for a subject based on chapter IDs
const getSubchaptersForSubject = (subject: 'physics' | 'chemistry' | 'maths'): string[] => {
  const chapters = subject === 'physics' 
    ? physicsChapters 
    : subject === 'chemistry' 
      ? chemistryChapters 
      : mathsChapters;
  
  const chapterIds = chapters.map(c => c.id);
  const allSubchapters = getAllSubchapters();
  return allSubchapters
    .filter(s => chapterIds.includes(s.chapterId))
    .map(s => s.id);
};

export const useSyllabusProgress = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<SubjectProgress[]>([
    { subject: 'physics', chaptersCount: physicsChapters.length, totalSubchapters: 0, completedSubchapters: 0, progress: 0 },
    { subject: 'chemistry', chaptersCount: chemistryChapters.length, totalSubchapters: 0, completedSubchapters: 0, progress: 0 },
    { subject: 'maths', chaptersCount: mathsChapters.length, totalSubchapters: 0, completedSubchapters: 0, progress: 0 },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Get all practice sessions for the user
        const { data: sessions, error } = await supabase
          .from('practice_sessions')
          .select('subchapter_id, correct_answers, total_questions')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching practice sessions:', error);
          setIsLoading(false);
          return;
        }

        // Create a map of subchapter_id -> completion status
        // A subchapter is considered "completed" if user has attempted it with >= 60% accuracy
        const completedSubchapters = new Set<string>();
        
        if (sessions) {
          // Group sessions by subchapter
          const subchapterProgress: Record<string, { correct: number; total: number }> = {};
          
          sessions.forEach(session => {
            if (!subchapterProgress[session.subchapter_id]) {
              subchapterProgress[session.subchapter_id] = { correct: 0, total: 0 };
            }
            subchapterProgress[session.subchapter_id].correct += session.correct_answers;
            subchapterProgress[session.subchapter_id].total += session.total_questions;
          });

          // Mark subchapters as completed if they have been practiced
          // (at least 5 questions attempted OR 60% accuracy with any attempts)
          Object.entries(subchapterProgress).forEach(([subchapterId, stats]) => {
            if (stats.total >= 5 || (stats.total > 0 && (stats.correct / stats.total) >= 0.6)) {
              completedSubchapters.add(subchapterId);
            }
          });
        }

        // Calculate progress for each subject
        const subjects: Array<'physics' | 'chemistry' | 'maths'> = ['physics', 'chemistry', 'maths'];
        const newProgress: SubjectProgress[] = subjects.map(subject => {
          const subchapterIds = getSubchaptersForSubject(subject);
          const totalSubchapters = subchapterIds.length;
          const completedCount = subchapterIds.filter(id => completedSubchapters.has(id)).length;
          const chapters = subject === 'physics' 
            ? physicsChapters 
            : subject === 'chemistry' 
              ? chemistryChapters 
              : mathsChapters;

          return {
            subject,
            chaptersCount: chapters.length,
            totalSubchapters,
            completedSubchapters: completedCount,
            progress: totalSubchapters > 0 ? Math.round((completedCount / totalSubchapters) * 100) : 0
          };
        });

        setProgress(newProgress);
      } catch (err) {
        console.error('Error calculating syllabus progress:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  return { progress, isLoading };
};
