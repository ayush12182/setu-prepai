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
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { topic, subject, difficulty = "medium", language = "english", previousQuestions = [] } = body;
    
    console.log(`[MCQ] Request received for Topic: "${topic}", Subject: "${subject}", Lang: "${language}"`);

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      console.error("[MCQ] Missing OPENAI_API_KEY");
      throw new Error("OPENAI_API_KEY not configured");
    }
    
    if (!topic || !subject) throw new Error("topic and subject are required");

    const diffInstruction = DIFF_INSTRUCTIONS[difficulty] ?? DIFF_INSTRUCTIONS.medium;
    const langInstruction = LANG_INSTRUCTIONS[language] ?? LANG_INSTRUCTIONS.english;

    const avoidList = previousQuestions.length > 0
      ? `\nAvoid questions similar to these already asked:\n${previousQuestions.map((q: string, i: number) => `- ${q}`).join('\n')}`
      : '';

    const systemPrompt = `You are an expert IIT-JEE Mains Physics & Chemistry teacher. Your goal is to generate one AUTHENTIC JEE Main level Multiple Choice Question (MCQ) for the topic: ${topic}.

STRICT GUIDELINES:
1. NO VAGUE THEORY: Avoid abstract, philosophical, or theoretical wording (e.g., "which best describes", "recent patterns"). 
2. NUMERICAL AUTHENTICITY: Use realistic numerical values (e.g., 2 kg, 10 m/s², 0.5 friction coefficient). DO NOT use placeholders like \${subject} or \${topic} in the question text.
3. CLARITY: Clearly define:
   - GIVEN DATA: (e.g., "A block of 5kg is on a 30° incline...")
   - REQUIRED OUTPUT: (e.g., "Find the minimum force to prevent sliding...")
4. DIFFICULTY: ${diffInstruction} (Must align with actual JEE Mains difficulty).
5. FORMAT: 
   - 4 Options (A, B, C, D).
   - Only ONE correct answer.
   - Return ONLY a valid JSON object.
6. EXPLANATION: Provide a concise, step-by-step logical solution using formulas (e.g., F = ma, W = ΔK).

JSON FORMAT:
{
  "question": "A clear, numerical JEE Main style problem.",
  "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
  "correctIndex": 0-3,
  "explanation": "Step-by-step logical solution starting with Given data."
}

Language: ${language}
${avoidList}`;

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
        max_tokens: 600,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[MCQ] OpenAI error: ${response.status}`, err);
      throw new Error(`OpenAI error: ${response.status}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Clean up potential markdown blocks
    content = content.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const mcq = JSON.parse(content);

    // Validate structure
    if (!mcq.question || !Array.isArray(mcq.options) || mcq.options.length !== 4) {
      console.error("[MCQ] Invalid structure from AI:", mcq);
      throw new Error("Invalid MCQ structure from AI");
    }

    console.log("[MCQ] Successfully generated question");

    return new Response(JSON.stringify(mcq), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[MCQ] Exception:", e.message);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
