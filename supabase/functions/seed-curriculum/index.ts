import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { 
      secret,
      chapterId, 
      chapterName, 
      subject = "Physics",
      subchapters = [],
      count = 10,
      difficulty = "mixed"
    } = body;

    if (secret !== "SEED_CURRICULUM_SECRET_789") {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 403, headers: corsHeaders });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY")!;

    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured in Supabase Secrets.");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Build the prompt for OpenAI
    const subchaptersList = subchapters.map((s: any) => `${s.id}: ${s.name}`).join("\n");
    const prompt = `You are a legendary JEE Main & Advanced question setter at Allen/Resonance in Kota.
Generate EXACTLY ${count} brand new, highly rigorous multiple-choice questions for ${subject}.
Chapter ID: ${chapterId}
Chapter Name: ${chapterName}
Target Difficulty: ${difficulty} (use a good mix of easy, medium, and hard)

You must distribute the questions across the following subchapters:
${subchaptersList}

STRICT ASSESSMENT RULES:
1. Conceptually correct, mathematically rigorous, no option mismatches.
2. Use LaTeX notation ($...$ or $$...$$) for equations and options.
3. Distractors must represent actual common student mistakes.
4. Each question must map to exactly one of the subchapter IDs listed above.

Return a JSON object with a single key "questions" containing an array of exactly ${count} objects:
{
  "questions": [
    {
      "subchapter_id": "one of the subchapter IDs from above",
      "difficulty": "easy|medium|hard",
      "question": "Question text here...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_option": "A|B|C|D",
      "explanation": "Step-by-step solution... Concept -> Derivation -> Final calculation",
      "concept_tested": "Specific micro-concept"
    }
  ]
}`;

    // Call OpenAI
    const url = "https://api.openai.com/v1/chat/completions";
    const openaiRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI API failed: ${openaiRes.status} - ${errText}`);
    }

    const raw = await openaiRes.json();
    const text = raw.choices?.[0]?.message?.content;
    if (!text) throw new Error("Empty response from OpenAI");

    const parsed = JSON.parse(text.trim());
    let parsedQuestions = parsed.questions || parsed;
    if (!Array.isArray(parsedQuestions)) {
      parsedQuestions = [parsedQuestions];
    }

    // Insert into database
    const dbInserts = parsedQuestions.map((q: any) => ({
      chapter_id: chapterId,
      subchapter_id: q.subchapter_id || chapterId,
      subject: subject,
      difficulty: q.difficulty?.toLowerCase() || "medium",
      question_text: q.question,
      option_a: q.options?.A || "",
      option_b: q.options?.B || "",
      option_c: q.options?.C || "",
      option_d: q.options?.D || "",
      correct_option: q.correct_option || "A",
      explanation: q.explanation || "",
      concept_tested: q.concept_tested || "General",
      verification_status: 'APPROVED',
      is_verified: true,
      exam_type: 'JEE_MAINS',
      question_type: 'MCQ',
      source: 'PrepEntrance Elite Seeder (OpenAI)'
    }));

    const { data, error } = await supabase.from('questions').insert(dbInserts).select('id');
    if (error) throw error;

    return new Response(JSON.stringify({ success: true, count: data.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
