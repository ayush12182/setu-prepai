import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { answers, questions, studentLevel, gradeRange } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Calculate basic metrics
    const totalCorrect = answers.filter((a: any) => a.isCorrect).length;
    const totalTime = answers.reduce((s: number, a: any) => s + a.time, 0);
    const avgTime = totalTime / answers.length;
    const accuracy = (totalCorrect / answers.length) * 100;

    // Group by topic
    const topicStats: Record<string, { correct: number; total: number; times: number[] }> = {};
    const skillStats: Record<string, { correct: number; total: number }> = {};

    answers.forEach((ans: any, i: number) => {
      const q = questions[i];
      if (!q) return;

      const topic = q.topic || q.subject;
      if (!topicStats[topic]) topicStats[topic] = { correct: 0, total: 0, times: [] };
      topicStats[topic].total++;
      topicStats[topic].times.push(ans.time);
      if (ans.isCorrect) topicStats[topic].correct++;

      const skill = q.skill_tested || 'concept';
      if (!skillStats[skill]) skillStats[skill] = { correct: 0, total: 0 };
      skillStats[skill].total++;
      if (ans.isCorrect) skillStats[skill].correct++;
    });

    const topicSummary = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      accuracy: Math.round((stats.correct / stats.total) * 100),
      avgTime: Math.round(stats.times.reduce((a, b) => a + b, 0) / stats.times.length),
      total: stats.total,
    }));

    const skillSummary = Object.entries(skillStats).map(([skill, stats]) => ({
      skill,
      accuracy: Math.round((stats.correct / stats.total) * 100),
    }));

    const prompt = `Analyze this student's diagnostic test performance and generate a learning profile.

Student Level: Class ${gradeRange} (${studentLevel})
Overall: ${totalCorrect}/${answers.length} correct (${Math.round(accuracy)}%), avg ${Math.round(avgTime)}s per question

Topic Performance:
${topicSummary.map(t => `- ${t.topic}: ${t.accuracy}% accuracy, avg ${t.avgTime}s, ${t.total} questions`).join('\n')}

Skill Performance:
${skillSummary.map(s => `- ${s.skill}: ${s.accuracy}% accuracy`).join('\n')}

Generate a JSON object with:
{
  "concept_score": <0-100 number based on conceptual understanding>,
  "accuracy_score": <0-100 number>,
  "speed_score": <0-100 number based on response times>,
  "confidence_score": <0-100 number based on consistency>,
  "weak_topics": [<array of topic strings where accuracy < 60%>],
  "strong_topics": [<array of topic strings where accuracy >= 75%>],
  "prerequisite_gaps": [<array of fundamental topics the student needs to revise>],
  "overall_level": "<beginner|intermediate|advanced>"
}

Return ONLY the JSON object, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert educational psychologist. Analyze student test data and generate accurate learning profiles. Return only valid JSON." },
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
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let profile;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      profile = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      // Fallback to calculated values
      profile = {
        concept_score: Math.round((skillStats['concept']?.correct || 0) / (skillStats['concept']?.total || 1) * 100),
        accuracy_score: Math.round(accuracy),
        speed_score: Math.min(100, Math.round((30 / Math.max(avgTime, 1)) * 100)),
        confidence_score: Math.round(accuracy * 0.8),
        weak_topics: topicSummary.filter(t => t.accuracy < 60).map(t => t.topic),
        strong_topics: topicSummary.filter(t => t.accuracy >= 75).map(t => t.topic),
        prerequisite_gaps: topicSummary.filter(t => t.accuracy < 40).map(t => t.topic),
        overall_level: accuracy >= 75 ? 'advanced' : accuracy >= 50 ? 'intermediate' : 'beginner',
      };
    }

    return new Response(JSON.stringify({ profile }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
