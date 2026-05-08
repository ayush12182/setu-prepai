import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * bulk-seed-questions
 * ───────────────────
 * Reads topics from exam_curriculum, generates MCQs via Gemini directly,
 * and bulk-inserts into questions_bank. Skips topics that already have questions.
 *
 * POST body:
 * {
 *   exam: "JEE_MAINS" | "NEET" | "CUET",
 *   subject?: string,                            // optional filter
 *   questions_per_topic?: number,                // default 5
 *   difficulty_distribution?: { easy, medium, hard },
 *   max_topics?: number,                         // safety cap, default 20
 *   dry_run?: boolean                            // default false
 * }
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SeedRequest {
  exam: string;
  subject?: string;
  questions_per_topic?: number;
  difficulty_distribution?: { easy?: number; medium?: number; hard?: number };
  max_topics?: number;
  dry_run?: boolean;
}

// ─── Expert prompt (same as generate-question) ───────────────────────────────
function buildPrompt(
  exam: string,
  subject: string,
  topic: string,
  subtopic: string,
  count: number,
  dist: { easy?: number; medium?: number; hard?: number }
): string {
  const examLabel = exam === "JEE_MAINS" ? "JEE" : exam === "JEE_ADVANCED" ? "JEE" : exam;

  const parts: string[] = [];
  if (dist.easy) parts.push(`${dist.easy} easy`);
  if (dist.medium) parts.push(`${dist.medium} medium`);
  if (dist.hard) parts.push(`${dist.hard} hard`);
  const difficultyLine = parts.length > 0
    ? `Difficulty distribution: ${parts.join(", ")}.`
    : `All ${count} questions at medium difficulty.`;

  return `You are an expert assessment designer for competitive exams in India including JEE Main, NEET, and CUET.

Generate high-quality MCQs aligned with the Indian syllabus.

STRICT REQUIREMENTS:
1. Conceptually correct, unambiguous, exam-relevant.
2. Follow ${examLabel} patterns — not trivial or overly theoretical.
3. Return ONLY a valid JSON array — no markdown, no extra text.

Each question schema:
{
  "question_text": "...",
  "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
  "correct_answer": "A",
  "difficulty": "easy|medium|hard",
  "explanation": "step-by-step explanation with formula/NCERT reference",
  "tags": ["concept1", "concept2"],
  "quality_score": 0.9,
  "estimated_time_seconds": 60
}

Difficulty rules:
- easy: direct formula recall, 30–45s
- medium: 1–2 step application, 60–90s
- hard: multi-step JEE/NEET level, 2–3 min

Options: exactly 4, only 1 correct, all plausible (no obvious distractors).
${examLabel === "NEET" ? "NEET: strictly NCERT Class 11-12, biological/chemical accuracy mandatory." : ""}
${examLabel === "JEE" ? "JEE: use proper notation (subscripts, Greek letters). Advanced multi-step problems allowed." : ""}
${examLabel === "CUET" ? "CUET: NCERT-only, 30–90s questions, straightforward application." : ""}

Generate exactly ${count} questions for:
Exam: ${examLabel}
Subject: ${subject}
Topic: ${topic}
Subtopic: ${subtopic}
${difficultyLine}

Return ONLY a JSON array of ${count} objects.`;
}

// ─── Map AI output → DB row ───────────────────────────────────────────────────
function mapRow(q: any, exam: string, subject: string, topic: string, subtopic: string) {
  const examNorm = exam === "JEE_MAINS" ? "JEE" : exam === "JEE_ADVANCED" ? "JEE" : exam;
  const diff = (q.difficulty || "medium").toLowerCase();
  const diffFormatted = diff.charAt(0).toUpperCase() + diff.slice(1);
  const timeMap: Record<string, number> = { easy: 45, medium: 75, hard: 150 };

  return {
    question_id: `${examNorm}_${subject.replace(/\s+/g, "")}_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
    exam: examNorm,
    subject,
    topic,
    subtopic,
    ncert_chapter: topic,
    difficulty: diffFormatted,
    question_type: "TYPE_A",
    exam_stage: "practice",
    question_text: q.question_text,
    options: q.options,
    correct_option: (q.correct_answer || "A").toUpperCase().charAt(0),
    explanation: {
      short: (q.explanation || "").slice(0, 150),
      detailed_steps: [q.explanation || ""],
      ncert_reference: `${subject} — ${topic}`,
    },
    tags: q.tags || [exam, subject, topic, subtopic],
    ai_quality_score: q.quality_score || 0.9,
    quality_gate_passed: (q.quality_score || 0.9) >= 0.7,
    pyq_similar: false,
    is_verified: false,
    generation_model: "gemini-2.5-flash",
    estimated_time_seconds: q.estimated_time_seconds || timeMap[diff] || 75,
    micro_concept: subtopic,
  };
}

// ─── Call Gemini ──────────────────────────────────────────────────────────────
async function callGemini(apiKey: string, prompt: string): Promise<any[]> {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.70,
          response_mime_type: "application/json",
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = await res.json();
  const raw = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  let parsed: any;
  try {
    parsed = JSON.parse(raw.trim());
  } catch {
    throw new Error(`JSON parse failed. Raw: ${raw.slice(0, 200)}`);
  }

  return Array.isArray(parsed) ? parsed : [parsed];
}

// ─── Main handler ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const startTime = Date.now();

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const body: SeedRequest = await req.json();
    const {
      exam = "JEE_MAINS",
      subject,
      questions_per_topic = 5,
      difficulty_distribution = { easy: 2, medium: 2, hard: 1 },
      max_topics = 20,
      dry_run = false,
    } = body;

    // ── 1. Fetch curriculum topics ──────────────────────────────────────────
    let query = (supabase as any)
      .from("exam_curriculum")
      .select("id, exam, subject, topic, subtopic")
      .eq("exam", exam)
      .limit(max_topics);

    if (subject) query = query.eq("subject", subject);

    const { data: curriculum, error: currErr } = await query;
    if (currErr) throw new Error(`Curriculum fetch failed: ${currErr.message}`);
    if (!curriculum || curriculum.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: "No curriculum topics found",
        filters: { exam, subject },
      }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`[bulk-seed] ${curriculum.length} topics for ${exam}/${subject || "all"}`);

    // ── 2. Skip topics that already have questions ──────────────────────────
    const examNorm = exam === "JEE_MAINS" ? "JEE" : exam === "JEE_ADVANCED" ? "JEE" : exam;
    const { data: existing } = await (supabase as any)
      .from("questions_bank")
      .select("subtopic")
      .eq("exam", examNorm);

    const existingSubtopics = new Set<string>(
      (existing || []).map((q: any) => q.subtopic)
    );

    const toSeed = curriculum.filter((c: any) => !existingSubtopics.has(c.subtopic));
    const skipped = curriculum.length - toSeed.length;

    console.log(`[bulk-seed] ${toSeed.length} to seed, ${skipped} already exist`);

    if (toSeed.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "All topics already seeded",
        total_questions_generated: 0,
        topics_skipped: skipped,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── 3. Generate & insert per topic ─────────────────────────────────────
    const results: any[] = [];
    const errors: any[] = [];
    let totalGenerated = 0;

    for (const node of toSeed) {
      try {
        console.log(`[bulk-seed] ${node.subject} > ${node.topic} > ${node.subtopic}`);

        if (dry_run) {
          results.push({ subtopic: node.subtopic, dry_run: true });
          continue;
        }

        const prompt = buildPrompt(
          node.exam,
          node.subject,
          node.topic,
          node.subtopic,
          questions_per_topic,
          difficulty_distribution
        );

        const questions = await callGemini(GEMINI_API_KEY, prompt);
        const rows = questions.slice(0, questions_per_topic).map((q) =>
          mapRow(q, node.exam, node.subject, node.topic, node.subtopic)
        );

        const { error: insertErr } = await (supabase as any)
          .from("questions_bank")
          .insert(rows);

        if (insertErr) throw new Error(`DB insert: ${insertErr.message}`);

        totalGenerated += rows.length;
        results.push({ subtopic: node.subtopic, generated: rows.length });
        console.log(`[bulk-seed] ✓ ${node.subtopic}: ${rows.length} questions saved`);

        // Respect Gemini rate limits
        await new Promise((r) => setTimeout(r, 400));

      } catch (err: any) {
        console.error(`[bulk-seed] ✗ ${node.subtopic}: ${err.message}`);
        errors.push({ subtopic: node.subtopic, error: err.message });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      exam,
      subject: subject || "all",
      topics_processed: toSeed.length,
      topics_skipped: skipped,
      total_questions_generated: totalGenerated,
      per_topic_results: results,
      errors,
      dry_run,
      elapsed_ms: Date.now() - startTime,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("[bulk-seed-questions]", err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
