import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, subject, examMode = "JEE", language = "english", chapter } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    const examLabel = examMode === "CUET" ? "CUET UG" : examMode === "NEET" ? "NEET" : "JEE";
    const langRule = language === "english"
      ? "100% ENGLISH ONLY. Professional, academic tone."
      : language === "hindi"
      ? "100% हिंदी (देवनागरी)। तकनीकी शब्द अंग्रेज़ी में।"
      : "Hinglish coaching style. Friendly mentor tone.";

    if (type === "formulas") {
      systemPrompt = `You are a ${examLabel} exam revision expert creating a formula/concept sheet for ${subject}.
Language: ${langRule}

OUTPUT FORMAT (STRICT JSON ARRAY):
Return ONLY a valid JSON array. No markdown, no code blocks, no explanation.

Each element:
{
  "chapter": "Chapter Name",
  "formulas": [
    {
      "formula": "The formula or key concept in plain text with Unicode math symbols",
      "explanation": "1-line explanation",
      "examTip": "When/how this appears in ${examLabel} exam"
    }
  ]
}

Rules:
- Return 4-6 chapters with 3-5 formulas each
- For ${examMode === "CUET" ? "CUET: Focus on NCERT Class 12 definitions, key terms, ratios. Keep it simple and recall-focused." : "JEE/NEET: Use proper mathematical notation (Unicode symbols like ², ³, →, ∫, ∑, π, θ, Δ). No LaTeX."}
- Make formulas/concepts DIFFERENT from what a static textbook would show — include lesser-known but exam-critical ones
- Include current year exam trends
- ONLY return the JSON array, nothing else`;

      userPrompt = `Generate a ${examLabel} formula/concept sheet for subject: ${subject}${chapter ? ` (chapter: ${chapter})` : ""}.
Include exam-critical formulas that students often miss. Focus on ${new Date().getFullYear()} exam patterns.`;

    } else if (type === "difference_tables") {
      systemPrompt = `You are a ${examLabel} exam revision expert creating comparison/difference tables for ${subject}.
Language: ${langRule}

OUTPUT FORMAT (STRICT JSON ARRAY):
Return ONLY a valid JSON array. No markdown, no code blocks.

Each element:
{
  "title": "Concept A vs Concept B",
  "items": [
    { "aspect": "Aspect name", "left": "Concept A detail", "right": "Concept B detail" }
  ]
}

Rules:
- Return 4-6 comparison tables
- Each table should have 4-5 comparison aspects
- Focus on ${examMode === "CUET" ? "NCERT Class 12 concepts that are frequently confused in CUET" : `concepts frequently compared in ${examLabel} exams`}
- Include comparisons that appeared in recent ${examLabel} papers
- Make tables DIFFERENT each time — don't always pick the most obvious comparisons
- ONLY return the JSON array, nothing else`;

      userPrompt = `Generate ${examLabel} difference/comparison tables for subject: ${subject}.
Focus on confusing pairs that students mix up in exams. Include ${new Date().getFullYear()} trending comparisons.`;

    } else if (type === "quiz") {
      systemPrompt = `You are a ${examLabel} exam quiz master creating rapid-fire 1-mark questions for ${subject}.
Language: ${langRule}

OUTPUT FORMAT (STRICT JSON ARRAY):
Return ONLY a valid JSON array. No markdown, no code blocks.

Each element:
{
  "question": "The question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correct": 0,
  "explanation": "1-2 line explanation of correct answer"
}

Rules:
- Return exactly 10 questions
- "correct" is the 0-based index of the correct option
- ${examMode === "CUET" ? "CUET level: NCERT-based, definition/fact-oriented, 30-second solvable. Cover: definitions, facts, one-line conceptual MCQs." : `${examLabel} level: Conceptual, tricky options, 60-second solvable.`}
- Mix difficulty: 4 easy, 4 medium, 2 tricky
- Include questions based on recent ${examLabel} exam patterns
- Make questions DIFFERENT each time — avoid the most commonly seen questions
- Distractors should reflect real student mistakes
- ONLY return the JSON array, nothing else`;

      userPrompt = `Generate 10 rapid-fire ${examLabel} MCQs for subject: ${subject}.
Include ${new Date().getFullYear()} exam trend questions. Mix difficulty levels. Each question should test a different concept.`;

    } else {
      return new Response(JSON.stringify({ error: "Invalid type. Use: formulas, difference_tables, or quiz" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.8, response_mime_type: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Parse the JSON from the AI response
    let parsed;
    try {
      // Strip markdown code blocks if present
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: content }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-revision-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
