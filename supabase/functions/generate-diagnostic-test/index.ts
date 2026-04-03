import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Optimized Class 10 Foundation Configurations (Strict 30-Question Distribution)
const STREAM_CONFIG: Record<string, {
  label: string;
  goal: string;
  subjects: { name: string; count: number }[];
  topics: string;
  style: string;
}> = {
  jee: {
    label: 'JEE Foundation Assessment',
    goal: 'Class 10 prerequisites for Class 11 JEE prep',
    subjects: [{ name: 'Physics', count: 10 }, { name: 'Chemistry', count: 10 }, { name: 'Mathematics', count: 10 }],
    topics: 'Light, Electricity, Magnetic Effects, Chemical Reactions, AP, Quadratic Equations, Trig, Coordinate Geo.',
    style: 'Direct concepts. Easy-medium. Concise logic.',
  },
  neet: {
    label: 'NEET Foundation Assessment',
    goal: 'Class 10 prerequisites for Class 11 NEET prep',
    subjects: [{ name: 'Physics', count: 10 }, { name: 'Chemistry', count: 10 }, { name: 'Biology', count: 10 }],
    topics: 'Physics fundamentals, Chemistry reactions, Life Processes, Heredity, Coordination.',
    style: 'Definition & core mechanism focused. Easy-medium.',
  },
  commerce: {
    label: 'Commerce Foundation Assessment',
    goal: 'Logic and economic deduction for beginning Commerce',
    subjects: [{ name: 'Accounts', count: 10 }, { name: 'Economics', count: 10 }, { name: 'Business Studies', count: 10 }],
    topics: 'Financial logic, demand/supply, basic business awareness, profit/loss deduction.',
    style: 'Conceptual intuition and logical business deduction.',
  },
  cuet: {
    label: 'CUET Foundation Assessment',
    goal: 'Subject fundamentals for college entrance prep',
    subjects: [{ name: 'Accounts', count: 10 }, { name: 'Economics', count: 10 }, { name: 'Business Studies', count: 10 }],
    topics: 'Everyday economics, logic, basic business awareness.',
    style: 'Fast-paced, conceptual MCQs.',
  },
  foundation: {
    label: 'Foundation Hub Assessment',
    goal: 'General Science and Math baseline',
    subjects: [{ name: 'Mathematics', count: 15 }, { name: 'Science', count: 15 }],
    topics: 'Algebra, Geometry, Basic Physics, Cell basics.',
    style: 'Clear prerequisite testing.',
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { stream = 'jee' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const config = STREAM_CONFIG[stream] || STREAM_CONFIG['jee'];
    const totalQuestions = config.subjects.reduce((sum, sub) => sum + sub.count, 0);
    const distributionInstruct = config.subjects.map(s => `- ${s.count} q: ${s.name}`).join(', ');

    const prompt = `Act as an expert Indian assessment designer for SETU Platform.
Type: ${config.label}
Goal: ${config.goal}
Count: ${totalQuestions}
Distribution: ${distributionInstruct}
Difficulty: Easy/Medium only. Use Class 10 prerequisite scope.

Return EXACTLY ${totalQuestions} questions as a JSON array of objects.
FIELDS:
- subject (string, exact: ${config.subjects.map(s => s.name).join('/')})
- topic (string)
- subtopic (string or null)
- difficulty ("easy" | "medium")
- skill_tested ("concept" | "logic" | "calculation" | "reading")
- question_text (string)
- option_a (string), option_b (string), option_c (string), option_d (string)
- correct_option ("A" | "B" | "C" | "D")
- explanation (max 10 words)
- prerequisite_topic (string or null)

CRITICAL:
1. Verify each answer. Only one correct option.
2. Speed optimization: Keep explanations very brief (1 sentence).
3. Class 10 Foundation only.

Return ONLY the JSON array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-1.5-flash", // Use stable flash for max speed
        messages: [
          { role: "system", content: "You generate verified assessment JSON arrays. No intro, no backticks, no markdown. 30 high-quality questions." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let questions;
    try {
      let cleanContent = content.trim();
      if (cleanContent.startsWith("\`\`\`json")) cleanContent = cleanContent.replace(/^```json\n/, "").replace(/\n```$/, "");
      else if (cleanContent.startsWith("\`\`\`")) cleanContent = cleanContent.replace(/^```\n/, "").replace(/\n```$/, "");
      
      questions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Parse Error. Raw:", content);
      throw new Error("AI returned invalid JSON");
    }

    return new Response(JSON.stringify({ questions: (questions as any[]).slice(0, 30) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Error generating questions" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
