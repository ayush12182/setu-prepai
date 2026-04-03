import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useB2BManager = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);

  const orgId = profile?.organization_id;

  const createBatch = async (name: string, subject: string, mentorId?: string) => {
    if (!orgId) {
      toast.error('No organization linked to your profile.');
      return null;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.from('batches' as any).insert({
        name,
        subject,
        mentor_id: mentorId || user?.id,
        organization_id: orgId,
        is_active: true
      }).select().single();

      if (error) throw error;
      toast.success(`Batch ${name} created successfully.`);
      return data;
    } catch (err: any) {
      console.error('Error creating batch:', err);
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
