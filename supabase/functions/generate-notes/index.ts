/**
 * generate-notes — Supabase Edge Function
 * PrepEntrance Content Generation Engine
 *
 * ADMIN-ONLY ENDPOINT.
 * Students NEVER call this. Students call get-chapter-content instead.
 *
 * PURPOSE:
 *   AI generates chapter content ONCE.
 *   Saves structured result to chapter_content table as 'draft'.
 *   Admin reviews and publishes via Admin Panel.
 *
 * AUTH:
 *   Requires service role key OR VITE_ADMIN_SECRET header.
 *   Returns 403 for regular user JWTs.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
};

function buildPrompt(chapterName: string, subject: string, topics: string[], examMode: string): string {
  const topicList = topics.length > 0 ? topics.join(", ") : chapterName;
  const exam = examMode.toUpperCase().includes("NEET") ? "NEET" : examMode.toUpperCase().includes("CUET") ? "CUET" : "JEE Main + Advanced";

  return `SYSTEM PROMPT — PREPENTRANCE PREMIUM NOTES ENGINE

You are an expert Kota faculty generating a highly structured, interactive revision note for ${exam}.
CRITICAL LANGUAGE INSTRUCTION:
- You must write in 100% professional, academic English.
- DO NOT use Hinglish, Hindi words, or conversational slang. Keep terminology simple and student-friendly.

Your output MUST be a continuous text document using the following exact custom markdown block formats. Do NOT wrap the entire output in JSON or markdown code blocks.

REQUIRED METADATA BLOCK (Must be the very first thing):
[METADATA]
chapter_slug: ${chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
chapter_name: ${chapterName}
subject: ${subject}
topic_tree: ${topicList}
[/METADATA]

# ${chapterName} — Complete Master Notes

PrepEntrance ${subject} | ${exam} | Class 11/12 • Droppers

[TEACHER_SAYS]
Students, this chapter is extremely critical for your ${exam} preparation. Focus on the core principles rather than just memorizing formulas.
[/TEACHER_SAYS]

You MUST generate the following 15 sections in this EXACT order. Do not skip any section, and use exact ## headings.

## 1. Chapter Overview
Provide why this chapter matters, where it appears in ${exam}, its connection with future chapters, weightage, and difficulty.

## 2. Learning Outcomes
Provide a bulleted list of what the student should be able to do by the end of the chapter.

## 3. Complete Theory
Provide the core theory, definitions, and derivations. Use standard Markdown headings (###) for subtopics.
[CONCEPT]
Define precise physical or mathematical concepts here.
[/CONCEPT]
[NCERT_INSIGHT]
Highlight conceptual background frequently tested directly from NCERT.
[/NCERT_INSIGHT]
[DERIVATION]
Show important derivations here using LaTeX inside standard $$ delimiters (e.g., $$F = ma$$).
[/DERIVATION]

## 4. Concept Visualization
Provide at least one interactive graph, interactive diagram, or simulation block here!
[GRAPH]
{ "graphType": "velocity_time", "title": "Example Graph", "xAxis": "Time (s)", "yAxis": "Velocity (m/s)", "equation": "v = u + a * t", "sliders": { "u": { "min": 0, "max": 50, "step": 1, "default": 10, "label": "Initial Velocity", "unit": "m/s" } } }
[/GRAPH]

## 5. Formula Sheet
For every critical formula, use the following block:
[FORMULA title="Formula Name"]
Equation here (e.g. F = ma)
**Variables:** m = mass (kg), a = acceleration (m/s^2)
**When to use:** Use when mass is constant.
**Common Mistake:** Forgetting vector direction.
**Memory Trick:** A short phrase to remember.
[/FORMULA]

## 6. Important Graphs
Provide explanation of key graphs related to the topic (e.g., x-t, v-t graphs).

## 7. Solved Examples
Provide 1-2 interactive solved examples formatted exactly like this:
[WORKED_EXAMPLE]
{
  "question": "A block of mass 2 kg is pulled...",
  "hints": ["Identify the horizontal force..."],
  "thinkTime": "What if there is friction...?",
  "steps": ["Apply F = ma: 10 = 2 * a.", "Solve for a."],
  "finalAnswer": "$5\\text{ m/s}^2$",
  "alternativeMethod": "None",
  "commonMistakes": ["Confusing normal force with pulling force."]
}
[/WORKED_EXAMPLE]

## 8. PYQ Analysis
Provide past years trend analysis (Question frequency, Difficulty distribution, Key subtopics).

## 9. Common Mistakes
Provide multiple common student mistakes using this block:
[COMMON_MISTAKE]
Conceptual Trap: Describe the most frequent conceptual mistake, typical exam trap, or sign convention error here.
[/COMMON_MISTAKE]

## 10. Shortcuts
[JEE_TRICK]
Shortcut Trick: Provide a time-saving mathematical or conceptual shortcut.
[/JEE_TRICK]

## 11. Revision Sheet
Provide a condensed bullet-point list of the most critical facts to revise just before the exam.

## 12. Chapter Summary
Provide a brief bulleted summary of the chapter.

## 13. Mind Map
Provide a text-based hierarchy or explanation of how concepts link together.

## 14. Exam Tips
Provide strategic advice on how to approach questions from this chapter during the exam.

## 15. AI Insights
Provide an overarching analytical insight from AI about how students typically perform on this topic.

INPUT DETAILS:
  Chapter: ${chapterName}
  Subject: ${subject}
  Topics: ${topicList}
  Target Exam: ${exam}
`;
}

/** Parse raw_content blocks into structured JSON fields */
function parseStructuredFields(rawContent: string): Record<string, unknown> {
  const parsed: Record<string, unknown> = {};

  // Extract graphs
  const graphs: unknown[] = [];
  const graphRegex = /\[GRAPH\]([\s\S]*?)\[\/GRAPH\]/g;
  let m;
  while ((m = graphRegex.exec(rawContent)) !== null) {
    try { graphs.push(JSON.parse(m[1].trim())); } catch { /* skip malformed */ }
  }
  if (graphs.length) parsed.graphs = graphs;

  // Extract diagrams
  const diagrams: unknown[] = [];
  const diagramRegex = /\[DIAGRAM\]([\s\S]*?)\[\/DIAGRAM\]/g;
  while ((m = diagramRegex.exec(rawContent)) !== null) {
    try { diagrams.push(JSON.parse(m[1].trim())); } catch { /* skip */ }
  }
  if (diagrams.length) parsed.diagrams = diagrams;

  // Extract worked examples
  const examples: unknown[] = [];
  const exampleRegex = /\[WORKED_EXAMPLE\]([\s\S]*?)\[\/WORKED_EXAMPLE\]/g;
  while ((m = exampleRegex.exec(rawContent)) !== null) {
    try { examples.push(JSON.parse(m[1].trim())); } catch { /* skip */ }
  }
  if (examples.length) parsed.worked_examples = examples;

  // Extract common mistakes
  const mistakes: string[] = [];
  const mistakeRegex = /\[COMMON_MISTAKE\]([\s\S]*?)\[\/COMMON_MISTAKE\]/g;
  while ((m = mistakeRegex.exec(rawContent)) !== null) {
    const text = m[1].trim();
    if (text) mistakes.push(text);
  }
  if (mistakes.length) parsed.common_mistakes = mistakes;

  // Extract formulas (simplified — title + equation from block)
  const formulas: unknown[] = [];
  const formulaRegex = /\[FORMULA\s+title="([^"]+)"\]([\s\S]*?)\[\/FORMULA\]/g;
  while ((m = formulaRegex.exec(rawContent)) !== null) {
    const title = m[1].trim();
    const body = m[2].trim();
    const lines = body.split("\n").map(l => l.trim()).filter(Boolean);
    const latex = lines[0] || "";
    const whenToUse = lines.find(l => l.startsWith("**When to use:**"))?.replace("**When to use:**", "").trim() || "";
    const commonMistake = lines.find(l => l.startsWith("**Common Mistake:**"))?.replace("**Common Mistake:**", "").trim() || "";
    const memoryTrick = lines.find(l => l.startsWith("**Memory Trick:**"))?.replace("**Memory Trick:**", "").trim() || "";
    formulas.push({ title, latex, whenToUse, commonMistake, memoryTrick });
  }
  if (formulas.length) parsed.formulas = formulas;

  // Build ai_context: condensed summary for AI tutor (< 2000 chars)
  const overviewMatch = rawContent.match(/## Chapter Overview([\s\S]*?)(?=##|$)/);
  const summaryMatch = rawContent.match(/## Chapter Summary([\s\S]*?)(?=##|$)/);
  const aiCtxParts = [];
  if (overviewMatch) aiCtxParts.push(overviewMatch[1].trim());
  if (summaryMatch) aiCtxParts.push(summaryMatch[1].trim());
  if (formulas.length) {
    aiCtxParts.push(`Key formulas: ${formulas.slice(0, 5).map((f: any) => `${f.title}: ${f.latex}`).join("; ")}`);
  }
  parsed.ai_context = aiCtxParts.join("\n\n").slice(0, 2000);

  return parsed;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
  const ADMIN_SECRET = Deno.env.get("ADMIN_SECRET");

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // ── Admin Auth Gate ───────────────────────────────────────
  // Accept either: X-Admin-Key header matching ADMIN_SECRET,
  //  or service role JWT (bypasses this check via supabase client).
  const adminKey = req.headers.get("x-admin-key");
  const authHeader = req.headers.get("authorization") || "";

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // Check if request has a valid admin key
  const hasAdminKey = ADMIN_SECRET && adminKey === ADMIN_SECRET;

  // Check if JWT belongs to an admin/teacher profile
  let isAdminUser = false;
  if (!hasAdminKey && authHeader.startsWith("Bearer ")) {
    const jwt = authHeader.replace("Bearer ", "");
    try {
      const { data: { user } } = await createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY") || supabaseServiceKey)
        .auth.getUser(jwt);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type")
          .eq("user_id", user.id)
          .maybeSingle();
        isAdminUser = profile?.user_type === "admin" || profile?.user_type === "teacher";
      }
    } catch { /* not a valid user JWT */ }
  }

  if (!hasAdminKey && !isAdminUser) {
    return new Response(
      JSON.stringify({
        error: "Forbidden",
        message: "generate-notes is an admin-only endpoint. Students should use get-chapter-content instead.",
      }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const {
      chapterName,
      chapterId: chapterIdInput,
      subject = "Physics",
      topics = [],
      examType = "JEE",
      examMode = "JEE",
      language = "english",
      forceRegenerate = false,
      action,
      chapterId: clearChapterId,
    } = body;

    // ── Clear cache action (legacy compat) ───────────────────
    if (action === "clearCache" && clearChapterId) {
      await supabase.from("chapter_standardized_notes").delete().eq("chapter_id", clearChapterId);
      await supabase.from("chapter_content").delete().eq("chapter_id", clearChapterId).eq("status", "draft");
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!chapterName) {
      return new Response(JSON.stringify({ error: "chapterName is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const chapterId = chapterIdInput || chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const chapterSlug = chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const lang = (language || "english").toLowerCase();
    const exam = examType || examMode || "JEE";

    // ── Check if published version already exists ─────────────
    // If yes: we create a new draft (increment version). If no: start at v1.
    const { data: latestPublished } = await supabase
      .from("chapter_content")
      .select("version")
      .eq("chapter_id", chapterId)
      .eq("exam_type", exam)
      .eq("language", lang)
      .eq("status", "published")
      .order("version", { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersion = latestPublished ? latestPublished.version + 1 : 1;
    const versionLabel = `${nextVersion}.0`;

    // ── Cache lookup (skip for forceRegenerate) ───────────────
    // First check new chapter_content table
    if (!forceRegenerate) {
      const { data: existingDraft } = await supabase
        .from("chapter_content")
        .select("id, chapter_name, version_label, status, raw_content, updated_at")
        .eq("chapter_id", chapterId)
        .eq("exam_type", exam)
        .eq("language", lang)
        .eq("status", "draft")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingDraft?.raw_content) {
        console.log(`[GenerateNotes] Draft exists for: ${chapterName} v${existingDraft.version_label}`);
        return new Response(
          JSON.stringify({
            success: true,
            data: existingDraft.raw_content,
            meta: { status: "draft", version: existingDraft.version_label, cached: true },
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Also check legacy cache for backwards compat
      const { data: legacyCache } = await supabase
        .from("chapter_standardized_notes")
        .select("content")
        .eq("chapter_id", chapterSlug)
        .eq("language", lang)
        .maybeSingle();

      if (legacyCache?.content) {
        console.log(`[GenerateNotes] Legacy cache HIT for: ${chapterName}`);
        return new Response(
          JSON.stringify({ success: true, data: legacyCache.content, meta: { cached: true, source: "legacy" } }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // ── Generate with AI ──────────────────────────────────────
    const prompt = buildPrompt(chapterName, subject, topics, exam);
    const model = "gemini-2.5-flash";
    let finalContent: string | null = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[GenerateNotes] Generating: ${chapterName} | Attempt ${attempts}`);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 },
          }),
        }
      );

      if (!response.ok) {
        console.error(`[GenerateNotes] Gemini HTTP ${response.status} on attempt ${attempts}`);
        continue;
      }

      const resData = await response.json();
      const content = resData.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!content || !content.includes("[METADATA]")) {
        console.error(`[GenerateNotes] Missing [METADATA] on attempt ${attempts}`);
        continue;
      }

      finalContent = content;
      break;
    }

    if (!finalContent) {
      return new Response(
        JSON.stringify({ error: "Failed to generate valid content after multiple attempts." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Parse structured fields ───────────────────────────────
    const structuredFields = parseStructuredFields(finalContent);
    const wordCount = finalContent.split(/\s+/).length;

    // ── Save to chapter_content as DRAFT ─────────────────────
    const { error: insertError } = await supabase
      .from("chapter_content")
      .upsert(
        {
          chapter_id: chapterId,
          chapter_slug: chapterSlug,
          chapter_name: chapterName,
          subject: subject.toLowerCase(),
          exam_type: exam,
          language: lang,
          version: nextVersion,
          version_label: versionLabel,
          status: "draft",
          raw_content: finalContent,
          word_count: wordCount,
          generation_model: model,
          source: "ai_generated",
          ...structuredFields,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "chapter_id,exam_type,language,version" }
      );

    if (insertError) {
      console.error("[GenerateNotes] Failed to save to chapter_content:", insertError);
    }

    // ── Also save to legacy cache (backwards compat) ──────────
    await supabase.from("chapter_standardized_notes").upsert(
      {
        chapter_id: chapterSlug,
        chapter_name: chapterName,
        subject: subject.toLowerCase(),
        language: lang,
        content: finalContent,
      },
      { onConflict: "chapter_id,language" }
    );

    console.log(`[GenerateNotes] Saved: ${chapterName} v${versionLabel} as DRAFT`);

    return new Response(
      JSON.stringify({
        success: true,
        data: finalContent,
        meta: {
          version: versionLabel,
          status: "draft",
          wordCount,
          structuredFields: Object.keys(structuredFields),
          message: "Content saved as DRAFT. Admin must publish before students can see it.",
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[GenerateNotes] Fatal Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal Engine Error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
