import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useB2BManager = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const orgId = profile?.organization_id;

  /** Ensures teacher has an org — creates one if missing (handles pre-fix signups) */
  const ensureOrganization = async (): Promise<string | null> => {
    if (!user) {
      console.error('[useB2BManager] No user found in ensureOrganization');
      return null;
    }

    // 1. Check context profile first (fastest path)
    if (profile?.organization_id) {
      return profile.organization_id;
    }

    setLoading(true);
    try {
      console.log(`[useB2BManager] organization_id missing for ${user.id}. Starting recovery...`);

      // 2. Try fetching from profiles table once more (with potential DB lag fix)
      const { data: freshProfile, error: profileErr } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileErr) {
        console.error('[useB2BManager] DB Profile fetch error:', profileErr);
        toast.error(`Profile check failed: ${profileErr.message}`);
        return null;
      }

      if (freshProfile?.organization_id) {
        console.log('[useB2BManager] Found organization_id in DB:', freshProfile.organization_id);
        return freshProfile.organization_id;
      }

      // 3. Check organizations table for any org created by this user
      const { data: existingOrg, error: existingOrgErr } = await (supabase as any)
        .from('organizations')
        .select('id')
        .eq('created_by', user.id)
        .maybeSingle();

      if (existingOrgErr) {
        console.error('[useB2BManager] DB Organizations fetch error:', existingOrgErr);
      }

      if (existingOrg?.id) {
        console.log('[useB2BManager] Found orphaned organization in DB. Linking...', existingOrg.id);
        
        const { error: linkErr } = await (supabase as any)
          .from('profiles')
          .update({ organization_id: existingOrg.id })
          .eq('user_id', user.id);
          
        if (linkErr) {
          console.error('[useB2BManager] Cleanup linkage failed:', linkErr);
        }
        return existingOrg.id;
      }

      // 4. Create a brand new org for this teacher
      const displayName = freshProfile?.full_name || profile?.full_name || user.email?.split('@')[0] || 'Teacher';
      const slug = `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`;

      console.log(`[useB2BManager] Creating new organization for ${displayName}`);
      
      const { data: newOrg, error: orgErr } = await (supabase as any)
        .from('organizations')
        .insert({
          name: `${displayName}'s Learning Platform`,
          slug,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (orgErr || !newOrg) {
        console.error('[useB2BManager] Organization creation failed:', orgErr);
        toast.error(`Institute setup failed: ${orgErr?.message || 'DB Error'}`);
        return null;
      }

      // 5. Link org to profile
      const { error: updateErr } = await (supabase as any)
        .from('profiles')
        .update({ 
          organization_id: newOrg.id, 
          user_type: profile?.user_type === 'admin' ? 'admin' : 'b2b_mentor' 
        })
        .eq('user_id', user.id);

      if (updateErr) {
        console.error('[useB2BManager] Profile update with new org failed:', updateErr);
        toast.error(`Finalizing setup failed: ${updateErr.message}`);
      }

      console.log('[useB2BManager] Organization setup complete:', newOrg.id);
      return newOrg.id;
    } catch (err: any) {
      console.error('[useB2BManager] Fatal failure in ensureOrganization:', err);
      toast.error(`System setup failure: ${err.message || 'Unknown error'}`);
      return null;
    } finally {
      setLoading(false);
    }
  };



  const createBatch = async (name: string, subject: string, mentorId?: string, targetExam?: string, description?: string) => {
    setLoading(true);
    try {
      // 1. Generate unique 6-character alphanumeric uppercase join code (FRONTEND GENERATED)
      const generateUniqueCode = async (): Promise<string> => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
        let code = '';
        let isUnique = false;
        let attempts = 0;

        while (!isUnique && attempts < 10) {
          code = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
          
          const { data } = await supabase
            .from('batches')
            .select('id')
            .eq('join_code', code)
            .maybeSingle();
            
          if (!data) isUnique = true;
          attempts++;
        }
        return code;
      };

      const join_code = await generateUniqueCode();

      // 2. Build simple payload focusing on mentor_id
      const payload = {
        name: name.trim(),
        target_exam: targetExam || 'JEE_MAINS',
        description: description || `Batch for ${subject}`,
        mentor_id: mentorId || user?.id,
        join_code: join_code,
        is_active: true,
        subject: subject,
        organization_id: profile?.organization_id || null // still optional but not blocking
      };

      console.log('🚀 [useB2BManager] vV2_RPC_CONNECTED - Code is live');
      console.log('[useB2BManager] Attempting RPC create_batch_v2 with:', payload);

      // Use V2 RPC to handle the 'stream' check constraint found in schema
      const { data, error } = await supabase.rpc('create_batch_v2', {
        p_name: payload.name,
        p_mentor_id: payload.mentor_id,
        p_join_code: payload.join_code,
        p_target_exam: payload.target_exam,
        p_description: payload.description,
        p_subject: payload.subject
      });

      if (error) {
        console.error('❌ [useB2BManager] V2 RPC Error:', error.message, error.code);
        
        // Final fallback: try a direct insert with ANY cast if RPC fails
        console.log('[useB2BManager] RPC failed, trying direct insert...');
        const { data: direct, error: directErr } = await (supabase as any)
          .from('batches')
          .insert({
            ...payload,
            stream: (payload.target_exam || 'jee').toLowerCase()
          })
          .select()
          .single();
          
        if (directErr) {
          toast.error(`Creation failed: ${directErr.message}`);
          throw directErr;
        }
        return direct;
      }

      toast.success(`Batch "${name}" is live! Code: ${join_code}`);
      return data;

      toast.success(`Batch "${name}" created via secure channel!`);
      return data;
    } catch (err: any) {
      console.error('[useB2BManager] Error in createBatch:', err);
      toast.error(err.message || 'Failed to create batch');
      return null;
    } finally {
      setLoading(false);
    }
  };



  const createTest = async (params: {
    batch_id: string;
    title: string;
    mode: 'ai_generated' | 'manual';
    subject?: string;
    topic?: string;
    subtopic?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'mixed';
    question_count?: number;
    question_ids?: string[];
  }) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('tests' as any).insert({
        created_by: user?.id,
        ...params,
        is_published: false
      }).select().single();

      if (error) throw error;
      toast.success(`Test created successfully.`);
      return data;
    } catch (err: any) {
      console.error('Error creating test:', err);
      toast.error('Failed to create test: ' + err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveCustomSyllabus = async (subject: string, chapter: string, topic: string, globalRef: string) => {
    if (!orgId) return false;
    
    setLoading(true);
    try {
      // Find highest order index for this subject
      const { data: existing } = await supabase
        .from('organization_syllabus' as any)
        .select('order_index')
        .eq('organization_id', orgId)
        .eq('subject', subject)
        .order('order_index', { ascending: false })
        .limit(1);
        
      const anyData = existing as any[];
      const nextIndex = (anyData && anyData.length > 0) ? (anyData[0].order_index + 1) : 0;

      const { error } = await supabase.from('organization_syllabus' as any).insert({
        organization_id: orgId,
        subject,
        custom_chapter_name: chapter,
        custom_topic_name: topic,
        global_topic_reference: globalRef,
        order_index: nextIndex
      });

      if (error) throw error;
      toast.success(`Syllabus item added successfully.`);
      return true;
    } catch (err: any) {
      console.error('Error saving syllabus:', err);
      toast.error('Failed to save syllabus: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const generateInviteDetails = async (batchId: string) => {
    setLoading(true);
    try {
      // Create a random 6-digit alphanum code
      const joinCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const inviteLink = `${window.location.origin}/join/${batchId}`;
      
      // Update batch in DB
      const { data, error } = await supabase.from('batches' as any)
        .update({ join_code: joinCode, invite_link: inviteLink })
        .eq('id', batchId)
        .select()
        .single();
        
      if (error) throw error;
      toast.success('Invite link and code generated!');
      return data;
    } catch (err: any) {
      console.error('Error generating invite:', err);
      toast.error('Failed to generate invite');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinBatchByCode = async (code: string) => {
    setLoading(true);
    try {
      // Standardize the code format
      const cleanCode = code.trim().toUpperCase();
      
      // 1. Find the batch
      const { data, error: batchErr } = await supabase.from('batches' as any)
        .select('*')
        .eq('join_code', cleanCode)
        .eq('is_active', true)
        .single();
        
      const batch = data as any;
        
      if (batchErr || !batch) throw new Error('Invalid or expired join code');
      
      // 2. Add member
      const { error: joinErr } = await supabase.from('batch_members' as any)
        .insert({ batch_id: batch.id, student_id: user?.id });
        
      // Handle "already in batch" unique constraint if thrown
      if (joinErr) {
        if (joinErr.code === '23505') throw new Error('You are already in a batch. Please leave your current batch before joining a new one.');
        throw joinErr;
      }
      
      toast.success(`Successfully joined ${batch.name}!`);
      return batch;
    } catch (err: any) {
      console.error('Error joining by code:', err);
      toast.error(err.message || 'Failed to join batch');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const joinBatchById = async (batchId: string) => {
    setLoading(true);
    try {
      // Add member
      const { error: joinErr } = await supabase.from('batch_members' as any)
        .insert({ batch_id: batchId, student_id: user?.id });
        
      if (joinErr) {
        if (joinErr.code === '23505') throw new Error('You are already in this batch');
        throw joinErr;
      }
      
      toast.success('Successfully joined the batch!');
      return true;
    } catch (err: any) {
      console.error('Error joining batch by ID:', err);
      toast.error(err.message || 'Failed to join batch');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBatch,
    createTest,
    saveCustomSyllabus,
    generateInviteDetails,
    joinBatchByCode,
    joinBatchById,
    loading
  };
};
