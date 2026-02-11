import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { count = 15 } = await req.json();

    // Step 1: Analyze user's weak areas from question_attempts
    const { data: attempts, error: attemptsError } = await supabase
      .from("question_attempts")
      .select("question_id, is_correct, questions(chapter_id, subchapter_id, subject, concept_tested, difficulty)")
      .eq("user_id", user.id)
      .order("attempted_at", { ascending: false })
      .limit(200);

    if (attemptsError) {
      console.error("Failed to fetch attempts:", attemptsError);
    }

    // Build weakness profile
    const chapterStats: Record<string, { correct: number; total: number; subject: string; concepts: string[] }> = {};

    if (attempts && attempts.length > 0) {
      for (const attempt of attempts) {
        const q = attempt.questions as any;
        if (!q) continue;
        const key = q.chapter_id;
        if (!chapterStats[key]) {
          chapterStats[key] = { correct: 0, total: 0, subject: q.subject, concepts: [] };
        }
        chapterStats[key].total++;
        if (attempt.is_correct) chapterStats[key].correct++;
        else if (q.concept_tested) chapterStats[key].concepts.push(q.concept_tested);
      }
    }

    // Sort chapters by weakness (lowest accuracy first)
    const weakChapters = Object.entries(chapterStats)
      .map(([chapterId, stats]) => ({
        chapterId,
        subject: stats.subject,
        accuracy: stats.total > 0 ? stats.correct / stats.total : 0,
        weakConcepts: [...new Set(stats.concepts)].slice(0, 5),
        total: stats.total,
      }))
      .filter(c => c.total >= 2) // Only chapters with enough data
      .sort((a, b) => a.accuracy - b.accuracy);

    // Build the adaptive prompt
    let weaknessContext = "";
    if (weakChapters.length > 0) {
      const top5 = weakChapters.slice(0, 5);
      weaknessContext = `\n\nSTUDENT WEAKNESS PROFILE (from ${attempts?.length || 0} recent attempts):\n`;
      for (const ch of top5) {
        weaknessContext += `- Chapter ${ch.chapterId} (${ch.subject}): ${Math.round(ch.accuracy * 100)}% accuracy. Weak concepts: ${ch.weakConcepts.join(", ") || "general weakness"}\n`;
      }
      weaknessContext += `\nFocus MORE questions on these weak areas. Mix difficulty: 30% easy (to rebuild confidence), 50% medium (target weakness), 20% hard (stretch).`;
    } else {
      weaknessContext = "\n\nNo prior attempt data found. Generate a balanced diagnostic test across Physics, Chemistry, and Mathematics covering fundamental JEE Mains topics with mixed difficulty.";
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = `You are an elite JEE Mains question generator creating an ADAPTIVE TEST personalized to a student's weaknesses.
${weaknessContext}

Generate exactly ${count} MCQ questions in valid JSON array format.

RULES:
1. Each question MUST have exactly 4 options with ONE unambiguous correct answer
2. Solve each question yourself FIRST, verify the answer matches an option exactly
3. Mix subjects: Physics, Chemistry, Mathematics proportionally
4. Include step-by-step explanation
5. Tag each question with the concept being tested
6. Difficulty distribution as specified above

Return ONLY a JSON array (no markdown, no wrapping):
[
  {
    "id": "adaptive_1",
    "subject": "physics",
    "chapter_id": "relevant_chapter",
    "subchapter_id": "relevant_subchapter",
    "difficulty": "easy|medium|hard",
    "question_text": "...",
    "option_a": "...",
    "option_b": "...",
    "option_c": "...",
    "option_d": "...",
    "correct_option": "A|B|C|D",
    "explanation": "Step-by-step solution...",
    "concept_tested": "...",
    "common_mistake": "..."
  }
]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Generate ${count} adaptive JEE Mains questions targeting the student's weak areas.` },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please wait a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "Failed to generate questions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await response.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Clean markdown fences
    content = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let questions;
    try {
      questions = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      return new Response(JSON.stringify({ error: "Failed to parse generated questions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      questions,
      weakAreas: weakChapters.slice(0, 5).map(c => ({
        chapterId: c.chapterId,
        subject: c.subject,
        accuracy: Math.round(c.accuracy * 100),
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Adaptive test error:", err);
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
