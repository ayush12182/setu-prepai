import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  try {
    const { join_code, student_id } = await req.json();

    if (!join_code || typeof join_code !== "string") {
      return new Response(JSON.stringify({ error: "join_code is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const code = join_code.trim().toUpperCase();

    // ── 1. Find the batch (only safe columns) ─────────────────────────────
    const { data: batch, error: batchErr } = await supabase
      .from("batches")
      .select("id, name, teacher_id, target_exam, is_active")
      .eq("join_code", code)
      .maybeSingle();

    if (batchErr) {
      console.error("[validate-join-code] batch query error:", batchErr.message);
      return new Response(JSON.stringify({ error: "Invalid code. Please check with your teacher." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!batch) {
      return new Response(JSON.stringify({ error: "Invalid code. Please check with your teacher." }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Only block if explicitly set to false (null/undefined = active)
    if (batch.is_active === false) {
      return new Response(JSON.stringify({ error: "This batch is no longer active." }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── 2. Resolve teacher name ───────────────────────────────────────────
    const { data: teacherProfile } = await supabase
      .from("profiles")
      .select("full_name, institution_name")
      .eq("user_id", batch.teacher_id)
      .maybeSingle();

    const teacher_name =
      teacherProfile?.institution_name ||
      teacherProfile?.full_name ||
      "Your Teacher";

    // ── 3. Current student count ──────────────────────────────────────────
    const { count: current_count } = await supabase
      .from("student_batch_map")
      .select("*", { count: "exact", head: true })
      .eq("batch_id", batch.id);

    // ── 4. If student_id provided → join them ─────────────────────────────
    if (student_id) {
      const { error: mapErr } = await supabase
        .from("student_batch_map")
        .upsert(
          { student_id, batch_id: batch.id },
          { onConflict: "student_id,batch_id", ignoreDuplicates: true }
        );

      if (mapErr) {
        console.error("[validate-join-code] map insert error:", mapErr.message);
        return new Response(JSON.stringify({ error: "Failed to join batch. Please try again." }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Update student profile with teacher linkage
      await supabase
        .from("profiles")
        .update({ teacher_id: batch.teacher_id })
        .eq("user_id", student_id);

      // Seed leaderboard row
      await supabase
        .from("batch_leaderboard")
        .upsert(
          { student_id, batch_id: batch.id, score: 0, accuracy: 0, questions_attempted: 0, consistency_score: 0 },
          { onConflict: "student_id,batch_id", ignoreDuplicates: true }
        );

      // Refresh ranks (non-fatal)
      try {
        await supabase.rpc("refresh_batch_ranks", { p_batch_id: batch.id });
      } catch { /* non-fatal */ }

      // Fresh count after join
      const { count: fresh_count } = await supabase
        .from("student_batch_map")
        .select("*", { count: "exact", head: true })
        .eq("batch_id", batch.id);

      return new Response(
        JSON.stringify({
          valid: true,
          batch_id: batch.id,
          batch_name: batch.name,
          teacher_name,
          exam_type: batch.target_exam ?? "JEE",
          total_students: fresh_count ?? 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 5. Validation-only response (no student_id) ───────────────────────
    return new Response(
      JSON.stringify({
        valid: true,
        batch_id: batch.id,
        batch_name: batch.name,
        teacher_name,
        exam_type: batch.target_exam ?? "JEE",
        total_students: current_count ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[validate-join-code]", err);
    return new Response(JSON.stringify({ error: "Internal error. Please try again." }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
