import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Exam = "JEE" | "NEET" | "CUET" | "JEE_MAINS" | "JEE_ADVANCED";
type Subject = "Physics" | "Chemistry" | "Maths" | "Biology" | string;
type Difficulty = "easy" | "medium" | "hard" | "Easy" | "Medium" | "Hard";

interface DifficultyDistribution {
  easy?: number;
  medium?: number;
  hard?: number;
}

interface GenerateRequest {
  exam: Exam;
  subject: Subject;
  topic: string;
  subtopic: string;
  count?: number;                    // how many questions to generate (default 1)
  difficulty?: Difficulty;           // single difficulty (used when count=1)
  difficulty_distribution?: DifficultyDistribution;  // for batch generation
  learning_node_id?: string;         // link to knowledge tree
  variant_of_question_id?: string;   // UUID from questions_bank for variant gen
  student_id?: string;               // personalisation context
  save_to_db?: boolean;              // default true
}

// ─── Expert Prompt Builder ──────────────────────────────────────────────────

function buildExpertPrompt(params: GenerateRequest, count: number): { system: string; user: string } {
  const { exam, subject, topic, subtopic, difficulty_distribution, difficulty = "medium" } = params;

  // Normalise exam label
  const examLabel = exam === "JEE_MAINS" ? "JEE" : exam === "JEE_ADVANCED" ? "JEE" : exam;

  const system = `You are an expert assessment designer for competitive exams in India including JEE Main, NEET, and CUET.

Your task is to generate high-quality multiple choice questions (MCQs) aligned with the Indian syllabus.

STRICT REQUIREMENTS:

1. Question Quality:
* Questions must be conceptually correct, unambiguous, and exam-relevant.
* Follow JEE/NEET/CUET patterns (not trivial or overly theoretical).
* Avoid vague or opinion-based questions.

2. Structure:
Return output ONLY as a valid JSON ARRAY (even for a single question).

Each question must follow this exact schema:
{
  "question_text": "...",
  "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "correct_answer": "A",
  "difficulty": "easy | medium | hard",
  "exam": "${examLabel}",
  "subject": "${subject}",
  "topic": "${topic}",
  "subtopic": "${subtopic}",
  "explanation": "...",
  "tags": ["concept1", "concept2"],
  "source": "ai",
  "quality_score": 0.9,
  "estimated_time_seconds": 60
}

3. Difficulty Guidelines:
* easy: Direct formula/concept recall — 30–45 seconds
* medium: 1–2 step application — 60–90 seconds
* hard: Multi-step reasoning / JEE Advanced level — 2–3 minutes

4. Options:
* Exactly 4 options keyed A, B, C, D
* Only ONE correct answer
* All options must be plausible (no obvious elimination)
* Use proper notation: subscripts (v₁), Greek letters (θ α ω), fractions where needed

5. Explanation:
* Clear, step-by-step, educational
* Include formulas where needed
* Reference NCERT chapter/concept where applicable
* Should genuinely teach — not just state the answer

6. Diversity Rules:
* Do NOT repeat questions
* Do NOT reuse same numbers or patterns repeatedly
* Vary contexts and numerical values

7. Accuracy:
* Ensure correct_answer is truly correct
* No contradictions between explanation and answer

${examLabel === "NEET" ? "8. NEET-Specific: Strictly NCERT Class 11-12. Biological/chemical accuracy is mandatory." : ""}
${examLabel === "JEE" ? "8. JEE-Specific: Advanced multi-step problems permitted. Use exact scientific notation." : ""}
${examLabel === "CUET" ? "8. CUET-Specific: NCERT-only content. 30–90 second questions. Straightforward application." : ""}

Return ONLY a JSON array. No markdown fences, no extra text, no explanation outside the JSON.`;

  // Build difficulty instruction
  let difficultyInstruction: string;
  if (difficulty_distribution && count > 1) {
    const parts: string[] = [];
    if (difficulty_distribution.easy) parts.push(`${difficulty_distribution.easy} easy`);
    if (difficulty_distribution.medium) parts.push(`${difficulty_distribution.medium} medium`);
    if (difficulty_distribution.hard) parts.push(`${difficulty_distribution.hard} hard`);
    difficultyInstruction = `Use this difficulty distribution: ${parts.join(", ")}.`;
  } else {
    difficultyInstruction = `All questions should be ${difficulty.toLowerCase()} difficulty.`;
  }

  const user = `Generate exactly ${count} MCQ${count > 1 ? "s" : ""} for:

Exam: ${examLabel}
Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}

${difficultyInstruction}

Return a JSON array of exactly ${count} question object${count > 1 ? "s" : ""}.`;

  return { system, user };
}

// ─── Variant Prompt Builder ──────────────────────────────────────────────────

function buildVariantPrompt(original: any, params: GenerateRequest): { system: string; user: string } {
  const { exam, subject, topic, subtopic, difficulty = "medium" } = params;
  const examLabel = exam === "JEE_MAINS" ? "JEE" : exam === "JEE_ADVANCED" ? "JEE" : exam;

  const system = `You are an expert assessment designer for competitive exams in India.
Generate a VARIANT of the provided question. Return ONLY a JSON array with exactly 1 question object.

Schema:
{
  "question_text": "...",
  "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "correct_answer": "A",
  "difficulty": "${difficulty.toLowerCase()}",
  "exam": "${examLabel}",
  "subject": "${subject}",
  "topic": "${topic}",
  "subtopic": "${subtopic}",
  "explanation": "...",
  "tags": ["concept1", "concept2"],
  "source": "ai",
  "quality_score": 0.88,
  "estimated_time_seconds": 60
}

VARIANT RULES:
1. Keep the SAME concept and difficulty level
2. For numerical questions: change ALL numeric values significantly (different magnitudes, different contexts)
3. For theory questions: reframe the stem (different wording, reversed logic, different scenario)
4. All 4 options must be plausible but only one correct
5. Do NOT copy any sentence from the original verbatim
Return ONLY a JSON array. No markdown, no extra text.`;

  const user = `Original question:
${JSON.stringify(original, null, 2)}

Generate 1 variant question for ${examLabel} ${subject} > ${topic} > ${subtopic}.`;

  return { system, user };
}

// ─── Map AI output → questions_bank row ─────────────────────────────────────

function mapToDBRow(q: any, params: GenerateRequest, isVariant = false) {
  const examNorm = (params.exam === "JEE_MAINS" || params.exam === "JEE_ADVANCED")
    ? "JEE"
    : params.exam;

  const correctOption = (q.correct_answer || "A").toUpperCase().charAt(0);
  const diffNorm = (q.difficulty || params.difficulty || "medium").toLowerCase();

  const timeMap: Record<string, number> = { easy: 45, medium: 75, hard: 150 };
  const estimatedTime = q.estimated_time_seconds || timeMap[diffNorm] || 75;

  return {
    exam: examNorm,
    subject: params.subject,
    topic: params.topic,
    subtopic: params.subtopic,
    ncert_chapter: params.topic,
    difficulty: diffNorm.charAt(0).toUpperCase() + diffNorm.slice(1), // "Easy" | "Medium" | "Hard"
    question_type: "TYPE_A",
    exam_stage: "practice",
    question_text: q.question_text,
    options: q.options,                    // already {A, B, C, D} format
    correct_option: correctOption,
    explanation: {
      short: (q.explanation || "").slice(0, 150),
      detailed_steps: [q.explanation || ""],
      ncert_reference: `${params.subject} — ${params.topic}`,
    },
    tags: q.tags || [params.exam, params.subject, params.topic, params.subtopic],
    ai_quality_score: q.quality_score || 0.9,
    quality_gate_passed: (q.quality_score || 0.9) >= 0.7,
    pyq_similar: false,
    is_verified: false,
    generation_model: "gemini-2.5-flash",
    estimated_time_seconds: estimatedTime,
    micro_concept: params.subtopic,
    // Optional fields
    ...(params.learning_node_id ? { learning_node_id: params.learning_node_id } : {}),
    ...(isVariant && params.variant_of_question_id
      ? { question_id: `VARIANT_${params.variant_of_question_id}_${Date.now()}` }
      : { question_id: `${examNorm}_${params.subject.replace(/\s+/g, "")}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}` }),
  };
}

// ─── Main handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const body: GenerateRequest = await req.json();
    const {
      exam = "JEE",
      subject,
      topic,
      subtopic,
      count = 1,
      difficulty = "medium",
      difficulty_distribution,
      variant_of_question_id,
      save_to_db = true,
    } = body;

    if (!subject || !topic || !subtopic) {
      throw new Error("subject, topic, and subtopic are required");
    }

    const batchCount = Math.min(Math.max(1, count), 20); // cap at 20 per call
    const isVariant = !!variant_of_question_id;

    // ── Fetch original question for variant mode ──────────────────────────
    let originalQuestion: any = null;
    if (isVariant) {
      const { data } = await (supabase as any)
        .from("questions_bank")
        .select("question_text, options, correct_option, explanation, topic, subtopic")
        .eq("id", variant_of_question_id)
        .maybeSingle();

      if (data) originalQuestion = data;
    }

    // ── Build prompt ──────────────────────────────────────────────────────
    const { system, user } = isVariant && originalQuestion
      ? buildVariantPrompt(originalQuestion, body)
      : buildExpertPrompt(body, batchCount);

    // ── Call Gemini ───────────────────────────────────────────────────────
    const aiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }],
          generationConfig: {
            temperature: isVariant ? 0.85 : 0.70,
            response_mime_type: "application/json",
          },
        }),
      }
    );

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      throw new Error(`Gemini API error ${aiRes.status}: ${errText.slice(0, 200)}`);
    }

    const aiJson = await aiRes.json();
    const raw = aiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // ── Parse ─────────────────────────────────────────────────────────────
    let parsed: any[];
    try {
      const trimmed = raw.trim();
      const maybeArray = JSON.parse(trimmed);
      parsed = Array.isArray(maybeArray) ? maybeArray : [maybeArray];
    } catch {
      throw new Error(`Failed to parse AI response as JSON. Raw: ${raw.slice(0, 300)}`);
    }

    // ── Map to DB rows ────────────────────────────────────────────────────
    const rows = parsed.map((q) => mapToDBRow(q, body, isVariant));

    // ── Save to DB (fire-and-forget for single, awaited for batch) ────────
    let insertedIds: string[] = [];
    if (save_to_db) {
      const { data: inserted, error } = await (supabase as any)
        .from("questions_bank")
        .insert(rows)
        .select("id, question_id");

      if (error) {
        console.error("[generate-question] DB insert error:", error.message);
      } else {
        insertedIds = (inserted || []).map((r: any) => r.id);
      }
    }

    const genTime = Date.now() - startTime;

    // ── Shape response ────────────────────────────────────────────────────
    const questions = rows.map((row, i) => ({
      ...row,
      db_id: insertedIds[i] || null,
      // Convenience flat fields for frontend
      option_a: row.options?.A,
      option_b: row.options?.B,
      option_c: row.options?.C,
      option_d: row.options?.D,
      correct_answer: row.correct_option,
      explanation_text: row.explanation?.detailed_steps?.[0] || "",
      is_variant: isVariant,
      parent_question_id: variant_of_question_id || null,
    }));

    return new Response(JSON.stringify({
      success: true,
      count: questions.length,
      questions: batchCount === 1 ? questions : questions,  // always array
      question: questions[0],  // backward-compat single-question field
      gen_time_ms: genTime,
      saved_to_db: save_to_db && insertedIds.length > 0,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[generate-question]", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
