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
  examMode?: "JEE" | "NEET" | "CUET";
  /** B2B flag: skip cache, always generate fresh questions */
  forceNew?: boolean;
  /** IDs the student has already seen — never return these */
  excludeIds?: string[];
  /** Entropy seed for uniqueness (e.g. timestamp) */
  seed?: number;
  /** Assessment session ID this batch belongs to */
  sessionId?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      subchapterId,
      subchapterName,
      chapterId,
      chapterName,
      subject,
      difficulty,
      type = "MCQ",
      count = 5,
      examMode = "JEE",
      forceNew = false,
      excludeIds = [],
      seed = Date.now(),
      sessionId,
    }: QuestionRequest = await req.json();

    const isNeet = examMode === "NEET";
    const isCuet = examMode === "CUET";
    const examLabel = isCuet ? "CUET UG" : isNeet ? "NEET UG" : "JEE";

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ─── CACHE LOOKUP (skipped for B2B forceNew) ───
    if (!forceNew) {
      let query = supabase
        .from("questions")
        .select("*")
        .eq("subchapter_id", subchapterId)
        .eq("difficulty", difficulty)
        .eq("type", type);

      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.map(id => `"${id}"`).join(",")})`);
      }

      const { data: cachedQuestions } = await query.limit(count);

      if (cachedQuestions && cachedQuestions.length >= count) {
        return new Response(JSON.stringify({ questions: cachedQuestions.slice(0, count), cached: true }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // ─── AI GENERATION ───
    const difficultyMap: Record<string, string> = {
      easy: isCuet
        ? "NCERT direct recall, 30-45s solve time, Class 12 level"
        : isNeet
        ? "NCERT level, single-concept, direct recall"
        : "NCERT level, single-concept, 30-60s solve time",
      medium: isCuet
        ? "CUET standard application level, NCERT-based, 45-75s solve time"
        : isNeet
        ? "NEET UG level, 2-3 concepts, 1-2 min"
        : "JEE Mains level, 2-3 concepts, 1-2 min",
      hard: isCuet
        ? "CUET challenging multi-concept, requires analysis, 1.5-2 min"
        : isNeet
        ? "NEET advanced, multi-concept, 2-4 min"
        : "JEE Advanced level, multi-concept, 2-4 min",
    };

    // Uniqueness instruction seeded by timestamp to prevent AI repeating cached patterns
    const uniquenessInstruction = `SEED: ${seed}. Generate COMPLETELY FRESH questions not typically seen in standard question banks. Vary the scenario, numbers, and angle of testing.`;

    // ─── CUET-SPECIFIC SYSTEM PROMPT ───
    const getCuetSystemPrompt = () => `You are an expert CUET UG question designer. Create authentic CUET UG MCQs.

CUET STANDARDS:
- Strictly NCERT Class 11-12 syllabus aligned
- Focus on recall, comprehension, and application (NOT derivations or complex numericals)
- Questions must test conceptual understanding, definitions, and NCERT examples
- Each wrong option must represent a genuine student misconception
- Difficulty: ${difficulty} (${difficultyMap[difficulty]})
- Subject: ${subject} > ${chapterName} > ${subchapterName}
- DO NOT mention JEE, NEET, or any other exam anywhere in the content
- ${uniquenessInstruction}`;

    // ─── JEE SYSTEM PROMPT ───
    const getJeeSystemPrompt = () => `You are an expert JEE question designer. Create authentic JEE-style MCQs.

STRICT JEE AUTHENTICITY:
- NUMERICAL VALUES: Use realistic mass (2 kg), force (10 N), velocity (500 m/s), etc. NO placeholders.
- GIVEN/REQUIRED: State GIVEN data clearly and what is REQUIRED.
- NO VAGUE THEORY: Test measurable relationships only.
- MATH NOTATION: Use V = IR, F = ma, x². No LaTeX. Use Unicode (α, β, θ, λ, μ, ρ, ω, ε, Δ, π).
- Difficulty: ${difficulty} (${difficultyMap[difficulty]})
- Topic: ${subject} > ${chapterName} > ${subchapterName}
- ${uniquenessInstruction}`;

    // ─── NEET SYSTEM PROMPT ───
    const getNeetSystemPrompt = () => `You are an expert NEET UG question designer. Create authentic NEET-style MCQs.

NEET STANDARDS:
- Strictly NCERT-based, no questions that go beyond NCERT scope
- Biology: diagrams, definitions, organisms, functions, processes
- Chemistry: reactions, mechanisms, properties as per NCERT
- Physics: numericals and conceptual questions from NCERT
- Each wrong option must stem from a real NCERT misconception
- Difficulty: ${difficulty} (${difficultyMap[difficulty]})
- Topic: ${subject} > ${chapterName} > ${subchapterName}
- ${uniquenessInstruction}`;

    const systemPrompt = isCuet
      ? getCuetSystemPrompt()
      : isNeet
      ? getNeetSystemPrompt()
      : getJeeSystemPrompt();

    const userPrompt = `Generate exactly ${count} MCQ questions for "${subchapterName}" (${subject} — ${chapterName}) at ${difficulty} difficulty for ${examLabel}.

Return ONLY a valid JSON array (no markdown, no code fences):
[{
  "question_text": "...",
  "option_a": "...", "option_b": "...", "option_c": "...", "option_d": "...",
  "correct_option": "A/B/C/D",
  "explanation": "Brief step-by-step explanation (max 120 words)",
  "concept_tested": "Specific concept name",
  "common_mistake": "What students typically get wrong here"
}]

Rules:
- Exactly ${count} items in the array
- All 4 options must be plausible (no obviously wrong distractors)
- No question should repeat a scenario already tested — vary the angle
- Keep question_text under 80 words`;

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
        temperature: forceNew ? 0.85 : 0.5, // Higher temp for B2B fresh generation
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content in AI response");

    // ─── PARSE JSON ───
    let questions;
    try {
      let jsonContent = content.trim();
      const codeBlockMatch = jsonContent.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlockMatch) jsonContent = codeBlockMatch[1].trim();

      try {
        questions = JSON.parse(jsonContent);
      } catch {
        let sanitized = "";
        let inString = false;
        let escaped = false;
        for (let i = 0; i < jsonContent.length; i++) {
          const ch = jsonContent[i];
          if (escaped) { sanitized += ch; escaped = false; continue; }
          if (ch === "\\" && inString) { sanitized += ch; escaped = true; continue; }
          if (ch === '"') { inString = !inString; sanitized += ch; continue; }
          if (inString) {
            if (ch === "\n") { sanitized += "\\n"; continue; }
            if (ch === "\r") continue;
            if (ch === "\t") { sanitized += "\\t"; continue; }
          }
          sanitized += ch;
        }
        questions = JSON.parse(sanitized);
      }

      if (!Array.isArray(questions)) throw new Error("Response is not an array");
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError, content.substring(0, 300));
      throw new Error("Failed to parse questions from AI");
    }

    // ─── STORE IN DB ───
    const questionsToInsert = questions.map((q: any) => ({
      subchapter_id: subchapterId,
      chapter_id: chapterId,
      subject: subject.toLowerCase(),
      difficulty,
      type,
      question_text: q.question_text,
      option_a: q.option_a || null,
      option_b: q.option_b || null,
      option_c: q.option_c || null,
      option_d: q.option_d || null,
      correct_option: q.correct_option ? q.correct_option.toUpperCase() : null,
      integer_answer: q.integer_answer !== undefined ? q.integer_answer : null,
      tolerance: q.tolerance !== undefined ? q.tolerance : 0,
      match_pairs: q.match_pairs || null,
      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake || null,
      source: forceNew ? "ai_b2b" : "ai_generated",
      // Tag with session if B2B
      ...(sessionId ? { session_id: sessionId } : {}),
    }));

    const { data: insertedQuestions, error: insertError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (insertError) {
      console.error("Error inserting questions:", insertError);
      return new Response(JSON.stringify({ questions: questionsToInsert.map((q, i) => ({ ...q, id: `temp-${seed}-${i}` })), cached: false }), {
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
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
