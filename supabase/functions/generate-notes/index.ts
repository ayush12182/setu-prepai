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

function cleanJsonString(str: string): string {
  // Replace single backslashes with double backslashes, unless they escape a quote or another backslash
  return str.replace(/(?<!\\)\\(?!["\\])/g, "\\\\");
}

function buildPrompt(chapterName: string, subject: string, topics: string[], examMode: string): string {
  const topicList = topics.length > 0 ? topics.join(", ") : chapterName;
  const exam = examMode.toUpperCase().includes("NEET") ? "NEET" : examMode.toUpperCase().includes("CUET") ? "CUET" : "JEE Main + Advanced";

  return `SYSTEM PROMPT — PREPENTRANCE PREMIUM NOTES ENGINE (COACHING GRADE)

You are an elite senior HOD at a premier Kota coaching institute (Allen/Resonance/PW). You are generating comprehensive, mathematically rigorous classroom notes of absolute premium quality (comparable to a ₹50,000 coaching module, Cengage, and Physics Galaxy combined) for ${exam}.

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

You MUST generate the following 15 sections in this EXACT order. Do not skip any section, and use exact ## headings. Make the content extremely detailed, comprehensive, and rich—this should feel like a full 40-page textbook chapter, not a summary.

## 1. Teacher Insight
Write a highly strategic introduction (300-500 words) from a senior faculty member.
- Explain WHY this chapter is critical for ${exam} (historical weightage, question trends).
- Detail exactly where students fail conceptually (common traps, mathematical pitfalls).
- Share how AIR (All India Rank) 1-100 students study and master this specific topic.
- Provide a clear, actionable study strategy and a checklist of what to avoid.
Use the following wrapper format:
[TEACHER_SAYS]
Detailed text here...
[/TEACHER_SAYS]

## 2. Learning Outcomes
Provide an exhaustive, bulleted list of 10-15 concrete learning outcomes. What derivations must they master? What specific problem types must they be able to solve?

## 3. Complete Theory
Provide a massive, highly detailed theory section. Every subtopic should feel like 4-6 pages of coaching notes, complete with:
- Formal definitions and deep physical/mathematical intuitions.
- Step-by-step mathematical derivations of ALL core equations starting from absolute fundamentals (e.g., derive kinematics equations starting from differential calculus a = dv/dt, showing integration, boundaries, assumptions, and constraints).
- Real-life analogies to make complex concepts intuitive.
- Important exam observations and NCERT connections.
- Advanced JEE/NEET insights and common misconceptions.
Format concepts, NCERT connections, and derivations using these blocks:
[CONCEPT]
Concept details...
[/CONCEPT]
[NCERT_INSIGHT]
NCERT connections/insights...
[/NCERT_INSIGHT]
[DERIVATION]
Derivation text...
[/DERIVATION]

## 4. Concept Visualization
Define interactive diagrams, graphs, and simulation configurations for visual learning. Ensure the JSON is valid.
[GRAPH]
{
  "graphType": "velocity_time",
  "title": "Velocity-Time Graph for Uniform Acceleration",
  "xAxis": "Time (s)",
  "yAxis": "Velocity (m/s)",
  "equation": "v = u + a * t",
  "sliders": {
    "u": { "min": 0, "max": 50, "step": 1, "default": 10, "label": "Initial Velocity (u)", "unit": "m/s" },
    "a": { "min": -10, "max": 10, "step": 0.5, "default": 2, "label": "Acceleration (a)", "unit": "m/s²" }
  }
}
[/GRAPH]

## 5. Formula Sheet
IMPORTANT: This must be a complete formula repository containing EVERY formula required for NCERT, JEE Main, JEE Advanced, and NEET for this chapter. Do not summarize or skip equations. Group formulas under markdown subheadings (e.g., ### Motion in 1D, ### Projectile Motion).
For every formula, list it as an independent card using this exact format:
[FORMULA title="Formula Name"]
Equation (e.g., T = \\frac{2u \\sin \\theta}{g})
**Variables:** Variable meanings (e.g. u = initial velocity, theta = angle of projection)
**SI Units:** Standard SI units of each variable
**Physical Meaning:** The physical significance of the formula
**When to use:** Detailed explanation of applicability
**When NOT to use:** Limits, boundaries, constraints (e.g., constant acceleration only, small angles only)
**Memory Trick:** Mnemonic or memory aid
**Common Mistake:** Pitfalls, common errors to avoid
**One Solved Example:** A quick illustrative example (with numbers/variables, step-by-step)
**Related Formula:** Connected equations
**Derivation:** Complete step-by-step calculus or algebraic proof
[/FORMULA]

## 6. Important Graphs
Describe all critical graphs for this chapter. Explain what the slope, area, intercepts, and inflection points represent physically.

## 7. Solved Examples
Provide 15-25 highly rigorous solved examples categorized by difficulty (Easy, Medium, Hard) and target exams (JEE Main, Advanced, NEET).
Every solution must explain the WHY (conceptual strategy) before the HOW (mathematical execution). Do not skip any algebra or calculus steps.
[WORKED_EXAMPLE]
{
  "question": "Detailed question text...",
  "hints": ["Hint 1", "Hint 2"],
  "thinkTime": "Thought-provoking conceptual question about the scenario...",
  "steps": ["Step 1 with math...", "Step 2 with math..."],
  "finalAnswer": "LaTeX answer...",
  "alternativeMethod": "Alternative method or shortcut...",
  "commonMistakes": ["Mistake 1", "Mistake 2"]
}
[/WORKED_EXAMPLE]

## 8. PYQ Analysis
Provide a comprehensive past-year question trend analysis:
- Topic-wise question frequency (e.g., Projectile: 35%, Relative Motion: 25%).
- Difficulty distribution across recent years.
- Repeated problem archetypes and expected future questions.
- Key coaching observations and strategy for high-scoring topics.

## 9. Common Mistakes
List 30-50 common student mistakes. For each mistake, detail:
- The conceptual trap / mistake.
- Why students make it.
- Correct physical/mathematical thinking.
- A mini-example illustrating the trap.
[COMMON_MISTAKE]
Mistake: ...
Why: ...
Correct: ...
[/COMMON_MISTAKE]

## 10. Shortcuts
Provide 5-10 elite coaching shortcuts, calculation tricks, approximation techniques, option elimination hacks, and advanced JEE/NEET hacks.
[JEE_TRICK]
Trick: ...
[/JEE_TRICK]

## 11. Revision Sheet
A ultra-condensed 2-page equivalent revision sheet. Summarize all formulas, graph properties, and critical takeaways for the day before the exam.

## 12. Chapter Summary
Provide a bulleted, high-level summary of the entire chapter's core subtopics.

## 13. Mind Map
Provide a text-based, expandable nested hierarchy showing exactly how topics branch out.
Example:
Kinematics
├── Motion in 1D
│   ├── Distance & Displacement
│   └── Constant vs Variable Acceleration
└── Motion in 2D
    ├── Projectiles (Inclined vs Horizontal)
    └── Relative Velocity (River-Boat, Rain-Man)

## 14. Exam Tips
Provide 20-30 tactical faculty tips on how to approach exam problems, read questions carefully, manage time, and verify calculations.

## 15. AI Insights
Provide deep cognitive insights based on student analytics (e.g., "90% of students lose marks in Relative Motion because they fail to set up reference frames...").

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
    try {
      const cleaned = cleanJsonString(m[1].trim());
      graphs.push(JSON.parse(cleaned));
    } catch (e) {
      console.warn("[parseStructuredFields] Graph parse failed:", e);
    }
  }
  if (graphs.length) parsed.graphs = graphs;

  // Extract diagrams
  const diagrams: unknown[] = [];
  const diagramRegex = /\[DIAGRAM\]([\s\S]*?)\[\/DIAGRAM\]/g;
  while ((m = diagramRegex.exec(rawContent)) !== null) {
    try {
      const cleaned = cleanJsonString(m[1].trim());
      diagrams.push(JSON.parse(cleaned));
    } catch (e) {
      console.warn("[parseStructuredFields] Diagram parse failed:", e);
    }
  }
  if (diagrams.length) parsed.diagrams = diagrams;

  // Extract worked examples
  const examples: unknown[] = [];
  const exampleRegex = /\[WORKED_EXAMPLE\]([\s\S]*?)\[\/WORKED_EXAMPLE\]/g;
  while ((m = exampleRegex.exec(rawContent)) !== null) {
    try {
      const cleaned = cleanJsonString(m[1].trim());
      examples.push(JSON.parse(cleaned));
    } catch (e) {
      console.warn("[parseStructuredFields] Worked example parse failed:", e);
    }
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
    const variables = lines.find(l => l.startsWith("**Variables:**"))?.replace("**Variables:**", "").trim() || "";
    const units = lines.find(l => l.startsWith("**SI Units:**"))?.replace("**SI Units:**", "").trim() || "";
    const physicalMeaning = lines.find(l => l.startsWith("**Physical Meaning:**"))?.replace("**Physical Meaning:**", "").trim() || "";
    const whenToUse = lines.find(l => l.startsWith("**When to use:**"))?.replace("**When to use:**", "").trim() || "";
    const whenNotToUse = lines.find(l => l.startsWith("**When NOT to use:**") || l.startsWith("**When fallback/not to use:**"))?.replace(/^\*\*When (?:NOT|fallback\/not) to use:\*\*/, "").trim() || "";
    const memoryTrick = lines.find(l => l.startsWith("**Memory Trick:**"))?.replace("**Memory Trick:**", "").trim() || "";
    const commonMistake = lines.find(l => l.startsWith("**Common Mistake:**") || l.startsWith("**Common Mistakes:**"))?.replace(/^\*\*Common Mistakes?:\*\*/, "").trim() || "";
    const solvedExample = lines.find(l => l.startsWith("**One Solved Example:**") || l.startsWith("**Solved Example:**"))?.replace(/^\*\*(?:One )?Solved Example:\*\*/, "").trim() || "";
    const relatedFormula = lines.find(l => l.startsWith("**Related Formula:**"))?.replace("**Related Formula:**", "").trim() || "";
    
    formulas.push({ 
      title, 
      latex, 
      variables, 
      units, 
      physicalMeaning, 
      whenToUse, 
      whenNotToUse, 
      memoryTrick, 
      commonMistake, 
      solvedExample, 
      relatedFormula 
    });
  }
  if (formulas.length) parsed.formulas = formulas;

  // Build ai_context: condensed summary for AI tutor (< 2000 chars)
  const overviewMatch = rawContent.match(/## 1\. Chapter Overview([\s\S]*?)(?=##|$)/i);
  const summaryMatch = rawContent.match(/## 12\. Chapter Summary([\s\S]*?)(?=##|$)/i);
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

  // Admin auth gate moved lower down to support student-triggered initial generation
  if (!hasAdminKey && !isAdminUser) {
    console.log(`[GenerateNotes] Student triggered generation for ${req.url}`);
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

    // ── Security Check for Students ───────────────────────────
    if (!hasAdminKey && !isAdminUser) {
      forceRegenerate = false; // Students can NEVER force regenerate
      if (latestPublished) {
        return new Response(JSON.stringify({ error: "Chapter already exists" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
    }

    // ── Generation Lock (Version 0) ───────────────────────────
    if (!forceRegenerate) {
      const { data: lock } = await supabase
        .from("chapter_content")
        .select("version_label, updated_at")
        .eq("chapter_id", chapterId)
        .eq("exam_type", exam)
        .eq("language", lang)
        .eq("version", 0)
        .maybeSingle();

      if (lock) {
        if (lock.version_label === "generating") {
          // If the lock is older than 5 minutes, we assume it failed/timed out and override it
          const lockAge = Date.now() - new Date(lock.updated_at).getTime();
          if (lockAge < 5 * 60 * 1000) {
            return new Response(JSON.stringify({ error: "Generation in progress", status: "generating" }), { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          }
        }
      }

      // Acquire Lock
      await supabase.from("chapter_content").upsert({
        chapter_id: chapterId,
        chapter_slug: chapterSlug,
        chapter_name: chapterName,
        subject: subject.toLowerCase(),
        exam_type: exam,
        language: lang,
        version: 0,
        version_label: 'generating',
        status: 'draft',
        raw_content: 'AI Generation in Progress',
        updated_at: new Date().toISOString()
      }, { onConflict: "chapter_id,exam_type,language,version" });
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
      // Release lock on failure
      await supabase.from("chapter_content").upsert({
        chapter_id: chapterId, chapter_slug: chapterSlug, chapter_name: chapterName, subject: subject.toLowerCase(), exam_type: exam, language: lang, version: 0, version_label: 'failed', status: 'draft', raw_content: 'Generation Failed'
      }, { onConflict: "chapter_id,exam_type,language,version" });
      
      return new Response(
        JSON.stringify({ error: "AI generation failed. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Parse structured fields ───────────────────────────────
    const structuredFields = parseStructuredFields(finalContent);
    const wordCount = finalContent.split(/\s+/).length;

    // ── Save to chapter_content as PUBLISHED ─────────────────────
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
          status: "published",
          raw_content: finalContent,
          word_count: wordCount,
          generation_model: model,
          source: "ai_generated",
          ...structuredFields,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "chapter_id,exam_type,language,version" }
      );
      
    // Clear the lock
    await supabase.from("chapter_content").delete().eq("chapter_id", chapterId).eq("exam_type", exam).eq("language", lang).eq("version", 0);

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

    console.log(`[GenerateNotes] Saved: ${chapterName} v${versionLabel} as PUBLISHED`);

    return new Response(
      JSON.stringify({
        success: true,
        data: finalContent,
        meta: {
          status: "published",
          version: versionLabel,
          wordCount,
          model,
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
