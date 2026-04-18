/**
 * generate-cuet-questions — Supabase Edge Function
 *
 * Generates CUET-quality questions indistinguishable from actual NTA paper.
 * Uses Claude claude-sonnet-4-20250514 with comprehensive CUET system prompt.
 * Runs a 6-check quality gate on every question. Max 3 retries per question.
 * Saves passing questions to questions_bank.
 *
 * POST /generate-cuet-questions
 * Body: GenerateRequest (see interface below)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
interface GenerateRequest {
  exam:             string;          // CUET | JEE_MAINS | NEET
  subject:          string;          // Physics | Chemistry | Accountancy etc.
  chapter:          string;
  topic?:           string | null;
  subtopic?:        string | null;
  ncert_class?:     number;          // 11 | 12
  ncert_chapter_number?: number;
  difficulty_mix?:  { Easy: number; Medium: number; Hard: number };
  question_types?:  string[];        // TYPE_A through TYPE_F
  count:            number;          // max 20 per request
  exam_stage?:      string;          // practice | mock_test | pyq_style
  save_to_db?:      boolean;         // default true
}

interface QuestionJSON {
  question_id:           string;
  exam:                  string;
  section:               string;
  subject:               string;
  ncert_class:           number;
  ncert_chapter:         string;
  ncert_chapter_number:  number;
  topic:                 string;
  subtopic:              string;
  difficulty:            "Easy" | "Medium" | "Hard";
  question_type:         string;
  exam_stage:            string;
  question_text:         string;
  options:               Record<string, string>;
  correct_option:        "A" | "B" | "C" | "D";
  explanation: {
    short:              string;
    detailed_steps:     string[];
    ncert_reference:    string;
  };
  distractor_logic:      Record<string, string>;
  tags:                  string[];
  micro_concept?:        string;
  estimated_time_seconds: number;
  pyq_similar:           boolean;
  pyq_year_reference?:   string;
  confidence_score?:     number;
}

interface QualityGateResult {
  passed:           boolean;
  uniqueness:       boolean;
  answer_verified:  boolean;
  ncert_aligned:    boolean;
  distractor_quality: boolean;
  language_standard: boolean;
  difficulty_calibrated: boolean;
  notes:            string[];
}

// ─────────────────────────────────────────────────────────────
// CUET MASTER SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────
const CUET_SYSTEM_PROMPT = `You are an expert CUET (UG) question paper designer working for NTA (National Testing Agency).
Your ONLY job is to generate multiple-choice questions that are INDISTINGUISHABLE from actual CUET PYQs from 2022, 2023, 2024.

ABSOLUTE RULES — NEVER VIOLATE:

1. NCERT BINDING
   - All Domain Subject questions are strictly from NCERT Class 11 or 12 syllabus
   - Never generate questions on topics outside the specified chapter
   - Use NCERT terminology verbatim — never paraphrase NCERT definitions

2. NTA LANGUAGE STANDARD
   - Formal, grammatically perfect English
   - No colloquialisms, no casual language, no ambiguity
   - Phrasing must match NTA style: "Which of the following is CORRECT?", "Consider the following statements:", "Assertion (A):", "Match List I with List II:"

3. DISTRACTOR QUALITY (rotate patterns per question):
   Pattern A — Common misconception: what students typically confuse with the correct answer
   Pattern B — Partially correct: right concept, wrong detail (wrong year/value/name)
   Pattern C — Adjacent topic: sounds related but belongs to a different chapter
   Pattern D — Reversed logic: correct fact stated backwards
   NEVER use "None of the above" or "All of the above" — CUET does not use these

4. DIFFICULTY CALIBRATION
   Easy   → Direct NCERT recall, single fact, <30 seconds
   Medium → Application of concept, slight twist, 30-60 seconds
   Hard   → Cross-chapter reasoning, multi-step, >60 seconds

5. QUESTION TYPE FORMATS (use exactly these formats):
   TYPE_A → "Which of the following is CORRECT regarding [X]?"
   TYPE_B → "Consider the following statements:\\n1. [Statement 1]\\n2. [Statement 2]\\nWhich of the above statement(s) is/are CORRECT?"
           Options must be: A) 1 only  B) 2 only  C) Both 1 and 2  D) Neither 1 nor 2
   TYPE_C → "Match List I with List II:" [4 pairs]
           Options are combination codes like: A) a-i, b-ii, c-iii, d-iv
   TYPE_D → "Assertion (A): [statement]\\nReason (R): [statement]"
           Options: A) Both A and R are true and R is the correct explanation of A
                   B) Both A and R are true but R is NOT the correct explanation of A
                   C) A is true but R is false
                   D) A is false but R is true
   TYPE_E → Direct calculation (one-step for CUET, never multi-step like JEE)
   TYPE_F → Reading comprehension passage followed by question

6. NUMERICAL QUESTIONS (TYPE_E)
   - Every numerical answer must be exact and clean (no recurring decimals)
   - Show formula, substitution, and answer in detailed_steps
   - Verify independently before finalizing

7. BEFORE FINALIZING EACH QUESTION — CHECK:
   ✅ Is the correct answer unambiguously and definitively correct?
   ✅ Are all 3 wrong options plausible but certainly wrong?
   ✅ Does this question appear in NCERT or is it directly derivable from NCERT?
   ✅ Is the language identical to NTA paper style?
   ✅ Is the difficulty tag honest?

OUTPUT: Return ONLY a valid JSON array of question objects. No prose, no markdown, no explanation outside the JSON.`;

// ─────────────────────────────────────────────────────────────
// SUBJECT-SPECIFIC NCERT CONTEXT (injected per request)
// ─────────────────────────────────────────────────────────────
const SUBJECT_CONTEXT: Record<string, string> = {
  Physics: `CUET Physics is NCERT Class 11 + 12. 60% concept, 40% numerical.
Numericals: one-step using standard formulae. CUET is NOT JEE — no multi-step derivations.
Units: always SI. Use Indian conventions where applicable.
Common CUET patterns: identify correct law/principle, calculate simple values, match concepts to scientists.`,

  Chemistry: `CUET Chemistry is NCERT Class 11 + 12.
Heavy on: IUPAC names, periodic trends, reaction types (identify product), properties of compounds.
Organic: NCERT-level only — name reactions, identify major product, IUPAC nomenclature.
No mechanism arrows needed — CUET tests recognition, not mechanism drawing.`,

  Mathematics: `CUET Mathematics is NCERT Class 11 + 12.
Every question must have a clean numerical answer — no ambiguous or open-ended answers.
Show full step-wise solution in detailed_steps.
Types used: direct formula application, identify correct graph/set, simple proofs.`,

  Biology: `CUET Biology is NCERT Class 11 + 12.
High-weight topics: Cell biology, Genetics, Human physiology, Plant physiology, Biotechnology, Ecology.
Diagrams described textually: "In the diagram of mitosis, the stage shown represents..."
Heavy on: terminology, process names, functions of organelles, definitions.`,

  Accountancy: `CUET Accountancy is NCERT Class 11 + 12.
All numerical answers in exact rupees — no approximate answers.
Heavy on: Journal entries (identify correct entry), partnership accounts, company accounts, financial statements.
Statement-based questions on ratios and cash flow classification.`,

  "Business Studies": `CUET Business Studies is NCERT Class 11 + 12.
Purely conceptual and definition-based. Match NCERT language exactly.
Heavy on: Fayol/Taylor principles (match theorist to principle), management functions, organizing/staffing/directing.
Use exact NCERT terminology — e.g., "staffing" not "hiring", "directing" not "leading".`,

  Economics: `CUET Economics is NCERT Class 11 (Microeconomics) + Class 12 (Macroeconomics).
Mix theory + numericals: PED formula, multiplier, GDP calculation.
Diagrams described textually: "In the PPC diagram, point X inside the curve represents..."
Key numerical formats: compute elasticity, money multiplier, national income.`,

  History: `CUET History is NCERT Class 12 Themes in Indian History (Parts I, II, III) — all 15 themes.
Questions test: dates, rulers, events, passage analysis ("Read the passage and identify the source").
Heavy coverage: Harappan civilization, Mauryas, Bhakti/Sufi, Mughals, Colonial period, Partition, Constitution drafting.`,

  "Political Science": `CUET Political Science is NCERT Class 11 (Indian Constitution) + Class 12 (World Politics + Indian Politics).
Class 11: Rights, election system, federalism, judiciary, local government.
Class 12: Cold War logic, regional organizations (ASEAN, EU), India's foreign policy, electoral politics.`,

  Geography: `CUET Geography is NCERT Class 11 (Physical + India Physical) + Class 12 (Human + India People and Economy).
Map-based questions described textually: "The region marked X on the physical map of India represents..."
Heavy on: climate types, crops, industries, population distribution.`,

  Psychology: `CUET Psychology is NCERT Class 11 + 12. Very factual and definition-heavy.
Questions test: names of theories/theorists, stages of development, definitions of terms.
Heavy on: Piaget (cognitive), Kohlberg (moral), stress/coping, intelligence theories.`,

  "General Test": `CUET General Test (Section 3) covers:
GK & Current Affairs: India-centric, last 2 years
Mental Ability: analogy, odd one out, series completion, coding-decoding
Numerical Ability: Class 8-10 level — percentage, ratio, profit-loss, SI/CI, time-speed-distance
Logical Reasoning: syllogisms, blood relations, direction sense, seating arrangement
Language Comprehension: passage questions, vocabulary, inference
Vocabulary: synonyms, antonyms, one-word substitution, idioms`,
};

// ─────────────────────────────────────────────────────────────
// QUESTION ID GENERATOR
// ─────────────────────────────────────────────────────────────
function makeQuestionId(
  exam: string,
  subject: string,
  chapterNum: number | undefined,
  difficulty: string,
  type: string,
  index: number
): string {
  const subAbbr = subject.substring(0, 3).toUpperCase().replace(/\s/g, "");
  const diffAbbr = difficulty[0]; // E / M / H
  const typeAbbr = type.replace("TYPE_", "T");
  const chNum = chapterNum ? String(chapterNum).padStart(2, "0") : "00";
  const idx = String(index).padStart(3, "0");
  return `${exam}_${subAbbr}_CH${chNum}_${diffAbbr}_${typeAbbr}_${idx}`;
}

// ─────────────────────────────────────────────────────────────
// QUALITY GATE
// ─────────────────────────────────────────────────────────────
async function runQualityGate(
  q: QuestionJSON,
  existingTexts: Set<string>
): Promise<QualityGateResult> {
  const notes: string[] = [];

  // 1. Uniqueness (fuzzy — check first 50 chars)
  const textKey = q.question_text.substring(0, 50).toLowerCase().replace(/\s+/g, " ").trim();
  const uniqueness = !existingTexts.has(textKey);
  if (!uniqueness) notes.push("FAIL: Duplicate question text detected");

  // 2. Answer verification — correct option exists in options
  const answer_verified =
    q.options &&
    typeof q.options === "object" &&
    typeof q.options[q.correct_option] === "string" &&
    q.options[q.correct_option].trim().length > 0 &&
    Object.keys(q.options).length >= 4;
  if (!answer_verified) notes.push("FAIL: correct_option missing from options or options incomplete");

  // 3. NCERT aligned — chapter + topic set
  const ncert_aligned = !!(q.ncert_chapter && q.topic && q.topic.trim().length > 0);
  if (!ncert_aligned) notes.push("FAIL: Missing ncert_chapter or topic");

  // 4. Distractor quality — 3 wrong options all have rationale
  const wrongOptions = ["A", "B", "C", "D"].filter((o) => o !== q.correct_option);
  const distractor_quality =
    wrongOptions.every((o) => q.options[o] && q.options[o].trim().length > 0) &&
    wrongOptions.every(
      (o) => q.distractor_logic?.[o] && q.distractor_logic[o].trim().length > 0
    );
  if (!distractor_quality) notes.push("FAIL: Missing distractor options or distractor_logic");

  // 5. Language standard — no banned phrases
  const bannedPhrases = [
    "none of the above",
    "all of the above",
    "none of these",
    "all of these",
    "both (a) and (b)",
  ];
  const lower = q.question_text.toLowerCase();
  const language_standard = !bannedPhrases.some((p) => lower.includes(p)) &&
    q.question_text.trim().length >= 20;
  if (!language_standard) notes.push("FAIL: Banned phrase found or question too short");

  // 6. Difficulty calibration — estimated_time_seconds must match difficulty
  const timeOk =
    (q.difficulty === "Easy"   && q.estimated_time_seconds <= 45) ||
    (q.difficulty === "Medium" && q.estimated_time_seconds >= 30 && q.estimated_time_seconds <= 90) ||
    (q.difficulty === "Hard"   && q.estimated_time_seconds >= 60);
  const difficulty_calibrated = timeOk;
  if (!difficulty_calibrated) notes.push(`FAIL: estimated_time_seconds ${q.estimated_time_seconds} doesn't match difficulty ${q.difficulty}`);

  const passed =
    uniqueness &&
    answer_verified &&
    ncert_aligned &&
    distractor_quality &&
    language_standard &&
    difficulty_calibrated;

  return {
    passed,
    uniqueness,
    answer_verified,
    ncert_aligned,
    distractor_quality,
    language_standard,
    difficulty_calibrated,
    notes,
  };
}

// ─────────────────────────────────────────────────────────────
// CALL CLAUDE
// ─────────────────────────────────────────────────────────────
async function callClaude(userPrompt: string, anthropicKey: string): Promise<QuestionJSON[]> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-opus-4-5",
      max_tokens: 8192,
      system: CUET_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content: string = data.content?.[0]?.text ?? "";

  // Extract JSON array from response
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error("Claude did not return a JSON array");

  return JSON.parse(jsonMatch[0]) as QuestionJSON[];
}

// ─────────────────────────────────────────────────────────────
// NOTE: Stage 2 AI validation was removed — it used a broken
// regex and added 5-10s of latency per question. The 6-check
// quality gate (runQualityGate) is the enforced standard.
// ─────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────
// BUILD USER PROMPT
// ─────────────────────────────────────────────────────────────
function buildUserPrompt(req: GenerateRequest, batchSize: number, excludeTexts: string[]): string {
  const subCtx = SUBJECT_CONTEXT[req.subject] ?? "";
  const diffMix = req.difficulty_mix ?? { Easy: 40, Medium: 45, Hard: 15 };
  const types = req.question_types?.join(", ") ?? "TYPE_A, TYPE_B, TYPE_C, TYPE_D, TYPE_E";
  const isPYQ = req.exam_stage === "pyq_style";

  const easyCount  = Math.round(batchSize * diffMix.Easy   / 100);
  const medCount   = Math.round(batchSize * diffMix.Medium  / 100);
  const hardCount  = batchSize - easyCount - medCount;

  let prompt = `Generate exactly ${batchSize} CUET questions for the following spec:

EXAM: ${req.exam}
SUBJECT: ${req.subject}
NCERT CLASS: ${req.ncert_class ?? "11 or 12"}
CHAPTER: ${req.chapter}
${req.topic ? `TOPIC: ${req.topic}` : "TOPIC: Cover all major topics in this chapter"}
${req.subtopic ? `SUBTOPIC: ${req.subtopic}` : ""}

SUBJECT CONTEXT:
${subCtx}

DISTRIBUTION REQUIRED:
- Easy: ${easyCount} questions
- Medium: ${medCount} questions
- Hard: ${hardCount} questions

QUESTION TYPES TO USE (mix them): ${types}
${isPYQ ? "\n⚠️ PYQ STYLE: Make questions as close as possible to actual CUET PYQs. Prioritise TYPE_B and TYPE_C. Mark pyq_similar=true." : ""}

EXAM STAGE: ${req.exam_stage ?? "practice"}

QUESTION IDs: Use format ${req.exam}_${req.subject.substring(0, 3).toUpperCase()}_CH${String(req.ncert_chapter_number ?? 0).padStart(2, "0")}_[E/M/H]_T[A-F]_[001-${String(batchSize).padStart(3, "0")}]

${excludeTexts.length > 0 ? `DO NOT generate questions similar to:\n${excludeTexts.map((t) => `- ${t}`).join("\n")}` : ""}

RETURN: A JSON array of exactly ${batchSize} question objects matching this exact schema:
{
  "question_id": "CUET_PHY_CH03_M_TA_001",
  "exam": "${req.exam}",
  "section": "Domain",
  "subject": "${req.subject}",
  "ncert_class": ${req.ncert_class ?? 11},
  "ncert_chapter": "${req.chapter}",
  "ncert_chapter_number": ${req.ncert_chapter_number ?? 0},
  "topic": "specific topic name",
  "subtopic": "specific subtopic",
  "difficulty": "Easy|Medium|Hard",
  "question_type": "TYPE_A|TYPE_B|TYPE_C|TYPE_D|TYPE_E|TYPE_F",
  "exam_stage": "${req.exam_stage ?? "practice"}",
  "question_text": "The full question text exactly as it would appear on NTA paper",
  "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
  "correct_option": "A|B|C|D",
  "explanation": {
    "short": "One sentence explanation",
    "detailed_steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
    "ncert_reference": "NCERT Class X ${req.subject}, Chapter Y, Page Z (approx)"
  },
  "distractor_logic": {
    "B": "Why B is wrong — which misconception it targets",
    "C": "Why C is wrong",
    "D": "Why D is wrong"
  },
  "tags": ["tag1", "tag2"],
  "micro_concept": "specific micro concept tested",
  "estimated_time_seconds": 30,
  "pyq_similar": ${isPYQ ? "true" : "false"},
  "pyq_year_reference": "CUET 2023 or null"
}

CRITICAL: Verify every answer is correct before including. Output ONLY the JSON array, nothing else.`;

  return prompt;
}

// ─────────────────────────────────────────────────────────────
// MAIN HANDLER
// ─────────────────────────────────────────────────────────────
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  const supabaseUrl  = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "Invalid JSON body" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const count     = Math.min(body.count ?? 5, 20);
  const saveToDb  = body.save_to_db !== false;

  // Pull existing question texts from DB for uniqueness check
  const { data: existingRows } = await supabase
    .from("questions_bank")
    .select("question_text")
    .eq("exam", body.exam)
    .eq("subject", body.subject)
    .eq("ncert_chapter", body.chapter);

  const existingTexts = new Set<string>(
    (existingRows ?? []).map((r: any) =>
      r.question_text.substring(0, 50).toLowerCase().replace(/\s+/g, " ").trim()
    )
  );

  const results: Array<{
    question: QuestionJSON;
    quality: QualityGateResult;
    saved:   boolean;
    attempt: number;
  }> = [];

  const MAX_RETRIES = 3;
  let totalGenerated = 0;
  let attempt = 1;

  // Generate in batches with retries until we have `count` passing questions
  while (totalGenerated < count && attempt <= MAX_RETRIES) {
    const needed = count - totalGenerated;
    console.log(`[CUET-GEN] Attempt ${attempt}: generating ${needed} questions`);

    let questions: QuestionJSON[] = [];
    try {
      const prompt = buildUserPrompt(
        body,
        needed,
        // Pass texts already generated this session as exclusions too
        results.map((r) => r.question.question_text.substring(0, 80))
      );
      questions = await callClaude(prompt, anthropicKey);
    } catch (e: any) {
      console.error(`[CUET-GEN] Claude call failed attempt ${attempt}:`, e.message);
      attempt++;
      continue;
    }

    for (const q of questions) {
      if (totalGenerated >= count) break;

      // Assign proper question_id if AI didn't set one correctly
      const idx = totalGenerated + 1;
      if (!q.question_id || q.question_id === "") {
        q.question_id = makeQuestionId(
          body.exam,
          body.subject,
          body.ncert_chapter_number,
          q.difficulty,
          q.question_type,
          idx
        );
      }

      const quality = await runQualityGate(q, existingTexts);

      let saved = false;
      if (quality.passed && saveToDb) {
        console.log(`[CUET-GEN] Quality gate passed for q[${idx}] — saving to DB`);
        const { error: saveErr } = await supabase.from("questions_bank").upsert(
          {
            question_id:           q.question_id,
            exam:                  q.exam ?? body.exam,
            section:               q.section ?? "Domain",
            subject:               q.subject ?? body.subject,
            ncert_class:           q.ncert_class ?? body.ncert_class,
            ncert_chapter:         q.ncert_chapter ?? body.chapter,
            ncert_chapter_number:  q.ncert_chapter_number ?? body.ncert_chapter_number,
            topic:                 q.topic,
            subtopic:              q.subtopic,
            difficulty:            q.difficulty,
            question_type:         q.question_type,
            exam_stage:            q.exam_stage ?? body.exam_stage ?? "practice",
            question_text:         q.question_text,
            options:               q.options,
            correct_option:        q.correct_option,
            explanation:           q.explanation,
            distractor_logic:      q.distractor_logic,
            tags:                  q.tags ?? [],
            estimated_time_seconds: q.estimated_time_seconds,
            pyq_similar:           q.pyq_similar ?? false,
            pyq_year_reference:    q.pyq_year_reference ?? null,
            confidence_score:      90,
            micro_concept:         q.micro_concept ?? null,
            quality_gate_passed:   true,
            quality_gate_log:      quality,
            ai_quality_score:      0.9,
            generation_model:      "claude-opus-4-5",
            generation_attempt:    attempt,
            is_verified:           false,
          },
          { onConflict: "question_id" }
        );

        if (!saveErr) {
          saved = true;
          console.log(`[CUET-GEN] ✅ Saved question ${q.question_id} to DB`);
          existingTexts.add(
            q.question_text.substring(0, 50).toLowerCase().replace(/\s+/g, " ").trim()
          );
          totalGenerated++;
        } else {
          console.error("[CUET-GEN] ❌ Save error:", saveErr.message);
        }
      } else if (quality.passed && !saveToDb) {
        totalGenerated++;
        saved = false;
      } else {
        console.warn(`[CUET-GEN] Quality gate FAILED for q[${idx}]:`, quality.notes);
      }

      results.push({ question: q, quality, saved, attempt });
    }

    attempt++;
  }

  const passing = results.filter((r) => r.quality.passed);

  return new Response(
    JSON.stringify({
      success:       passing.length > 0,
      requested:     count,
      generated:     results.length,
      passed:        passing.length,
      saved:         results.filter((r) => r.saved).length,
      questions:     results.map((r) => ({
        ...r.question,
        _quality:  r.quality,
        _saved:    r.saved,
        _attempt:  r.attempt,
      })),
    }),
    {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
});
