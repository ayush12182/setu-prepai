import { supabase } from '@/integrations/supabase/client';

/**
 * Links a student to a teacher using a 6-character short code.
 */
export async function linkStudentToMentor(mentorCode: string): Promise<{ success: boolean; message: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Auth required' };

    // 1. Find mentor by short code
    const { data: mentor, error: mentorErr } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .eq('teacher_code', mentorCode.toUpperCase().trim())
      .eq('user_type', 'teacher')
      .maybeSingle();

    if (mentorErr || !mentor) {
      return { success: false, message: 'Invalid mentor code. Please check with your teacher.' };
    }

    // 2. Update student profile
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ teacher_id: mentor.user_id })
      .eq('user_id', user.id);

    if (updateErr) throw updateErr;

    return { 
      success: true, 
      message: `You are now linked to ${mentor.full_name}! 🎓` 
    };
  } catch (err: any) {
    console.error('Linking error:', err);
    return { success: false, message: err.message };
  }
}

/**
 * Generates a unique 6-character code for a teacher if they don't have one.
 */
export async function ensureTeacherCode(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('teacher_code, user_type')
    .eq('user_id', user.id)
    .single();

  if (profile?.teacher_code) return profile.teacher_code;
  if (profile?.user_type !== 'teacher') return null;

  // Simple random 6-char code
  const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  await supabase
    .from('profiles')
    .update({ teacher_code: newCode })
    .eq('user_id', user.id);

  return newCode;
}
