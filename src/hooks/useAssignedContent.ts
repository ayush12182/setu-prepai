import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface AssignedTest {
  id: string;            // Batch Assignment ID
  reference_id: string;  // Assessment Session ID
  title: string;
  subject: string;
  questions: number;
  duration: number;
  due_date: string | null;
  status: 'not_attempted' | 'attempted' | 'overdue';
  is_seen: boolean;
  attempt_id?: string;
}

export interface AssignedMaterial {
  id: string;            // Batch Assignment ID
  reference_id: string;  // Material ID
  title: string;
  subject: string;
  type: string;
  uploaded_at: string;
  due_date: string | null;
  is_seen: boolean;
}

export interface AssignedAlerts {
  overdue: number;
  due_soon: number;
}

export interface AssignedContentData {
  tests: AssignedTest[];
  materials: AssignedMaterial[];
  alerts: AssignedAlerts;
}

export const useAssignedContent = () => {
  const { user } = useAuth();
  const [data, setData] = useState<AssignedContentData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchContent = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data: dbData, error } = await supabase.rpc('get_student_assigned_content', {
        p_student_id: user.id
      });
      
      if (error) {
        console.error('Error fetching assigned content:', error);
        toast.error('Failed to load assignments.');
        return;
      }
      
      setData(dbData as AssignedContentData);
    } catch (err) {
      console.error('Unhandled exception in fetchContent:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsSeen = async (assignmentId: string) => {
    if (!user) return;
    
    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        tests: prev.tests.map(test => 
          test.id === assignmentId ? { ...test, is_seen: true } : test
        ),
        materials: prev.materials.map(mat => 
          mat.id === assignmentId ? { ...mat, is_seen: true } : mat
        )
      };
    });

    try {
      const { error } = await supabase
        .from('student_assignment_views')
        .upsert(
          { 
            student_id: user.id, 
            assignment_id: assignmentId, 
            is_seen: true,
            first_seen_at: new Date().toISOString()
          },
          { onConflict: 'student_id,assignment_id' }
        );
        
      if (error) throw error;
    } catch (err) {
      console.error('Failed to mark assignment as seen:', err);
    }
  };

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return { data, loading, fetchContent, markAsSeen };
};
