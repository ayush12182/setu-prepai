import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { students } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const studentSummaries = (students || []).map((s: any) => {
      const lp = s.learning_profile;
      const ps = s.practice_stats;
      return `- ${s.full_name || 'Unknown'} (Class ${s.class || '?'}, ${s.target_exam || 'N/A'}): ` +
        (lp ? `Accuracy ${Math.round(lp.accuracy_score)}%, Concept ${Math.round(lp.concept_score)}%, Weak: ${(lp.weak_topics || []).join(', ') || 'none'}, Gaps: ${(lp.prerequisite_gaps || []).join(', ') || 'none'}` : 'No diagnostic data') +
        (ps ? `, Solved: ${ps.total_questions_solved} questions` : '');
    }).join('\n');

    const prompt = `As an AI teaching assistant, analyze these students and provide intervention suggestions.

Students:
${studentSummaries}

Generate 5-8 specific, actionable intervention suggestions. For each:
1. Name the student(s) who need attention
2. Explain the specific intervention needed
3. Set priority (high/medium/low)

Focus on:
- Students with low accuracy who need immediate help
- Common weakness patterns across students (group interventions)
- Students who haven't practiced enough
- Prerequisite gaps that block progress

Return a JSON array: [{"student": "Name(s)", "suggestion": "Specific action", "priority": "high|medium|low"}]
Return ONLY the JSON array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert educational consultant advising teachers. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let insights;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      insights = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      insights = [{ student: "All Students", suggestion: "Review diagnostic results and schedule one-on-one sessions with students scoring below 50%.", priority: "high" }];
    }

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
