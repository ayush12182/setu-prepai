import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportPayload {
  exam: string;
  subject: string;
  chapter: string;
  subtopic?: string;
  total_questions: number;
  correct_count: number;
  time_spent_seconds: number;
  answers: Array<{ topic: string; subtopic: string; isCorrect: boolean }>;
  task_id?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) throw new Error("No authorization token provided");
    const { data: { user }, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !user) throw new Error("Invalid token");

    const body: ReportPayload = await req.json();
    
    // 1. Calculate accuracy and dynamic weak topics from THIS session
    const accuracy_pct = body.total_questions > 0 
      ? (body.correct_count / body.total_questions) * 100 
      : 0;

    const topicStats: Record<string, { total: number, correct: number }> = {};
    for (const ans of body.answers) {
      const key = ans.subtopic || ans.topic || body.chapter;
      if (!topicStats[key]) topicStats[key] = { total: 0, correct: 0 };
      topicStats[key].total++;
      if (ans.isCorrect) topicStats[key].correct++;
    }

    const weak_topics: string[] = [];
    const strong_topics: string[] = [];
    for (const [topic, stats] of Object.entries(topicStats)) {
      const topicAcc = (stats.correct / stats.total) * 100;
      if (topicAcc <= 50) weak_topics.push(topic);
      if (topicAcc >= 85) strong_topics.push(topic);
    }

    // 2. See if student has a linked teacher
    const { data: links } = await supabase
      .from("student_teacher_links")
      .select("teacher_id")
      .eq("student_id", user.id)
      .eq("subject", body.subject)
      .eq("is_active", true)
      .limit(1);
    
    const teacher_id = links && links.length > 0 ? links[0].teacher_id : null;

    // 3. Create the practice report
    const { data: report, error: reportErr } = await supabase
      .from("practice_reports")
      .insert({
        student_id: user.id,
        teacher_id,
        exam: body.exam,
        subject: body.subject,
        chapter: body.chapter,
        subtopic: body.subtopic ?? null,
        total_questions: body.total_questions,
        score: body.correct_count * 4, // 4 marks per correct per CUET pattern, assuming no negative tracking here for simplicity
        accuracy_pct,
        time_spent_seconds: body.time_spent_seconds,
        weak_topics,
        strong_topics
      })
      .select()
      .single();

    if (reportErr) throw reportErr;

    // 4. Notification Logic (MVP: In-app)
    if (teacher_id) {
      let notify = false;
      let title = "";
      let message = "";
      let type = "general";

      // Grab student profile for name
      const { data: profile } = await supabase
        .from("student_profiles")
        .select("name")
        .eq("student_id", user.id)
        .single();
      const studentName = profile?.name || "A student";

      if (accuracy_pct < 50) {
        notify = true;
        title = "🔴 Low Performance Alert";
        message = `${studentName} scored ${Math.round(accuracy_pct)}% in ${body.chapter}. Weak spots: ${weak_topics.join(', ')}`;
        type = "low_accuracy";
      }

      if (notify) {
        await supabase.from("teacher_notifications").insert({
          teacher_id,
          title,
          message,
          type,
          link_url: `/teacher-dashboard/students/${user.id}`
        });
      }
    }

    // 5. Close assigned teacher task if applicable
    if (body.task_id) {
      await supabase
        .from("assigned_tasks")
        .update({
          status: 'completed',
          final_accuracy: accuracy_pct,
          completed_at: new Date().toISOString()
        })
        .eq('student_id', user.id)
        .eq('status', 'pending')
        .eq('subtopic', body.task_id); // task_id here is actually the subtopic string sent from frontend
    }

    // 6. Update overall student_profiles is gracefully handled by the Postgres Trigger
    // created previously (trg_update_student_profile) on student_activity insert.

    return new Response(JSON.stringify({ success: true, report_id: report.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[BackendFix] Practice Report Error:", err);
    return new Response(JSON.stringify({ error: err.message || "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
