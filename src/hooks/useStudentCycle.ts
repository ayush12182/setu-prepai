import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface TestCycle {
  last_full_test_date: string | null;
  next_test_date: string | null;
  days_left: number;
  is_test_day: boolean;
  loading: boolean;
}

export const useStudentCycle = () => {
  const { user } = useAuth();
  const [cycle, setCycle] = useState<TestCycle>({
    last_full_test_date: null,
    next_test_date: null,
    days_left: 21,
    is_test_day: false,
    loading: true
  });

  const fetchCycle = async () => {
    if (!user) return;
    try {
      setCycle(prev => ({ ...prev, loading: true }));
      const { data, error } = await supabase.rpc('get_test_cycle');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const row = data[0];
        setCycle({
          last_full_test_date: row.last_full_test_date,
          next_test_date: row.next_test_date,
          days_left: row.days_left,
          is_test_day: row.is_test_day,
          loading: false
        });
      }
    } catch (err) {
      console.error('Error fetching test cycle:', err);
      setCycle(prev => ({ ...prev, loading: false }));
    }
  };

  const markComplete = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.rpc('complete_full_test');
      if (error) throw error;
      await fetchCycle();
    } catch (err) {
      console.error('Error completing test cycle:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCycle();
    }
  }, [user]);

  return { ...cycle, refreshCycle: fetchCycle, markComplete };
};
