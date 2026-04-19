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
    let { data: profile, error: profileErr } = await supabase
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
          full_name: user?.user_metadata?.full_name || 'New Student',
          user_type: user?.user_metadata?.user_type || 'student'
        }, { onConflict: 'user_id' })
        .select('id, user_type')
        .single();
      
      if (createErr) {
        console.error("Critical: Failed to auto-create profile during join", createErr);
        return { success: false, message: 'Profile sync failed. Please try again in a moment.' };
      }
      profile = newProfile;
    }

    console.log("Onboarding Profile Active:", profile);

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

    console.log("Target Batch found:", batch);

    // 2. DUAL LOGIC based on user_type
    if (profile.user_type === 'student') {
      const payload = { batch_id: batch.id, student_id: profile.id };
      console.log("Attempting batch_students insert with payload:", payload);

      // Add to batch_students using profiles.id
      const { error: joinErr } = await (supabase.from as any)('batch_students')
        .insert(payload);

      if (joinErr) {
        if (joinErr.code === '23505') return { success: false, message: "You already joined this batch!" };
        console.error("batch_students insert failed:", joinErr);
        throw joinErr;
      }

      console.log("Successfully joined batch!");
      
      // SYNC: Update student profile's teacher_id if batch has a teacher
      if (batch.teacher_id) {
        await supabase
          .from('profiles')
          .update({ teacher_id: batch.teacher_id })
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
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('user_activity' as any).insert({
      user_id: user.id,
      activity_type: 'practice',
      metadata: activity,
      created_at: new Date().toISOString()
    });

    if (error) console.error('[ActivityLog] Error logging activity:', error);
  } catch (err) {
    console.error('[ActivityLog] Unexpected error:', err);
  }
}
