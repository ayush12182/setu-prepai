import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface QuestionRequest {
  subchapterId: string;
  subchapterName: string;
  chapterId: string;
  chapterName: string;
  subject: string;
  difficulty: "easy" | "medium" | "hard";
  type?: "MCQ" | "INTEGER" | "MATCH";
  count?: number;
  examMode?: "JEE" | "NEET";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subchapterId, subchapterName, chapterId, chapterName, subject, difficulty, type = "MCQ", count = 5, examMode = "JEE" }: QuestionRequest = await req.json();
    const isNeet = examMode === "NEET";
    const examLabel = isNeet ? "NEET UG" : "JEE";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if we already have questions for this subchapter and difficulty
    const { data: existingQuestions, error: fetchError } = await supabase
      .from("questions")
      .select("*")
      .eq("subchapter_id", subchapterId)
      .eq("difficulty", difficulty)
      .eq("type", type)
      .limit(count);

    if (fetchError) {
      console.error("Error fetching existing questions:", fetchError);
    }

    // If we have enough questions, return them
    if (existingQuestions && existingQuestions.length >= count) {
      return new Response(JSON.stringify({ questions: existingQuestions.slice(0, count) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine prompts based on question type
    let systemPrompt = "";
    let userPrompt = "";

    const difficultyMap: Record<string, string> = {
      easy: isNeet ? "NCERT level, single-concept, direct recall" : "NCERT level, single-concept, 30-60s solve time",
      medium: isNeet ? "NEET UG level, 2-3 concepts, 1-2 min" : "JEE Mains level, 2-3 concepts, 1-2 min",
      hard: isNeet ? "NEET advanced, multi-concept, 2-4 min" : "JEE Advanced level, multi-concept, 2-4 min"
    };

    if (type === "INTEGER") {
      systemPrompt = `You are a ${examLabel} question designer. Create Integer Type numerical questions.
- Answer MUST be a single integer.
- No options.
- Difficulty: ${difficulty} (${difficultyMap[difficulty]})
- Topic: ${subject} > ${chapterName} > ${subchapterName}
${isNeet ? "- Focus on NCERT-based numericals for NEET UG. Do NOT use the word JEE anywhere." : ""}`;

      userPrompt = `Generate ${count} Integer Type questions for "${subchapterName}" (${examLabel}).
Return JSON array:
[{
  "question_text": "...",
  "integer_answer": 42,
  "tolerance": 0,
  "explanation": "Step-by-step solution...",
  "concept_tested": "Concept",
  "common_mistake": "Common error..."
}]`;
    } else if (type === "MATCH") {
      systemPrompt = `You are a ${examLabel} question designer. Create Match the Following questions.
- Two columns: Left (Items) and Right (Options).
- Complexity suitable for ${difficulty} level.
- Topic: ${subject} > ${chapterName} > ${subchapterName}
${isNeet ? "- Focus on NCERT-based matching: organisms, functions, diagrams, definitions. Do NOT use the word JEE." : ""}`;

      userPrompt = `Generate ${count} Match the Following questions for "${subchapterName}" (${examLabel}).
Return JSON array:
[{
  "question_text": "Match the following:",
  "match_pairs": {
    "left": ["Item A", "Item B", "Item C", "Item D"],
    "right": ["Option P", "Option Q", "Option R", "Option S"],
    "mapping": { "Item A": "Option Q", "Item B": "Option R", "Item C": "Option S", "Item D": "Option P" }
  },
  "explanation": "Reasoning for each match...",
  "concept_tested": "Concept",
  "common_mistake": "Confusing similar items..."
}]`;
    } else {
      // Default MCQ
      systemPrompt = `You are a ${examLabel} question designer. Create exam-grade MCQs with:
- Unicode math notation (subscripts: v₁, superscripts: x², Greek: θ, α, arrows: →). NO LaTeX.
- Each wrong option from a real student mistake.
- Exactly ONE correct answer.
- Brief explanation: Given → Formula → Steps → Answer.
Topic: ${subject} > ${chapterName} > ${subchapterName}
Level: ${difficulty} — ${difficultyMap[difficulty]}
${isNeet ? "IMPORTANT: This is NEET UG, not JEE. Focus on NCERT conceptual/factual questions. Never write the word JEE." : ""}`;

      userPrompt = `Generate ${count} MCQ questions for "${subchapterName}" (${subject} — ${chapterName}) at ${difficulty} difficulty.

Return ONLY a JSON array (no markdown, no code fences):
[{
  "question_text": "...",
  "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "Brief step-by-step: Given → Formula → Calculation → Answer: (X)",
  "concept_tested": "Concept name",
  "common_mistake": "Error → wrong option"
}]

Rules: Unicode notation (subscripts/superscripts), no LaTeX, keep explanations under 150 words each.`;
    }

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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON from AI response
    let questions;
    try {
      // Remove markdown code fences if present
      let jsonContent = content.trim();

      // Handle ```json ... ``` or ``` ... ``` format
      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1].trim();
      }

      // Try parsing directly first
      try {
        questions = JSON.parse(jsonContent);
      } catch {
        // If direct parse fails, sanitize control chars inside string values only
        // Replace unescaped newlines/tabs inside JSON strings by processing char by char
        let sanitized = '';
        let inString = false;
        let escaped = false;
        for (let i = 0; i < jsonContent.length; i++) {
          const ch = jsonContent[i];
          if (escaped) {
            sanitized += ch;
            escaped = false;
            continue;
          }
          if (ch === '\\' && inString) {
            sanitized += ch;
            escaped = true;
            continue;
          }
          if (ch === '"') {
            inString = !inString;
            sanitized += ch;
            continue;
          }
          if (inString) {
            if (ch === '\n') { sanitized += '\\n'; continue; }
            if (ch === '\r') { continue; }
            if (ch === '\t') { sanitized += '\\t'; continue; }
          }
          sanitized += ch;
        }
        questions = JSON.parse(sanitized);
      }

      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response. Error:", parseError);
      console.error("Content received:", content.substring(0, 500));
      throw new Error("Failed to parse questions from AI");
    }

    // Store questions in database
    const questionsToInsert = questions.map((q: any) => ({
      subchapter_id: subchapterId,
      chapter_id: chapterId,
      subject: subject.toLowerCase(),
      difficulty,
      type,
      question_text: q.question_text,
      // MCQ fields
      option_a: q.option_a || null,
      option_b: q.option_b || null,
      option_c: q.option_c || null,
      option_d: q.option_d || null,
      correct_option: q.correct_option ? q.correct_option.toUpperCase() : null,
      // Integer fields
      integer_answer: q.integer_answer !== undefined ? q.integer_answer : null,
      tolerance: q.tolerance !== undefined ? q.tolerance : 0,
      // Match fields
      match_pairs: q.match_pairs || null,

      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake || null,
      source: "ai_generated",
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting questions:", insertError);
      // Return the generated questions even if insert fails
      return new Response(JSON.stringify({ questions: questionsToInsert, cached: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ questions: insertedQuestions, cached: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("generate-questions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
