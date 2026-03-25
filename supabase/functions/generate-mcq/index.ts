/**
 * generate-mcq Supabase Edge Function
 *
 * Generates a single JEE-level MCQ for a given topic.
 * Called by the frontend after each explanation.
 *
 * Body: { topic, subject, difficulty, language, previousQuestions }
 * Returns: { question, options, correctIndex, explanation }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DIFF_INSTRUCTIONS: Record<string, string> = {
  easy:   "Concept-level check. Simple direct question. Suitable for a student just learning the topic.",
  medium: "Application-level. Requires understanding and applying the concept to a scenario.",
  hard:   "JEE Mains level. May require multi-step reasoning, formula derivation, or edge-case handling.",
};

const LANG_INSTRUCTIONS: Record<string, string> = {
  english:  "Ask the question strictly in English.",
  hinglish: "Ask the question in Hinglish (a natural mix of Hindi and English).",
  hindi:    "Ask the question strictly in Hindi (Devanagari script).",
  kannada:  "Ask the question strictly in Kannada script.",
  telugu:   "Ask the question strictly in Telugu script.",
  punjabi:  "Ask the question strictly in Punjabi (Gurmukhi script).",
  marathi:  "Ask the question strictly in Marathi (Devanagari script).",
  tamil:    "Ask the question strictly in Tamil script.",
  gujarati: "Ask the question strictly in Gujarati script.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { topic, subject, difficulty = "medium", language = "english", previousQuestions = [] } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY not configured");
    if (!topic || !subject) throw new Error("topic and subject are required");

    const diffInstruction = DIFF_INSTRUCTIONS[difficulty] ?? DIFF_INSTRUCTIONS.medium;
    const langInstruction = LANG_INSTRUCTIONS[language] ?? LANG_INSTRUCTIONS.english;

    const avoidList = previousQuestions.length > 0
      ? `\nAvoid questions similar to these already asked:\n${previousQuestions.map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}`
      : '';

    const systemPrompt = `You are an expert JEE preparation teacher. Generate ONE high-quality MCQ for:
- Subject: ${subject}
- Topic: ${topic}
- Difficulty: ${diffInstruction}
- Language: ${langInstruction}
${avoidList}

Rules:
- The question must specifically test understanding of "${topic}"
- Options must be plausible and non-trivially different
- Explanation must be concise but complete (2–3 sentences max)
- Do NOT repeat similar questions

Respond ONLY with valid JSON in this exact format:
{
  "question": "...",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctIndex": 0,
  "explanation": "..."
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: systemPrompt }],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI error: ${response.status} ${err}`);
    }

    const data = await response.json();
    const mcq = JSON.parse(data.choices[0].message.content);

    // Validate structure
    if (!mcq.question || !Array.isArray(mcq.options) || mcq.options.length !== 4 || mcq.correctIndex === undefined) {
      throw new Error("Invalid MCQ structure from OpenAI");
    }

    return new Response(JSON.stringify(mcq), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-mcq error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
