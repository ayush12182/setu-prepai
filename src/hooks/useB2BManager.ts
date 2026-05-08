import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Batch {
  id: string;
  name: string;
  subject: string;
  target_exam: string;
  description: string;
  mentor_id: string;
  join_code: string;
  is_active: boolean;
  created_at: string;
  organization_id: string | null;
}

export const useB2BManager = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const orgId = profile?.organization_id;

  const createBatch = async (name: string, subject: string, mentorId?: string, targetExam?: string, description?: string) => {
    setLoading(true);
    try {
      // 1. Generate unique 6-character alphanumeric uppercase join code
      const generateUniqueCode = async (): Promise<string> => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; 
        let code = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
          code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
          const { data } = await supabase.from('batches').select('id').eq('join_code', code).maybeSingle();
          if (!data) isUnique = true;
          attempts++;
        }
        return code;
      };

      const join_code = await generateUniqueCode();

      // 2. Build payload following SPEC
      const payload = {
        name: name.trim(),
        target_exam: targetExam || 'JEE_MAINS',
        description: description || `Batch for ${subject}`,
        mentor_id: mentorId || user?.id,
        join_code: join_code,
      };

      // 3. RPC call
      const { data, error } = await supabase.rpc('create_batch_v2', {
        p_name: payload.name,
        p_mentor_id: payload.mentor_id,
        p_join_code: payload.join_code,
        p_target_exam: payload.target_exam,
        p_description: payload.description,
        p_subject: subject
      });

      if (error) {
        console.error('[useB2BManager] RPC Error:', error.message);
        // Fallback to direct insert
        const { data: direct, error: directErr } = await supabase.from('batches').insert(payload).select().single();
        if (directErr) throw directErr;
        return direct;
      }

      return data?.[0] || data;
    } catch (error: any) {
      toast.error(`Batch creation failed: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createBatch, loading };
};
