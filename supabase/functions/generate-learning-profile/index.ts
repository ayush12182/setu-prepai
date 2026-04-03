import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { answers, questions, studentLevel, gradeRange, stream } = await req.json();
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

    const prompt = `Analyze this student's Foundation Assessment performance and generate a structured learning profile and action plan.

Stream: ${stream || 'Foundation'}
Overall: ${totalCorrect}/${answers.length} correct (${Math.round(accuracy)}%), avg ${Math.round(avgTime)}s per question

Topic Performance:
${topicSummary.map(t => `- ${t.topic}: ${t.accuracy}% accuracy, avg ${t.avgTime}s, ${t.total} questions`).join('\n')}

Skill Performance (Helps identify Mistake Patterns):
${skillSummary.map(s => `- ${s.skill}: ${s.accuracy}% accuracy`).join('\n')}

Generate a JSON object with EXACTLY the following structure:
{
  "concept_score": <0-100 number>,
  "accuracy_score": <0-100 number>,
  "speed_score": <0-100 number>,
  "confidence_score": <0-100 number>,
  "overall_level": "<beginner|intermediate|advanced>",
  "weak_topics": ["string array"],
  "strong_topics": ["string array"],
  "prerequisite_gaps": ["string array of missing class 10 fundamentals"],
  "mistake_patterns": {
    "conceptual": "string describing if they lack core understanding",
    "calculation": "string describing if they make silly mathematical errors"
  },
  "time_analysis": "string describing if they are rushing (guessing) or dragging (slow)",
  "subject_performance": {
    "subjectName": "strong | average | weak"
  },
  "action_plan": {
    "what_to_study": "Paragraph detailing the key concepts to focus on first",
    "where_to_start": "The exact topic or chapter they should open today",
    "practice_plan": "Suggested daily routine for the next 2 weeks"
  }
}

Return ONLY the JSON object, NO markdown formatting (\`\`\`json).`;

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
      let cleanContent = content.trim();
      if (cleanContent.startsWith("\`\`\`json")) cleanContent = cleanContent.replace(/^```json\n/, "").replace(/\n```$/, "");
      else if (cleanContent.startsWith("\`\`\`")) cleanContent = cleanContent.replace(/^```\n/, "").replace(/\n```$/, "");
      
      const parsed = JSON.parse(cleanContent);
      profile = {
        concept_score: parsed.concept_score || 0,
        accuracy_score: parsed.accuracy_score || 0,
        speed_score: parsed.speed_score || 0,
        confidence_score: parsed.confidence_score || 0,
        overall_level: parsed.overall_level || 'beginner',
        weak_topics: parsed.weak_topics || [],
        strong_topics: parsed.strong_topics || [],
        prerequisite_gaps: parsed.prerequisite_gaps || [],
        metadata: {
          mistake_patterns: parsed.mistake_patterns || {},
          time_analysis: parsed.time_analysis || "",
          subject_performance: parsed.subject_performance || {},
          action_plan: parsed.action_plan || {}
        }
      };
    } catch {
      // Fallback
      profile = {
        concept_score: Math.round((skillStats['concept']?.correct || 0) / (skillStats['concept']?.total || 1) * 100),
        accuracy_score: Math.round(accuracy),
        speed_score: Math.min(100, Math.round((30 / Math.max(avgTime, 1)) * 100)),
        confidence_score: Math.round(accuracy * 0.8),
        weak_topics: topicSummary.filter(t => t.accuracy < 60).map(t => t.topic),
        strong_topics: topicSummary.filter(t => t.accuracy >= 75).map(t => t.topic),
        prerequisite_gaps: topicSummary.filter(t => t.accuracy < 40).map(t => t.topic),
        overall_level: accuracy >= 75 ? 'advanced' : accuracy >= 50 ? 'intermediate' : 'beginner',
        metadata: { mistake_patterns: {}, action_plan: {} }
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
