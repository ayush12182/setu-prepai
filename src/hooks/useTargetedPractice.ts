import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useTargetedPractice = () => {
  const { user } = useAuth();
  const [isAssigning, setIsAssigning] = useState(false);

  const assignPractice = async ({
    studentId,
    topic,
    subtopic,
    difficulty,
    count,
    reason
  }: {
    studentId: string;
    topic: string;
    subtopic: string;
    difficulty: 'easy' | 'medium' | 'hard';
    count: number;
    reason?: string;
  }) => {
    if (!user) {
      toast.error('You must be logged in to assign practice.');
      return false;
    }

    setIsAssigning(true);
    try {
      const { error } = await supabase.from('assigned_practice' as any).insert({
        student_id: studentId,
        assigned_by: user.id,
        topic,
        subtopic,
        difficulty,
        question_count: count,
        reason
      });

      if (error) throw error;
      toast.success('Practice assigned successfully!');
      return true;
    } catch (err: any) {
      console.error('Error assigning practice:', err);
      toast.error(err.message || 'Failed to assign practice. Please try again.');
      return false;
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    assignPractice,
    isAssigning
  };
};
