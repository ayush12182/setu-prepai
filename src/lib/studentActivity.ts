import { supabase } from '@/integrations/supabase/client';

/**
 * Unified Join Flow (3-Role System)
 * 1. Find batch by join_code
 * 2. If user is 'student' -> Add to batch_students
 * 3. If user is 'teacher' -> Assign batch to them (set teacher_id = user.id)
 */
export async function joinTeacherByCode(code: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Please log in first.' };

    // Get current profile role AND internal ID
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('user_id', user.id)
      .maybeSingle();

    // 2. AUTO-RECOVERY: If no profile exists during join (common during signup), create it now
    if (!profile) {
      console.log("No profile found during join, auto-creating for user:", user.id);
      const { data: newProfile, error: createErr } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          full_name: user?.user_metadata?.full_name || user?.user_metadata?.name || 'New Student',
          user_type: user?.user_metadata?.user_type || 'student'
        }, { onConflict: 'user_id' })
        .select('id, user_type')
        .single();
      
      if (createErr) {
        console.error("Critical: Failed to auto-create profile during join", createErr);
        // Fallback: If upsert failed but it's a conflict, just log it
        if (createErr.code !== '23505') {
          return { success: false, message: 'Profile sync failed. Please try again in a moment.' };
        }
      }
    }

    console.log("Onboarding Profile Active:", profile || "Syncing...");

    const normalCode = code.toUpperCase().trim();

    // 1. Find the batch
    const { data: batch, error: batchErr } = await (supabase.from as any)('batches')
      .select('id, name, teacher_id, target_exam')
      .eq('join_code', normalCode)
      .maybeSingle();

    if (batchErr || !batch) {
      console.error("Batch lookup error or not found", batchErr);
      return { success: false, message: 'Invalid join code. Ask your Administrator.' };
    }

    // 2. DUAL LOGIC based on user_type
    // Use user.id (Auth) for student_id to match RLS policies
    const userRole = profile?.user_type || user?.user_metadata?.user_type || 'student';
    
    if (userRole === 'student') {
      const payload = { batch_id: batch.id, student_id: user.id };
      console.log("Attempting batch_students join (Auth ID):", payload);

      const { error: joinErr } = await (supabase.from as any)('batch_students')
        .insert(payload);

      if (joinErr) {
        if (joinErr.code === '23505') return { success: false, message: "You already joined this batch!" };
        console.error("batch_students insert failed:", joinErr);
        throw joinErr;
      }

      // SYNC: Update student profile's teacher_id AND target_exam if batch has them
      const updates: any = {};
      if (batch.teacher_id) updates.teacher_id = batch.teacher_id;
      if (batch.target_exam) updates.target_exam = batch.target_exam;

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user.id);
      }

      return { success: true, message: `Successfully joined ${batch.name}!` };
    } 
    
    if (profile.user_type === 'teacher') {
      console.log("Teacher claiming batch...");
      // Check if batch already has a teacher
      if (batch.teacher_id && batch.teacher_id !== user.id) {
         return { success: false, message: 'This batch is already assigned to another teacher.' };
      }

      // Assign teacher to batch
      const { error: assignErr } = await (supabase.from as any)('batches')
        .update({ teacher_id: user.id })
        .eq('id', batch.id);

      if (assignErr) {
        console.error("Batch claim failed:", assignErr);
        throw assignErr;
      }
      return { success: true, message: `You are now the teacher for ${batch.name}!` };
    }

    return { success: false, message: 'Admins cannot join batches via code.' };

  } catch (error: any) {
    console.error('CRITICAL Join error:', error);
    return { success: false, message: `Could not process invite: ${error.message}` };
  }
}

/**
 * Log student practice activity for analytics
 */
export async function logStudentActivity(activity: {
  question_id: string;
  subject: string;
  topic: string;
  subtopic?: string;
  difficulty: string;
  exam_stage: string;
  is_correct: boolean;
  time_spent_seconds: number;
  question_type: string;
  batch_id?: string;
  organization_id?: string;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Use student_activity (Universal internal table)
    const { error } = await supabase.from('student_activity' as any).insert({
      student_id: user.id,
      activity_type: 'practice',
      subject: activity.subject,
      topic: activity.topic,
      subtopic: activity.subtopic || activity.topic,
      difficulty: activity.difficulty,
      is_correct: activity.is_correct,
      time_spent_seconds: activity.time_spent_seconds,
      batch_id: activity.batch_id,
      organization_id: activity.organization_id,
      metadata: activity,
      created_at: new Date().toISOString()
    });

    if (error) console.error('[ActivityLog] Error logging activity:', error);
  } catch (err) {
    console.error('[ActivityLog] Unexpected error:', err);
  }
}
