import { createClient } from '@supabase/supabase-js';

export const config = { runtime: 'edge' };

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, authorization',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json',
};

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: cors });

export default async function handler(req: Request) {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  let body: any;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON' }, 400);
  }

  const { code, student_id } = body ?? {};
  if (!code) return json({ error: 'code is required' }, 400);

  // ── Env vars: try every possible naming convention ──────────────────────
  const supabaseUrl =
    (process.env.SUPABASE_URL as string) ||
    (process.env.VITE_SUPABASE_URL as string) ||
    '';

  // Service role key bypasses RLS — must be server-only (never VITE_ prefix)
  const serviceRoleKey =
    (process.env.SUPABASE_SERVICE_ROLE_KEY as string) ||
    (process.env.SERVICE_ROLE_KEY as string) ||
    '';

  // Anon key as last resort (works only if RLS allows public read on batches)
  const anonKey =
    (process.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) ||
    (process.env.VITE_SUPABASE_ANON_KEY as string) ||
    '';

  if (!supabaseUrl) {
    return json({ error: 'Server misconfiguration: missing SUPABASE_URL' }, 500);
  }

  // Use service role if available, otherwise anon (RLS may block, but worth trying)
  const apiKey = serviceRoleKey || anonKey;
  if (!apiKey) {
    return json({ error: 'Server misconfiguration: missing Supabase key' }, 500);
  }

  const supabase = createClient(supabaseUrl, apiKey, {
    auth: { persistSession: false },
  });

  const cleanCode = String(code).trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanCode.length < 4) return json({ error: 'Code too short' }, 400);

  try {
    // ── 1. Find the batch ────────────────────────────────────────────────
    const { data: batch, error: batchErr } = await supabase
      .from('batches')
      .select('id, name, teacher_id, target_exam, is_active')
      .eq('join_code', cleanCode)
      .maybeSingle();

    if (batchErr) {
      console.error('[validate-code] batch query error:', batchErr.message);
      // If column error, means DB schema is off — try without target_exam
      const { data: batchFallback, error: fbErr } = await supabase
        .from('batches')
        .select('id, name, teacher_id, is_active')
        .eq('join_code', cleanCode)
        .maybeSingle();

      if (fbErr || !batchFallback) {
        return json({ error: 'Invalid code. Check with your teacher.' }, 404);
      }

      const bf = batchFallback as any;
      if (bf.is_active === false) return json({ error: 'Batch is no longer active.' }, 403);

      return await buildResponse(supabase, bf, null, student_id);
    }

    if (!batch) return json({ error: 'Invalid code. Check with your teacher.' }, 404);

    const b = batch as any;
    if (b.is_active === false) return json({ error: 'Batch is no longer active.' }, 403);

    return await buildResponse(supabase, b, b.target_exam, student_id);

  } catch (err: any) {
    console.error('[validate-code] unexpected error:', err?.message ?? err);
    return json({ error: 'Internal error. Please try again.' }, 500);
  }
}

async function buildResponse(
  supabase: ReturnType<typeof createClient>,
  batch: any,
  targetExam: string | null,
  student_id?: string,
) {
  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json',
      },
    });

  // ── Teacher name ───────────────────────────────────────────────────────
  const { data: teacher } = await supabase
    .from('profiles')
    .select('full_name, institution_name')
    .eq('user_id', batch.teacher_id)
    .maybeSingle();

  const teacher_name =
    (teacher as any)?.institution_name ||
    (teacher as any)?.full_name ||
    'Your Teacher';

  // ── Student count ──────────────────────────────────────────────────────
  const { count: baseCount } = await supabase
    .from('student_batch_map')
    .select('*', { count: 'exact', head: true })
    .eq('batch_id', batch.id);

  // ── If student_id → join them ──────────────────────────────────────────
  if (student_id) {
    // Insert into student_batch_map
    await supabase
      .from('student_batch_map')
      .upsert(
        { student_id, batch_id: batch.id },
        { onConflict: 'student_id,batch_id', ignoreDuplicates: true } as any
      );

    // Update profile teacher linkage
    await supabase
      .from('profiles')
      .update({ teacher_id: batch.teacher_id } as any)
      .eq('user_id', student_id);

    // Seed leaderboard
    await supabase
      .from('batch_leaderboard')
      .upsert(
        {
          student_id,
          batch_id: batch.id,
          score: 0,
          accuracy: 0,
          questions_attempted: 0,
          consistency_score: 0,
        },
        { onConflict: 'student_id,batch_id', ignoreDuplicates: true } as any
      );

    // Fresh count
    const { count: freshCount } = await supabase
      .from('student_batch_map')
      .select('*', { count: 'exact', head: true })
      .eq('batch_id', batch.id);

    return json({
      valid: true,
      batch_id: batch.id,
      batch_name: batch.name,
      teacher_name,
      exam_type: targetExam || 'JEE',
      total_students: freshCount ?? 0,
    });
  }

  return json({
    valid: true,
    batch_id: batch.id,
    batch_name: batch.name,
    teacher_name,
    exam_type: targetExam || 'JEE',
    total_students: baseCount ?? 0,
  });
}
