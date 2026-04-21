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
    const { batch_id, student_id, limit = 20 } = await req.json();

    if (!batch_id) {
      return new Response(JSON.stringify({ error: "batch_id is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── Leaderboard (top N) ───────────────────────────────────────────────
    const { data: rows, error } = await supabase.rpc("get_batch_leaderboard", {
      p_batch_id: batch_id,
      p_limit: limit,
    });

    if (error) throw error;

    // ── Caller's own rank ─────────────────────────────────────────────────
    let my_rank: number | null = null;
    if (student_id) {
      const { data: myRow } = await supabase
        .from("batch_leaderboard")
        .select("rank")
        .eq("batch_id", batch_id)
        .eq("student_id", student_id)
        .single();
      my_rank = myRow?.rank ?? null;
    }

    // ── Total students in batch ───────────────────────────────────────────
    const { count: total_students } = await supabase
      .from("student_batch_map")
      .select("*", { count: "exact", head: true })
      .eq("batch_id", batch_id);

    return new Response(
      JSON.stringify({
        leaderboard: rows ?? [],
        my_rank,
        total_students: total_students ?? 0,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[get-batch-leaderboard]", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
