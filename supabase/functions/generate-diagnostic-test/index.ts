import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { gradeRange, studentLevel, count = 25 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const subjectsMap: Record<string, string[]> = {
      '6-8': ['Mathematics', 'Science', 'Logic'],
      '9-10': ['Mathematics', 'Science', 'Logic'],
      '11-12': ['Physics', 'Chemistry', 'Mathematics'],
    };

    const subjects = subjectsMap[gradeRange] || subjectsMap['11-12'];
    const questionsPerSubject = Math.ceil(count / subjects.length);

    const prompt = `Generate exactly ${count} diagnostic assessment questions for a Class ${gradeRange} student in India.

Distribute across subjects: ${subjects.join(', ')} (about ${questionsPerSubject} each).

For each question, vary the skill_tested across: concept, logic, calculation, reading, prerequisite.
Mix difficulties: 30% easy, 50% medium, 20% hard.

${gradeRange === '6-8' ? 'Focus on: basic arithmetic, fractions, geometry, simple science concepts, pattern recognition, logical reasoning.' : ''}
${gradeRange === '9-10' ? 'Focus on: algebra, trigonometry basics, coordinate geometry, physics fundamentals, chemical reactions, reasoning.' : ''}
${gradeRange === '11-12' ? 'Focus on: calculus basics, mechanics, thermodynamics, organic chemistry, algebra, coordinate geometry.' : ''}

Return a JSON array of objects with these exact fields:
- subject (string)
- topic (string) 
- subtopic (string or null)
- difficulty ("easy" | "medium" | "hard")
- skill_tested ("concept" | "logic" | "calculation" | "reading" | "prerequisite")
- question_text (string)
- option_a (string)
- option_b (string)
- option_c (string)
- option_d (string)
- correct_option ("A" | "B" | "C" | "D")
- explanation (string, 1-2 sentences)
- prerequisite_topic (string or null - what topic must be understood first)

Return ONLY the JSON array, no markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert Indian education assessment designer. Generate high-quality diagnostic questions. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse JSON from response
    let questions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(content);
      }
    } catch {
      console.error("Failed to parse AI response:", content.substring(0, 500));
      throw new Error("Failed to parse generated questions");
    }

    // Add IDs for client-side use
    questions = questions.map((q: any, i: number) => ({
      ...q,
      id: `diag-${Date.now()}-${i}`,
    }));

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
