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

    // Find teacher_id from student_teacher_links (match by subject)
    let teacher_id: string | null = null;
    try {
      const { data: link } = await (supabase.from as any)('student_teacher_links')
        .select('teacher_id')
        .eq('student_id', user.id)
        .eq('subject', payload.subject)
        .eq('is_active', true)
        .maybeSingle();
      teacher_id = link?.teacher_id ?? null;
    } catch { /* silent */ }

    const row = {
      student_id:         user.id,
      teacher_id,
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
 * Join a teacher by entering their class code.
 */
export async function joinTeacherByCode(code: string): Promise<{ success: boolean; message: string; teacherName?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, message: 'Please log in first.' };

    const normalCode = code.toUpperCase().trim();

    const { data: tcData, error: tcErr } = await (supabase.from as any)('teacher_codes')
      .select('id, teacher_id, exam_type, subject, is_active, expires_at, max_students, joined_count')
      .eq('code', normalCode)
      .maybeSingle();

    if (tcErr || !tcData) return { success: false, message: '❌ Code not found. Check with your teacher.' };
    if (!tcData.is_active) return { success: false, message: '❌ This code is no longer active.' };
    if (tcData.expires_at && new Date(tcData.expires_at) < new Date()) {
      return { success: false, message: '❌ This code has expired. Ask your teacher for a new one.' };
    }
    if (tcData.max_students && tcData.joined_count >= tcData.max_students) {
      return { success: false, message: '❌ This class is full. Contact your teacher.' };
    }

    const { data: existing } = await (supabase.from as any)('student_teacher_links')
      .select('id')
      .eq('student_id', user.id)
      .eq('teacher_id', tcData.teacher_id)
      .eq('subject', tcData.subject)
      .maybeSingle();

    if (existing) return { success: false, message: "You're already in this class!" };

    const { error: linkErr } = await (supabase.from as any)('student_teacher_links')
      .insert({
        student_id: user.id,
        teacher_id: tcData.teacher_id,
        code_used:  normalCode,
        exam_type:  tcData.exam_type,
        subject:    tcData.subject,
      });

    if (linkErr) throw linkErr;

    await (supabase.from as any)('teacher_codes')
      .update({ joined_count: (tcData.joined_count ?? 0) + 1 })
      .eq('id', tcData.id);

    const { data: teacherProfile } = await supabase
      .from('profiles' as any)
      .select('full_name')
      .eq('id', tcData.teacher_id)
      .maybeSingle();

    const teacherName = (teacherProfile as any)?.full_name ?? 'your teacher';
    return {
      success: true,
      message: `✅ You've joined ${teacherName}'s ${tcData.subject} class for ${tcData.exam_type.replace('_', ' ')}!`,
      teacherName,
    };
  } catch {
    return { success: false, message: 'Something went wrong. Please try again.' };
  }
}
