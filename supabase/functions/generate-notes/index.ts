/**
 * generate-notes — Supabase Edge Function
 *
 * Structured 9-section notes system:
 * Coaching / Tuition / Hybrid × Hindi / English / Hinglish
 * ENGINE: Gemini 1.5 Flash (streaming SSE)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SmartMode = "default" | "beginner" | "advanced" | "formulas_only" | "mistakes_only" | "revision";
type NoteMode = "coaching" | "tuition" | "hybrid";
type Language = "english" | "hindi" | "hinglish";

// Map frontend SmartMode → internal NoteMode
function resolveNoteMode(smartMode: SmartMode): NoteMode {
  if (smartMode === "beginner") return "tuition";
  if (smartMode === "advanced") return "coaching";
  return "hybrid"; // default, formulas_only, mistakes_only, revision all use hybrid base
}

function resolveLanguage(lang: string): Language {
  const l = lang?.toLowerCase();
  if (l === "hindi") return "hindi";
  if (l === "hinglish") return "hinglish";
  return "english";
}

function buildLanguageInstruction(lang: Language): string {
  // Enforcing pure English as per JEE textbook standard
  return `LANGUAGE RULES:
- Use pure, professional English ONLY.
- Zero Hinglish or Hindi words in explanations, solutions, or tips.
- All math MUST be written in LaTeX. Wrap inline math in $...$ (e.g., $v = u + at$) and display math in $$...$$. No plain text math.
- Tone: Professional, clean, Kota-textbook style.`;
}

function buildModeInstruction(mode: NoteMode, lang: Language): string {
  return `You are generating chapter notes for JEE Mains & Advanced preparation. Your explanations must be physically intuitive, not just mathematically dry, but highly precise.`;
}

function buildFullStructurePrompt(
  chapterName: string,
  subject: string,
  topics: string[],
  examMode: string,
  mode: NoteMode,
  lang: Language,
  smartMode: SmartMode,
): string {
  const langInstruction = buildLanguageInstruction(lang);
  const modeInstruction = buildModeInstruction(mode, lang);
  const topicList = topics.length > 0 ? topics.join(", ") : chapterName;
  const exam = examMode.toUpperCase().includes("NEET") ? "NEET" : examMode.toUpperCase().includes("CUET") ? "CUET" : "JEE";

  // Special cases for quick modes
  if (smartMode === "formulas_only") {
    return `${modeInstruction}

${langInstruction}

Generate a FORMULAS-ONLY reference sheet for "${chapterName}" (${subject}) for ${exam}.

Structure:
# 🧮 Formula Bank: ${chapterName}

## Core Formulas
(List every important formula with: name, LaTeX expression, variables defined, conditions of use, and when NOT to use it)

## Derived Formulas
(Less obvious but exam-important derivations)

## Quick Reference Table
| Formula | Use Case | Condition |
|---|---|---|

## ⚡ Formula Tricks
(Time-saving patterns and special cases)

Topics covered: ${topicList}
Exam: ${exam} — prioritize formulas that appear in PYQs.`;
  }

  if (smartMode === "mistakes_only") {
    return `${modeInstruction}

${langInstruction}

Generate a COMMON MISTAKES & TRAPS sheet for "${chapterName}" (${subject}) for ${exam}.

Structure:
# ⚠️ Common Mistakes: ${chapterName}

## Conceptual Traps
(Misconceptions students carry into exams)

## Formula Misuse
(When students apply the wrong formula and why)

## Calculation Pitfalls
(Sign errors, unit mistakes, wrong substitutions)

## ${exam} Specific Traps
(Tricks the paper-setter uses to fool students)

## How to Avoid Each Mistake
(Specific, actionable fixes for each mistake listed above)

Topics: ${topicList}`;
  }

  if (smartMode === "revision") {
    return `${modeInstruction}

${langInstruction}

Generate a RAPID 1-MINUTE REVISION SHEET for "${chapterName}" (${subject}) for ${exam}.
Make it ultra-compact. A student should be able to scan this in 60 seconds before exam.

Structure:
# ⚡ 1-Min Revision: ${chapterName}

## Core Idea (1 line)
## Key Formulas (bullet points, no explanation)
## Top 3 Concepts to Remember
## 3 Most Common Mistakes
## ${exam} PYQ Hotspots
## Last-minute Tips

Topics: ${topicList}
Keep it VERY short — this is a flash card, not a textbook.`;
  }

  // Full structured notes (default / beginner / advanced / hybrid)
  return `${modeInstruction}

${langInstruction}

Generate comprehensive, high-quality study notes for "${chapterName}" (Subject: ${subject}) for ${exam}.
Topics to cover: ${topicList}

Follow this EXACT structure with all sections. Do not skip any section.

---

# ${chapterName}

---

## 🔍 1. Intuition First
- Give a real-life analogy or visual that makes this topic instantly click.
- Explain the "WHY" before any formula.

---

## 📖 2. Concepts & Formulas
For every major concept in this chapter, provide:

### Concept: [Name of Concept]
FORMULA BOX (at top of each concept):
- List all key formulas in LaTeX, boxed and labeled.
- Include conditions/constraints for each formula.
- Example: $$\\boxed{v^2 = u^2 + 2as} \\quad \\text{(only for constant acceleration)}$$

CONCEPT EXPLANATION:
- 3-4 lines maximum.
- Explain the physical intuition, not just the math.
- Use precise JEE language.

*(Repeat this Concept structure for all major topics)*

---

## ⚡ 3. Shortcuts & Tricks
- Time-saving methods that save 30-60 seconds per question
- Pattern recognition tips for ${exam} questions
- "If you see X in a question, immediately think Y" type rules

---

## ⚠️ 4. Common Mistakes
List at least 3 specific mistakes students make:
- The mistake (what students do wrong)
- Why it's wrong
- The correct approach

---

## 🧠 5. Solved Examples

Generate exactly 3 solved examples corresponding to the 3 difficulty levels below. 

### Level 1 — Easy (Direct Formula)
(Single concept, direct substitution problem)
**Given:** (list all knowns in LaTeX)
**To find:** (state the unknown in LaTeX)
**Concept:** (name the principle)
**Solution:** (full step-by-step with LaTeX at every step, starting each line with "Step X:")
**Answer:** (boxed final answer in LaTeX, e.g. $$\\boxed{\\vec{v} = 40\\hat{i} + 10\\hat{j} \\text{ m/s}}$$)
**JEE Tip:** (one-line examiner insight or common trap for this specific problem type)

### Level 2 — Medium (Application)
(Multi-step, requires connecting 2+ concepts)
**Given:** (list all knowns in LaTeX)
**To find:** (state the unknown in LaTeX)
**Concept:** (name the principle)
**Solution:** (full step-by-step with LaTeX at every step, starting each line with "Step X:")
**Answer:** (boxed final answer in LaTeX)
**JEE Tip:** (one-line examiner insight or common trap)

### Level 3 — ${exam} Level (Advanced)
(Proof-based or multi-concept integration problem)
**Given:** (list all knowns in LaTeX)
**To find:** (state the unknown in LaTeX)
**Concept:** (name the principle)
**Solution:** (full step-by-step with LaTeX at every step, starting each line with "Step X:")
**Answer:** (boxed final answer in LaTeX)
**JEE Tip:** (one-line examiner insight or common trap)

---

## 📄 6. Quick Revision Sheet
One-glance summary:
- Core concept in 1 sentence
- Top 3 formulas (inline LaTeX)
- Top 3 tricks

---

## 🧪 7. Practice Questions
Generate 5 questions (mixed difficulty):
1. [Level 1] ...
2. [Level 1] ...
3. [Level 2] ...
4. [Level 2] ...
5. [Level 3] ...

Answers: 1-X, 2-X, 3-X, 4-X, 5-X

---
IMPORTANT RULES:
- Use $...$ for inline math and $$...$$ for block math.
- Never write plain text math like "v = u + at".
- All math MUST be in LaTeX.
- Tone must be highly professional, precise, and purely English.`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
    console.error("[GenerateNotes] Missing GEMINI_API_KEY");
    return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      chapterName,
      subject = "Physics",
      topics = [],
      smartMode = "default" as SmartMode,
      language = "hinglish",
      examMode = "JEE",
    } = body;

    if (!chapterName) {
      return new Response(JSON.stringify({ error: "chapterName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lang = resolveLanguage(language);
    const noteMode = resolveNoteMode(smartMode as SmartMode);
    const prompt = buildFullStructurePrompt(chapterName, subject, topics, examMode, noteMode, lang, smartMode as SmartMode);

    console.log(`[GenerateNotes] Chapter: ${chapterName} | Mode: ${noteMode} | Lang: ${lang} | SmartMode: ${smartMode}`);

    const model = "gemini-flash-latest";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            role: "user",
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 4000,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[GenerateNotes] Gemini API Error ${response.status}:`, errText);
      throw new Error(`Gemini API returned ${response.status}: ${errText}`);
    }

    if (!response.body) throw new Error("No response body from Gemini");

    // Transform Gemini SSE → OpenAI-compatible SSE for the frontend
    return new Response(
      response.body.pipeThrough(new TransformStream({
        transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          const lines = text.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (content) {
                  controller.enqueue(
                    new TextEncoder().encode(
                      `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`
                    )
                  );
                }
              } catch { /* partial JSON chunk, skip */ }
            }
          }
        },
        flush(controller) {
          controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        },
      })),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
        },
      }
    );

  } catch (error: any) {
    console.error("[GenerateNotes] Fatal Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Server Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
