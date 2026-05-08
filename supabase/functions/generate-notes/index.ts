/**
 * generate-notes — Supabase Edge Function
 * Structured 9-section notes system (Coaching / Tuition / Hybrid)
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

function resolveNoteMode(smartMode: SmartMode): NoteMode {
  if (smartMode === "beginner") return "tuition";
  if (smartMode === "advanced") return "coaching";
  return "hybrid";
}

function resolveLanguage(lang: string): Language {
  const l = lang?.toLowerCase();
  if (l === "hindi") return "hindi";
  if (l === "hinglish") return "hinglish";
  return "english";
}

function buildLanguageInstruction(_lang: Language): string {
  return `LANGUAGE RULES:
- Use pure, professional English ONLY.
- Zero Hinglish or Hindi words in explanations, solutions, or tips.
- All math MUST be written in LaTeX. Wrap inline math in $...$ (e.g., $v = u + at$) and display math in $$...$$.
- Tone: Professional, clean, Kota-textbook style.`;
}

function buildFullStructurePrompt(
  chapterName: string,
  subject: string,
  topics: string[],
  examMode: string,
  _mode: NoteMode,
  lang: Language,
  smartMode: SmartMode,
): string {
  const langInstruction = buildLanguageInstruction(lang);
  const topicList = topics.length > 0 ? topics.join(", ") : chapterName;
  const exam = examMode.toUpperCase().includes("NEET") ? "NEET" : examMode.toUpperCase().includes("CUET") ? "CUET" : "JEE";

  if (smartMode === "formulas_only") {
    return `You are a ${exam} coaching faculty specialising in ${subject}.

${langInstruction}

Generate a FORMULAS-ONLY reference sheet for "${chapterName}" (${subject}) for ${exam}.

# 🧮 Formula Bank: ${chapterName}

## Core Formulas
(List every important formula with: name, LaTeX expression wrapped in \\boxed{}, variables defined, conditions of use)

## Derived Formulas
(Less obvious but exam-important derivations, each in \\boxed{})

## Quick Reference Table
| Formula | Use Case | Condition |
|---|---|---|

## ⚡ Formula Tricks
(Time-saving patterns and special cases)

Topics covered: ${topicList}
Prioritize formulas that appear in ${exam} PYQs.`;
  }

  if (smartMode === "mistakes_only") {
    return `You are a ${exam} coaching faculty specialising in ${subject}.

${langInstruction}

Generate a COMMON MISTAKES & TRAPS sheet for "${chapterName}" (${subject}) for ${exam}.

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
    return `You are a ${exam} coaching faculty specialising in ${subject}.

${langInstruction}

Generate a RAPID 1-MINUTE REVISION SHEET for "${chapterName}" (${subject}) for ${exam}.
Make it ultra-compact. A student should be able to scan this in 60 seconds before an exam.

# ⚡ 1-Min Revision: ${chapterName}

## Core Idea (1 line)
## Key Formulas (bullet points, \\boxed{} notation)
## Top 3 Concepts to Remember
## 3 Most Common Mistakes
## ${exam} PYQ Hotspots
## Last-minute Tips

Topics: ${topicList}
Keep it VERY short — flash card, not a textbook.`;
  }

  // Full structured notes (default / beginner / advanced)
  return `You are a world-class ${exam} coaching faculty specialising in ${subject} at a top institute like Allen or FIITJEE.
Your explanations must be physically intuitive, precise, and purely professional.

${langInstruction}

Generate comprehensive, high-quality study notes for "${chapterName}" (Subject: ${subject}) for ${exam}.
Topics to cover: ${topicList}

Follow this EXACT structure. Do not skip any section.

---

# ${chapterName}

---

## 🔍 1. Intuition First
- Give a real-life analogy or visual that makes this topic instantly click.
- Explain the "WHY" before any formula.

---

## 📖 2. Concepts & Formulas
For every major concept, provide:

### Concept: [Name]
Formula: $$\\boxed{formula} \\quad \\text{(condition)}$$
Explanation: 3-4 lines of physical intuition.

*(Repeat for all major topics)*

---

## ⚡ 3. Shortcuts & Tricks
- Time-saving methods that save 30-60 seconds per question
- Pattern recognition tips for ${exam} questions

---

## ⚠️ 4. Common Mistakes
At least 3 specific mistakes:
- The mistake → Why it's wrong → The correct approach

---

## 🧠 5. Solved Examples

### Level 1 — Easy (Direct Formula)
**Given:** (all knowns in LaTeX)
**To find:** (the unknown in LaTeX)
**Concept:** (principle applied)
**Solution:** (step-by-step, each line "Step X:")
**Answer:** $$\\boxed{final answer with SI units}$$
JEE Tip: (one-line examiner insight)

### Level 2 — Medium (Application)
**Given:** ...
**To find:** ...
**Concept:** ...
**Solution:** ...
**Answer:** $$\\boxed{...}$$
JEE Tip: ...

### Level 3 — ${exam} Level (Advanced)
**Given:** ...
**To find:** ...
**Concept:** ...
**Solution:** ...
**Answer:** $$\\boxed{...}$$
JEE Tip: ...

---

## 📄 6. Quick Revision Sheet
- Core concept in 1 sentence
- Top 3 formulas (inline LaTeX)
- Top 3 tricks

---

## 🧪 7. Practice Questions
5 questions (mixed difficulty):
1. [Level 1] ...
2. [Level 1] ...
3. [Level 2] ...
4. [Level 2] ...
5. [Level 3] ...

Answers: 1-?, 2-?, 3-?, 4-?, 5-?

---
CRITICAL: Never write plain-text math like "v = u + at". All math MUST be in LaTeX ($...$).`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const encoder = new TextEncoder();
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
      language = "english",
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

    console.log(`[GenerateNotes] Chapter: ${chapterName} | Mode: ${noteMode} | SmartMode: ${smartMode}`);

    const model = "gemini-2.5-flash";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
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
      throw new Error(`Gemini API returned ${response.status}`);
    }

    if (!response.body) throw new Error("No response body from Gemini");

    return new Response(
      response.body.pipeThrough(new TransformStream({
        transform(chunk, controller) {
          const text = new TextDecoder().decode(chunk);
          for (const line of text.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (content) {
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\n`)
                  );
                }
              } catch { /* partial JSON chunk, skip */ }
            }
          }
        },
        flush(controller) {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
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

  } catch (error: unknown) {
    console.error("[GenerateNotes] Fatal Error:", error);
    const msg = "The notes engine encountered an error. Please refresh and try again.";
    return new Response(
      encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: msg } }] })}\n\ndata: [DONE]\n\n`),
      { headers: { ...corsHeaders, "Content-Type": "text/event-stream" } }
    );
  }
});
