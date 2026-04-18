/**
 * logStudentActivity — shared utility for silent question attempt logging.
 *
 * Call from:
 *  - /practice    → exam_stage: 'practice'
 *  - /test        → exam_stage: 'chapter_test' | 'mock_test'
 *  - AI Teaching Room → exam_stage: 'practice'
 *  - Snap & Solve → exam_stage: 'practice'
 *
 * TypeScript note: new tables (student_activity, teacher_codes, student_teacher_links)
 * are cast to `any` because Supabase generated types won't include them until
 * the migration has been run and types regenerated.
 */

import { supabase } from '@/integrations/supabase/client';

export type ExamStage = 'practice' | 'mock_test' | 'chapter_test' | 'previous_year';
export type ExamType = 'JEE_MAINS' | 'JEE_ADVANCED' | 'NEET' | 'CUET' | 'OTHER';
export type QuestionType = 'MCQ' | 'Numerical' | 'Assertion-Reason' | 'Multi-correct' | 'True-False' | 'Match-Following';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface ActivityPayload {
  question_id?:        string;
  exam_type?:          ExamType;
  subject:             string;
  topic:               string;
  subtopic?:           string;
  question_type?:      QuestionType;
  difficulty?:         Difficulty;
  exam_stage?:         ExamStage;
  is_correct:          boolean;
  time_spent_seconds?: number;
  marks_obtained?:     number;
  marks_possible?:     number;
  negative_marking?:   boolean;
}

/**
 * Silently log a student question attempt.
 * Errors are swallowed — this must never crash the UI.
 */
export async function logStudentActivity(payload: ActivityPayload): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Find batch_id and organization_id from B2B model
    let teacher_id: string | null = null;
    let batch_id: string | null = null;
    let organization_id: string | null = null;

    try {
      // 1. Get student's profile for org_id
      const { data: profile } = await supabase
        .from('profiles' as any)
        .select('organization_id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      organization_id = (profile as any)?.organization_id ?? null;

      // 2. Find relevant batch for this subject
      const { data: batchMember } = await (supabase.from as any)('batch_members')
        .select('batch_id, batches(mentor_id, subject)')
        .eq('student_id', user.id)
        .maybeSingle();

      if (batchMember) {
        const bm = batchMember as any;
        // If subject matches or no specific subject batch found, use this one
        if (bm.batches?.subject === payload.subject) {
          batch_id = bm.batch_id;
          teacher_id = bm.batches.mentor_id;
        }
      }
    } catch { /* silent */ }

    const row = {
      student_id:         user.id,
      teacher_id,
      batch_id,
      organization_id,
      question_id:        payload.question_id ?? null,
      exam_type:          payload.exam_type ?? 'OTHER',
      subject:            payload.subject,
      topic:              payload.topic,
      subtopic:           payload.subtopic ?? null,
      question_type:      payload.question_type ?? 'MCQ',
      difficulty:         payload.difficulty ?? 'Medium',
      exam_stage:         payload.exam_stage ?? 'practice',
      is_correct:         payload.is_correct,
      time_spent_seconds: payload.time_spent_seconds ?? null,
      marks_obtained:     payload.marks_obtained ?? (payload.is_correct ? (payload.marks_possible ?? 4) : 0),
      marks_possible:     payload.marks_possible ?? 4,
      negative_marking:   payload.negative_marking ?? false,
    };

    await (supabase.from as any)('student_activity').insert(row);
  } catch {
    // Silent fail — never crash student UI for analytics
  }
}

/**
 * Join a teacher/batch by entering a 6-character join code.
 * Checks BOTH batches.join_code (new system) AND teacher_codes (legacy system).
 */
export async function joinTeacherByCode(code: string): Promise<{ success: boolean; message: string; teacherName?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Please log in first.' };

    const normalCode = code.toUpperCase().trim();

    // ── Path 1: Check batches.join_code (new system) ──────────
    const { data: batch } = await (supabase.from as any)('batches')
      .select('id, name, mentor_id, organization_id, subject, target_exam')
      .eq('join_code', normalCode)
      .eq('is_active', true)
      .maybeSingle();

    if (batch) {
      // Add to batch_members
      const { error: joinErr } = await (supabase.from as any)('batch_members')
        .insert({ batch_id: batch.id, student_id: user.id });

      if (joinErr && joinErr.code !== '23505') throw joinErr;
      if (joinErr?.code === '23505') return { success: false, message: "You're already in this batch!" };

      // Infer exam from target_exam or subject
      let targetExam = batch.target_exam || 'JEE Main';
      if (!batch.target_exam) {
        const subj = (batch.subject || '').toLowerCase();
        if (subj.includes('neet') || subj.includes('biology')) targetExam = 'NEET';
        else if (subj.includes('cuet')) targetExam = 'CUET';
      }

      // Update student profile
      await supabase.auth.updateUser({ data: { user_type: 'b2b_student', organization_id: batch.organization_id, target_exam: targetExam } });
      await (supabase.from as any)('profiles')
        .update({ user_type: 'b2b_student', organization_id: batch.organization_id, target_exam: targetExam })
        .eq('user_id', user.id);

      // Also create student_teacher_link for teacher visibility
      await (supabase.from as any)('student_teacher_links').upsert({
        student_id: user.id,
        teacher_id: batch.mentor_id,
        code_used: normalCode,
        exam_type: targetExam,
        subject: batch.subject || 'General',
        is_active: true,
      }, { onConflict: 'student_id,teacher_id,subject', ignoreDuplicates: true });

      const { data: teacherProfile } = await (supabase as any)
        .from('profiles').select('full_name').eq('user_id', batch.mentor_id).maybeSingle();
      const teacherName = (teacherProfile as any)?.full_name ?? 'your mentor';

      return { success: true, message: `✅ You've joined ${batch.name}! Your mentor is ${teacherName}.`, teacherName };
    }

    // ── Path 2: Check teacher_codes table (legacy / dashboard-generated codes) ──
    const { data: teacherCode } = await (supabase.from as any)('teacher_codes')
      .select('teacher_id, exam_type, subject, expires_at, is_active, joined_count, max_students')
      .eq('code', normalCode)
      .eq('is_active', true)
      .maybeSingle();

    if (!teacherCode) {
      return { success: false, message: '❌ Invalid or expired join code. Ask your teacher for the latest code.' };
    }

    // Check expiry
    if (teacherCode.expires_at && new Date(teacherCode.expires_at) < new Date()) {
      return { success: false, message: '⏰ This code has expired. Ask your teacher to generate a new one.' };
    }

    // Check max students
    if (teacherCode.max_students && teacherCode.joined_count >= teacherCode.max_students) {
      return { success: false, message: '🚫 This batch is full. Ask your teacher for a new code.' };
    }

    // Create student_teacher_link
    const { error: linkErr } = await (supabase.from as any)('student_teacher_links').upsert({
      student_id: user.id,
      teacher_id: teacherCode.teacher_id,
      code_used: normalCode,
      exam_type: teacherCode.exam_type || 'OTHER',
      subject: teacherCode.subject || 'General',
      is_active: true,
    }, { onConflict: 'student_id,teacher_id,subject', ignoreDuplicates: true });

    if (linkErr && linkErr.code !== '23505') throw linkErr;
    if (linkErr?.code === '23505') return { success: false, message: "You're already linked to this teacher!" };

    // Increment joined_count
    await (supabase.from as any)('teacher_codes')
      .update({ joined_count: (teacherCode.joined_count || 0) + 1 })
      .eq('code', normalCode);

    const targetExam = teacherCode.exam_type?.replace('_', ' ') || 'JEE Main';

    // Update student profile
    await supabase.auth.updateUser({ data: { user_type: 'b2b_student', target_exam: targetExam } });
    await (supabase.from as any)('profiles')
      .update({ user_type: 'b2b_student', target_exam: targetExam })
      .eq('user_id', user.id);

    const { data: teacherProfile } = await (supabase as any)
      .from('profiles').select('full_name').eq('user_id', teacherCode.teacher_id).maybeSingle();
    const teacherName = (teacherProfile as any)?.full_name ?? 'your mentor';

    return { success: true, message: `✅ You're now connected to ${teacherName}!`, teacherName };

  } catch (err) {
    console.error('Join batch error:', err);
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}

