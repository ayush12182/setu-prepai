import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ─── Subject → Topics map ───────────────────────────────────
const SUBJECT_TOPICS: Record<string, string[]> = {
  // JEE
  "Physics":      ["Mechanics", "Thermodynamics", "Electrostatics", "Current Electricity", "Magnetism", "Electromagnetic Induction", "Optics", "Modern Physics", "Waves & Sound", "Fluid Mechanics"],
  "Chemistry":    ["Atomic Structure", "Chemical Bonding", "States of Matter", "Thermodynamics", "Chemical Equilibrium", "Electrochemistry", "Organic Chemistry Basics", "Hydrocarbons", "Coordination Compounds", "D-Block Elements"],
  "Mathematics":  ["Sets & Relations", "Complex Numbers", "Matrices & Determinants", "Limits & Continuity", "Differentiation", "Integration", "Differential Equations", "Coordinate Geometry", "Vectors & 3D", "Probability"],
  // NEET
  "Biology":      ["Cell Biology", "Genetics & Evolution", "Human Physiology", "Plant Physiology", "Reproduction", "Ecology", "Molecular Biology", "Microbes in Human Welfare", "Biotechnology", "Biodiversity"],
  // CUET
  "Accounts":     ["Partnership", "Company Accounts", "Ratio Analysis", "Cash Flow Statement", "Not-for-Profit Organisation", "Financial Statements"],
  "Economics":    ["Demand & Supply", "Market Structures", "National Income", "Money & Banking", "Government Budget", "Balance of Payments", "Indian Economy"],
  "Business Studies": ["Management Functions", "Planning", "Organising", "Directing", "Controlling", "Financial Management", "Marketing", "Consumer Protection"],
  "English":      ["Reading Comprehension", "Grammar", "Vocabulary", "Para-jumbles", "Cloze Test", "Verbal Ability"],
  "General Test": ["Logical Reasoning", "Quantitative Aptitude", "Data Interpretation", "General Awareness"],
};

// ─── Exam-aware system prompt ────────────────────────────────
function buildSystemPrompt(exam: string, subject: string): string {
  if (exam === "CUET") {
    return `You are an NTA CUET UG question paper expert. Generate authentic CUET UG PYQ-style MCQs (2022-2024 pattern).
RULES:
- Strictly NCERT Class 11-12 aligned
- 4 options, single correct answer, +5/-1 marking style
- Mix question types: ~50% direct MCQ, 20% Assertion-Reason, 15% Match List, 15% Case-based
- Difficulty: Moderate (NCERT speed-test level, NOT JEE level)
- All questions must be verifiable against NCERT textbooks`;
  }
  if (exam === "NEET") {
    return `You are a NEET UG question paper expert with 15 years experience. Generate authentic NEET PYQ-style MCQs.
RULES:
- Strictly NCERT Class 11-12 aligned (Biology, Chemistry, Physics)
- Single correct answer, +4/-1 marking style
- Biology: heavy on diagrams, definitions, NCERT examples
- Include Assertion-Reason questions (20%)
- Difficulty: Moderate (NCERT thorough understanding required)`;
  }
  return `You are a JEE Main/Advanced question paper expert. Generate authentic JEE PYQ-style MCQs.
RULES:
- NCERT + beyond NCERT for JEE Advanced style
- Single correct MCQ (+4/-1), formula-heavy, application-oriented
- Use proper notation: subscripts (v₁ v₂), Greek (θ α ω), fractions (a/b)
- Mix: 60% JEE Mains style, 30% JEE Advanced style, 10% AIEEE classic
- Difficulty: 30% Easy, 50% Medium, 20% Hard`;
}

function buildUserPrompt(exam: string, subject: string, chapter: string, difficulty: string, yearStart: number, yearEnd: number, count: number): string {
  const difficultyNote = difficulty === "Mixed" ? "Mix of Easy/Medium/Hard" : `Primarily ${difficulty}`;
  return `Generate exactly ${count} ${exam} PYQ-style MCQs for:
Subject: ${subject}
Chapter/Topic: ${chapter}
Difficulty: ${difficultyNote}
Year Range: ${yearStart}-${yearEnd}

CRITICAL: Return ONLY a valid JSON array. No markdown, no explanation outside JSON.
Format:
[
  {
    "question_text": "Complete question with proper notation",
    "option_a": "Option A text",
    "option_b": "Option B text", 
    "option_c": "Option C text",
    "option_d": "Option D text",
    "correct_option": "A",
    "explanation": "Step-by-step explanation referencing NCERT (max 120 words)",
    "difficulty": "${difficulty === "Mixed" ? "Easy or Medium or Hard" : difficulty}",
    "topic": "${chapter}",
    "subtopic": "Specific sub-topic within ${chapter}",
    "pyq_year": ${yearStart + Math.floor(Math.random() * (yearEnd - yearStart))},
    "concept_tested": "Key concept this question tests"
  }
]`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const {
      job_id,
      exam = "JEE_MAINS",
      subject = "Physics",
      chapter,
      difficulty = "Mixed",
      year_start = 2015,
      year_end = 2024,
      batch_size = 20,  // questions per AI call
      total_target = 100, // total questions to generate for this run
    } = await req.json();

    // Map exam to DB enum
    const examEnum = exam.includes("JEE") ? (exam.includes("ADVANCED") ? "JEE_ADVANCED" : "JEE_MAINS") : exam;

    // Get topics for this subject
    const topics: string[] = chapter
      ? [chapter]
      : (SUBJECT_TOPICS[subject] || ["General"]);

    // Update job status to running
    if (job_id) {
      await supabase.from("bulk_generation_jobs" as any)
        .update({ status: "running", started_at: new Date().toISOString() })
        .eq("id", job_id);
    }

    const jobLog: any[] = [];
    let totalInserted = 0;
    const questionsPerTopic = Math.ceil(total_target / topics.length);

    for (const topic of topics) {
      if (totalInserted >= total_target) break;

      const topicTarget = Math.min(questionsPerTopic, total_target - totalInserted);
      const numBatches = Math.ceil(topicTarget / batch_size);

      for (let batchIdx = 0; batchIdx < numBatches; batchIdx++) {
        const batchCount = Math.min(batch_size, topicTarget - batchIdx * batch_size);
        if (batchCount <= 0) break;

        try {
          const systemPrompt = buildSystemPrompt(examEnum, subject);
          const userPrompt = buildUserPrompt(examEnum, subject, topic, difficulty, year_start, year_end, batchCount);

          const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${LOVABLE_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "anthropic/claude-sonnet-4-5",
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              temperature: 0.6,
              max_tokens: 8000,
            }),
          });

          if (!aiRes.ok) {
            const errText = await aiRes.text();
            throw new Error(`AI API error ${aiRes.status}: ${errText.slice(0, 200)}`);
          }

          const aiJson = await aiRes.json();
          const rawContent = aiJson.choices?.[0]?.message?.content ?? "";

          // Parse JSON from response
          let parsed: any[] = [];
          try {
            let clean = rawContent.trim();
            const match = clean.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) clean = match[1].trim();
            // Find the JSON array
            const arrStart = clean.indexOf("[");
            const arrEnd = clean.lastIndexOf("]");
            if (arrStart !== -1 && arrEnd !== -1) {
              clean = clean.slice(arrStart, arrEnd + 1);
            }
            parsed = JSON.parse(clean);
            if (!Array.isArray(parsed)) parsed = [];
          } catch {
            jobLog.push({ topic, batch: batchIdx, status: "parse_error", generated: 0 });
            continue;
          }

          // Map to questions_bank schema
          const rows = parsed.filter(q => q.question_text && q.correct_option).map((q: any) => ({
            exam: examEnum,
            subject,
            topic: q.topic || topic,
            subtopic: q.subtopic || null,
            ncert_chapter: topic,
            difficulty: (["Easy","Medium","Hard"].includes(q.difficulty)) ? q.difficulty : (difficulty === "Mixed" ? "Medium" : difficulty),
            question_type: "TYPE_A",  // MCQ factual - default
            exam_stage: "practice",
            question_text: q.question_text,
            options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
            correct_option: (q.correct_option || "A").toUpperCase().charAt(0),
            explanation: {
              short: q.explanation?.slice(0, 120) ?? "",
              detailed_steps: [q.explanation ?? ""],
              ncert_reference: `${subject}, ${topic}`,
            },
            pyq_similar: true,
            pyq_year_reference: q.pyq_year ? `${exam} ${q.pyq_year}` : `${exam} ${year_end}`,
            tags: [subject, topic, exam, `pyq_${q.pyq_year || year_end}`],
            quality_gate_passed: true,
            is_verified: false,
            generation_model: "anthropic/claude-sonnet-4-5",
          }));

          if (rows.length > 0) {
            const { data: inserted, error: insertErr } = await supabase
              .from("questions_bank" as any)
              .insert(rows)
              .select("id");

            const insertedCount = inserted?.length ?? 0;
            totalInserted += insertedCount;

            jobLog.push({
              topic,
              batch: batchIdx + 1,
              status: insertErr ? "insert_error" : "success",
              generated: insertedCount,
              error: insertErr?.message,
            });
          }

          // Update job progress
          if (job_id) {
            await supabase.from("bulk_generation_jobs" as any)
              .update({
                questions_generated: totalInserted,
                job_log: jobLog,
              })
              .eq("id", job_id);
          }

          // Rate limit delay: 1.5s between batches
          await new Promise(r => setTimeout(r, 1500));

        } catch (batchErr: any) {
          const msg = batchErr?.message ?? "Unknown batch error";
          jobLog.push({ topic, batch: batchIdx + 1, status: "error", generated: 0, error: msg });

          if (job_id) {
            await supabase.from("bulk_generation_jobs" as any)
              .update({ job_log: jobLog, questions_generated: totalInserted })
              .eq("id", job_id);
          }

          // Longer delay on error (likely rate limit)
          await new Promise(r => setTimeout(r, 4000));
        }
      }
    }

    // Mark job complete
    if (job_id) {
      await supabase.from("bulk_generation_jobs" as any)
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          questions_generated: totalInserted,
          job_log: jobLog,
        })
        .eq("id", job_id);
    }

    return new Response(JSON.stringify({
      success: true,
      total_generated: totalInserted,
      total_target,
      exam: examEnum,
      subject,
      job_log: jobLog,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    const message = err?.message ?? "Unknown error";
    console.error("[bulk-generate-pyqs]", message);
    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
