/**
 * generate-notes — Supabase Edge Function
 * Premium Smart Revision Notes Generator (JSON Pipeline)
 * ENGINE: Gemini 2.5 Flash
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(chapterName: string, subject: string, topics: string[], examMode: string): string {
  const topicList = topics.length > 0 ? topics.join(", ") : chapterName;
  const exam = examMode.toUpperCase().includes("NEET") ? "NEET" : examMode.toUpperCase().includes("CUET") ? "CUET" : "JEE Main + Advanced";

  return `SYSTEM PROMPT — PREPENTRANCE PREMIUM NOTES ENGINE

You are an expert Kota faculty generating a highly structured revision note for ${exam}.
CRITICAL LANGUAGE INSTRUCTION:
- You must write in 100% professional, academic English.
- DO NOT use Hinglish, Hindi words, or conversational slang (e.g., no "Beta", "Agar", "Samjho"). Keep terminology simple and student-friendly.

Your output MUST be a continuous text document using the following exact custom markdown block formats. Do NOT wrap the entire output in JSON or markdown code blocks (e.g., no \`\`\`markdown).

REQUIRED METADATA BLOCK (Must be the very first thing):
[METADATA]
chapter_slug: ${chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
chapter_name: ${chapterName}
subject: ${subject}
topic_tree: ${topicList}
[/METADATA]

Then, generate the following sections in order, using standard Markdown headings (#, ##, ###) and the custom blocks below where appropriate.

# ${chapterName}
Classroom notes curated by senior Kota faculty.

[TEACHER_SAYS]
Students, this chapter is extremely critical for your ${exam} preparation. Focus on the core principles rather than just memorizing formulas.
[/TEACHER_SAYS]

## Chapter Overview
Provide a bulleted list of core topics and why it matters for the exam.

## Core Theory
[CONCEPT]
Define precise physical or mathematical concepts here.
[/CONCEPT]

[NCERT_INSIGHT]
Highlight conceptual background frequently tested directly from NCERT.
[/NCERT_INSIGHT]

[DERIVATION]
Show important derivations here using LaTeX inside standard $$ delimiters (e.g., $$F = ma$$).
[/DERIVATION]

## Formula Sheet
For every critical formula, use the following block:
[FORMULA title="Formula Name"]
Equation here (e.g. F = ma)
**Variables:** m = mass (kg), a = acceleration (m/s^2)
**When to use:** Use when mass is constant.
**Common Mistake:** Forgetting vector direction.
**Memory Trick:** A short phrase to remember.
[/FORMULA]

## Important Concepts
List high-frequency traps and symmetry principles.

[JEE_TRICK]
Shortcut Trick: Provide a time-saving mathematical or conceptual shortcut.
[/JEE_TRICK]

## Solved Examples
Provide 1-2 examples formatted exactly like this:
**Given:** ...
**To find:** ...
**Concept:** ...
**Solution:** ...
**Answer:** ...

## PYQ Intelligence Section
Provide past years trend analysis (Question frequency, Difficulty distribution, Key subtopics).

## JEE Insights
Provide multiple common student mistakes using this block:
[COMMON_MISTAKE]
Conceptual Trap: Describe the most frequent conceptual mistake, typical exam trap, or sign convention error here.
[/COMMON_MISTAKE]

## Chapter Summary
Provide a brief bulleted summary.

INPUT DETAILS:
  Chapter: ${chapterName}
  Subject: ${subject}
  Topics: ${topicList}
  Target Exam: ${exam}
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
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
      mode = "notes",
      language = "english",
      forceRegenerate = false,
      action,
      chapterId: clearChapterId,
    } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'clearCache' && clearChapterId) {
      const { error: delError } = await supabase.from('chapter_standardized_notes').delete().eq('chapter_id', clearChapterId);
      if (delError) throw new Error(delError.message);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!chapterName) {
      return new Response(JSON.stringify({ error: "chapterName is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const chapterId = chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const lang = (language || "english").toLowerCase();

    // Cache lookup
    if (mode === "notes" && !forceRegenerate) {
      const { data: cachedNote } = await supabase
        .from("chapter_standardized_notes")
        .select("content")
        .eq("chapter_id", chapterId)
        .eq("language", lang)
        .maybeSingle();

      if (cachedNote?.content) {
        console.log(`[GenerateNotes] Cache HIT for Chapter: ${chapterName}`);
        try {
            const parsedCache = JSON.parse(cachedNote.content);
            return new Response(JSON.stringify({ success: true, data: parsedCache }), {
              headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-cache" },
            });
        } catch(e) {
            console.warn("[GenerateNotes] Cache contained invalid JSON, ignoring.");
        }
      }
    }

    const prompt = buildPrompt(chapterName, subject, topics, examMode);
    const model = "gemini-2.5-flash";
    let finalJsonData = null;
    let attempts = 0;
    const maxAttempts = 3;

    // Generation and Validation Loop
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[GenerateNotes] Attempt ${attempts} for ${chapterName}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
            }
          }),
        }
      );

      if (!response.ok) {
        console.error(`Attempt ${attempts} failed HTTP ${response.status}`);
        continue;
      }

      const resData = await response.json();
      const content = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) continue;

      if (!content.includes("[METADATA]")) {
        console.error(`Attempt ${attempts} Validation Failed: Missing [METADATA] block`);
        continue;
      }

      finalJsonData = content;
      break;
    }

    if (!finalJsonData) {
       return new Response(JSON.stringify({ error: "Failed to generate valid content after multiple attempts." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Save to Cache
    await supabase.from("chapter_standardized_notes").upsert({
        chapter_id: chapterId,
        chapter_name: chapterName,
        subject: subject,
        language: lang,
        content: finalJsonData,
    }, { onConflict: "chapter_id,language" });

    // Return the response synchronously to the frontend
    return new Response(JSON.stringify({ success: true, data: finalJsonData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-cache" },
    });

  } catch (error: any) {
    console.error("[GenerateNotes] Fatal Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Engine Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
