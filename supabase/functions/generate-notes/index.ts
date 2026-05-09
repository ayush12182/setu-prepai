/**
 * generate-notes — Supabase Edge Function
 * 1-Page Smart Revision Notes Prompt
 * ENGINE: Gemini 1.5 Flash (streaming SSE)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(chapterName: string, subject: string, topics: string[], examMode: string): string {
  const topicList = topics.length > 0 ? topics.join(", ") : chapterName;
  const exam = examMode.toUpperCase().includes("NEET") ? "NEET" : examMode.toUpperCase().includes("CUET") ? "CUET" : "JEE";

  return `You are an expert ${exam} revision note creator for SETU.

Your task is to generate ultra-clean, exam-oriented 1-page revision notes for students who are revising 1 day before the exam.

The output MUST feel like:

Allen/Resonance short notes
visually clean
highly scannable
formula-first
zero fluff
easy to revise in under 5 minutes

The notes must be written in perfect rendering syntax using proper Markdown + LaTeX formatting.

STRICT OUTPUT RULES
1. Proper LaTeX Rendering (VERY IMPORTANT)

Never output broken syntax like:

$$\\boxed{B = \\frac{\\mu_0}{4\\pi} ...

Instead always render formulas cleanly using block math:

\\[
B = \\frac{\\mu_0 I}{2\\pi r}
\\]

Inline math:

\\( F = qvB \\)

Never show raw escape characters to users.

2. Structure of Notes

The notes MUST follow this exact structure:

# ${chapterName}
## 1. Core Concepts
1-line intuition
only most important theory
max 2–3 lines per concept
## 2. Important Formula Sheet
boxed formulas
clean derivations only if extremely important
variable meanings concise
## 3. Graphs / Visual Memory Tricks
ASCII graph / Mermaid / simple plotted explanation
only exam-relevant graphs
label axes properly
## 4. Most Used Results
direct formulas used in PYQs
shortcuts
approximations
standard values
## 5. Common Mistakes
misconceptions
sign convention mistakes
unit mistakes
## 6. PYQ Trigger Points
what examiner usually asks
pattern recognition
## 7. 30-Second Final Revision Box
ultra-short recap bullets

3. Writing Style

The style should be:

concise
topper-style notes
high information density
no storytelling
no long paragraphs
no unnecessary explanations

Every line should help in solving questions.

4. Formula Formatting Rules

Every important formula should appear like:

\\[
B = \\frac{\\mu_0 I}{2\\pi r}
\\]

Use aligned equations where needed:

\\[
\\begin{aligned}
F &= q(v \\times B) \\\\
\\tau &= nBIA \\sin\\theta
\\end{aligned}
\\]

5. Graph Rules

Whenever applicable include:

properly labeled graphs
trend curves
proportionality graphs
field-line diagrams
circuit mini diagrams

Use Mermaid diagrams OR clean markdown-compatible visuals.

6. Visual Hierarchy

Use:

headings
tables
bullet points
highlights
boxed results
separators

Avoid:

huge paragraphs
crowded text
repeated explanations

7. Accuracy Rules

VERY IMPORTANT:

formulas must be ${exam} accurate
sign conventions correct
dimensions correct
units correct
no hallucinated formulas
only exam-relevant content

8. Compression Rules (MOST IMPORTANT)

This is NOT textbook content.

This is:
✅ last-day revision
✅ 1-page memory sheet
✅ formula booster
✅ exam recall notes

So:

compress aggressively
retain only high-yield information
prioritize PYQ-used concepts
remove low-weightage explanations

9. Output Formatting

Output must be:

fully renderable markdown
mobile friendly
dark-theme compatible
visually balanced
proper spacing between sections

---
Subject: ${subject}
Chapter: ${chapterName}
Topics: ${topicList}
Exam: ${exam}
`;
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
      examMode = "JEE",
    } = body;

    if (!chapterName) {
      return new Response(JSON.stringify({ error: "chapterName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prompt = buildPrompt(chapterName, subject, topics, examMode);

    console.log(`[GenerateNotes] Chapter: ${chapterName} | Exam: ${examMode}`);

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
