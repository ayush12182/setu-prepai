import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Exam = "JEE_MAINS" | "JEE_ADVANCED" | "NEET" | "CUET" | "OTHER";
type Difficulty = "Easy" | "Medium" | "Hard";

interface GenerateRequest {
  exam: Exam;
  subject: string;
  topic: string;
  subtopic: string;
  difficulty?: Difficulty;
  variant_of_question_id?: string;   // UUID from questions_bank
  student_id?: string;               // for personalisation context
}

function buildPrompt(params: GenerateRequest, originalQuestion?: any): { system: string; user: string } {
  const { exam, subject, topic, subtopic, difficulty = "Medium" } = params;
  const isVariant = !!originalQuestion;

  const examLabel = exam.replace("_", " ");

  const system = `You are an elite ${examLabel} question setter with 15 years experience writing NTA-standard MCQs.

STRICT RULES:
- Single correct MCQ, 4 options (A/B/C/D)
- NCERT-aligned for CUET/NEET, advanced for JEE
- ${difficulty} difficulty: ${ difficulty === "Easy" ? "Concept recall, 30-45 seconds" : difficulty === "Medium" ? "Application, 1-2 minutes" : "Multi-step, 2-3 minutes"}
- No ambiguous options. Exactly one option must be definitively correct.
- Return ONLY valid JSON — no markdown, no extra text`;

  if (isVariant && originalQuestion) {
    const user = `Generate a VARIANT of this ${examLabel} question on ${subject} > ${topic} > ${subtopic}.

ORIGINAL QUESTION:
${JSON.stringify(originalQuestion, null, 2)}

VARIANT RULES:
1. Keep THE SAME concept and difficulty
2. For numerical questions: change all numeric values significantly (use different magnitudes)
3. For theory questions: reframe the stem (different wording, reversed logic, different context)
4. All 4 options must be plausible but only one correct
5. Explanation must reference NCERT / concept name

Return JSON:
{
  "question_text": "...",
  "option_a": "...",
  "option_b": "...",
  "option_c": "...",
  "option_d": "...",
  "correct_answer": "A",
  "explanation": "Step-by-step explanation (max 100 words)",
  "concept_tested": "${topic} — specific concept",
  "difficulty": "${difficulty}"
}`;
    return { system, user };
  }

  const user = `Generate ONE fresh ${examLabel} ${difficulty} MCQ on:
Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}

The question must test a specific, examinable concept from ${subtopic}.
${exam === "CUET" ? "Match CUET UG paper style: NCERT-only, 30-90 second questions." : ""}
${exam.includes("JEE") ? "Use proper notation: subscripts (v₁), Greek (θ α ω), fractions ((a−b)/c)." : ""}
${exam === "NEET" ? "Strictly NCERT Class 11-12. Biological/chemical accuracy is mandatory." : ""}

Return JSON:
{
  "question_text": "...",
  "option_a": "...",
  "option_b": "...",
  "option_c": "...",
  "option_d": "...",
  "correct_answer": "A",
  "explanation": "Concise explanation (max 100 words) with NCERT reference if applicable",
  "concept_tested": "${subtopic} — specific concept name",
  "difficulty": "${difficulty}"
}`;

  return { system, user };
}

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
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body: GenerateRequest = await req.json();
    const {
      exam = "JEE_MAINS",
      subject,
      topic,
      subtopic,
      difficulty = "Medium",
      variant_of_question_id,
    } = body;

    // ── Fetch original question if variant ────────────────────
    let originalQuestion: any = null;
    if (variant_of_question_id) {
      const { data } = await (supabase as any)
        .from("questions_bank")
        .select("question_text, options, correct_option, explanation, topic, subtopic")
        .eq("id", variant_of_question_id)
        .maybeSingle();

      if (data) {
        originalQuestion = {
          question_text: data.question_text,
          option_a: data.options?.A,
          option_b: data.options?.B,
          option_c: data.options?.C,
          option_d: data.options?.D,
          correct_answer: data.correct_option,
        };
      }
    }

    // ── Build prompt ──────────────────────────────────────────
    const { system, user } = buildPrompt(body, originalQuestion);

    // ── Call Claude via Lovable Gateway ──────────────────────
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "anthropic/claude-sonnet-4-5",
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: variant_of_question_id ? 0.8 : 0.65,
        max_tokens: 1200,
      }),
    });

    if (!aiRes.ok) throw new Error(`AI gateway error: ${aiRes.status}`);

    const aiJson = await aiRes.json();
    const raw = aiJson.choices?.[0]?.message?.content ?? "";

    // ── Parse ─────────────────────────────────────────────────
    let parsed: any;
    try {
      let clean = raw.trim();
      const codeBlock = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (codeBlock) clean = codeBlock[1].trim();
      const objStart = clean.indexOf("{");
      const objEnd = clean.lastIndexOf("}");
      if (objStart !== -1 && objEnd !== -1) clean = clean.slice(objStart, objEnd + 1);
      parsed = JSON.parse(clean);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    // ── Map to question_bank schema & generate stable question_id ──
    const questionId = `${exam}_${subject.replace(/\s+/g, "")}_${Date.now()}`;
    const row = {
      question_id: questionId,
      exam,
      subject,
      topic,
      subtopic,
      ncert_chapter: topic,
      difficulty: parsed.difficulty || difficulty,
      question_type: "TYPE_A",
      exam_stage: "practice",
      question_text: parsed.question_text,
      options: {
        A: parsed.option_a,
        B: parsed.option_b,
        C: parsed.option_c,
        D: parsed.option_d,
      },
      correct_option: (parsed.correct_answer || "A").toUpperCase().charAt(0),
      explanation: {
        short: (parsed.explanation || "").slice(0, 120),
        detailed_steps: [parsed.explanation || ""],
        ncert_reference: `${subject} — ${topic}`,
      },
      tags: [exam, subject, topic, subtopic],
      quality_gate_passed: true,
      pyq_similar: false,
      is_verified: false,
      generation_model: "anthropic/claude-sonnet-4-5",
    };

    // ── Fire-and-forget DB insert (don't block response) ─────
    (supabase as any)
      .from("questions_bank")
      .insert(row)
      .then(({ error }: any) => {
        if (error) console.error("[generate-question] DB insert error:", error.message);
      });

    const genTime = Date.now() - startTime;

    return new Response(JSON.stringify({
      success: true,
      question: {
        ...row,
        // Flatten for easy frontend consumption
        question_id: questionId,
        option_a: parsed.option_a,
        option_b: parsed.option_b,
        option_c: parsed.option_c,
        option_d: parsed.option_d,
        correct_answer: row.correct_option,
        explanation_text: parsed.explanation,
        concept_tested: parsed.concept_tested || `${topic} — ${subtopic}`,
        is_variant: !!variant_of_question_id,
        parent_question_id: variant_of_question_id || null,
      },
      gen_time_ms: genTime,
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
