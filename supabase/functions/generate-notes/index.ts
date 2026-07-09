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
CRITICAL RULE: YOU MUST OUTPUT RAW MARKDOWN TEXT. DO NOT OUTPUT A JSON OBJECT AT THE ROOT LEVEL. The very first line of your output MUST be exactly [METADATA].

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

## 1. Chapter Overview

### Why ${chapterName} matters
Provide a powerful 1-paragraph explanation of why this chapter is the foundation of its respective field (Physics/Chemistry/Maths/Biology).
Then, provide a bulleted list of exactly how this chapter's concepts connect to at least 4-5 later chapters. Use this exact format:
- **[Later Chapter Name]:** [Brief explanation of how this current chapter's concepts are directly used in that later chapter].

After this, write a highly strategic introduction (300-500 words) from a senior faculty member.
- Explain exactly where students fail conceptually (common traps, mathematical pitfalls).
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

  // ── HARD ADMIN GATE — Students NEVER generate notes ─────────
  // Standardized Notes Architecture: Only admins can generate/publish.
  // Students call get-chapter-content (read-only) instead.
  if (!hasAdminKey && !isAdminUser) {
    return new Response(
      JSON.stringify({ error: "Forbidden. Notes generation is admin-only. Students should use get-chapter-content." }),
      { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    let {
      chapterName,
      chapterId: chapterIdInput,
      subject = "Physics",
      topics = [],
      examType = "JEE",
      examMode = "JEE",
      language = "english",
      forceRegenerate = false,
      action,
      preGeneratedMarkdown,
      chapterId: clearChapterId,
    } = body;

    // ── Clear cache action (legacy compat) ───────────────────
    if (action === "clearCache" && clearChapterId) {
      await supabase.from("chapter_standardized_notes").delete().eq("chapter_id", clearChapterId);
      await supabase.from("chapter_content").delete().eq("chapter_id", clearChapterId);
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

    if (hasAdminKey && preGeneratedMarkdown) {
      console.log(`[GenerateNotes] Admin provided pre-generated markdown for ${chapterId}`);
      finalContent = preGeneratedMarkdown;
    } else if (chapterId === 'chem-2') {
      finalContent = JSON.parse("\"# ATOMIC STRUCTURE — Complete Master Notes\\nPrepEntrance chemistry | JEE | Class 11/12 • Droppers\\n\\n## 1. Teacher Insight\\n[TEACHER_SAYS]\\nAtomic Structure is the **foundation of inorganic chemistry**. Students who master it unlock everything: periodic trends, bonding, reactions. But most students memorize electron configurations like parrots and fail miserably on JEE questions that ask for explanation.\\n\\nThe single biggest pitfall: treating quantum numbers as meaningless labels. Students don't understand that $n$ determines *energy*, $l$ determines *shape*, $m_l$ determines *orientation*. So when a question asks \\\"Why does transition from 2s to 3s emit light?\\\" they're lost.\\n\\nAnother critical error: confusing **orbitals** (mathematical probability functions) with **orbits** (planetary model, which is wrong). Bohr model is a crutch—useful for hydrogen, deadly for multi-electron atoms.\\n\\nAIR 1-100 students do this:\\n1. Master the **Aufbau principle** and why it matters (Hund's rule, Pauli exclusion).\\n2. Understand **ionization energy trends** on the periodic table—it's not random; it flows from electron configuration.\\n3. Link electron configuration to **chemical properties**: Why are noble gases inert? Because they have a filled s and p block.\\n4. Know the **de Broglie wavelength** and why particles behave like waves—this explains why orbits are quantized.\\n\\nCritical for JEE: Problems often hide atomic structure inside. \\\"Why is Cr: [Ar]3d⁵4s¹ instead of [Ar]3d⁴4s²?\\\" Because half-filled d orbitals are more stable. One-line answer, but it requires deep understanding.\\n[/TEACHER_SAYS]\\n\\n## 2. Learning Outcomes\\n- Understand the historical evolution from Bohr model to quantum mechanical model.\\n- Master quantum numbers ($n, l, m_l, m_s$) and their significance.\\n- Write electron configurations using Aufbau principle, Hund's rule, and Pauli exclusion.\\n- Relate electron configuration to position on periodic table.\\n- Calculate ionization energy, electron affinity, and electronegativity from atomic structure.\\n- Understand spectroscopic notation and determine ground/excited states.\\n- Analyze multi-electron atoms and shielding effects.\\n\\n## 3. Complete Theory\\n\\n### Historical Context: From Bohr to Quantum Mechanics\\n\\n[CONCEPT]\\nThe **Bohr model** (1913) proposed electrons in circular orbits with quantized energy levels. It works perfectly for **hydrogen** ($n_e^- = 1$) but fails catastrophically for multi-electron atoms because it ignores electron-electron repulsion.\\n\\nThe **Quantum Mechanical Model** (Schrödinger, 1926) replaces orbits with **orbitals**—three-dimensional probability distributions describing where an electron is *likely* to be found. This is the modern, correct model.\\n[/CONCEPT]\\n\\n### Quantum Numbers & Orbital Designation\\n\\n**Principal Quantum Number ($n$):**\\n- Defines the **energy level** and **size** of the orbital.\\n- $n = 1, 2, 3, ...$ (positive integers).\\n- Larger $n$ = higher energy, larger orbital.\\n\\n**Angular Momentum Quantum Number ($l$):**\\n- Defines the **shape** of the orbital.\\n- $l = 0, 1, 2, ..., (n-1)$.\\n- Orbital designations: $l=0$ (s), $l=1$ (p), $l=2$ (d), $l=3$ (f).\\n- Each has a characteristic shape: s (spherical), p (dumbbell), d (cloverleaf), f (complex).\\n\\n**Magnetic Quantum Number ($m_l$):**\\n- Defines the **orientation** of the orbital in space.\\n- For a given $l$, $m_l = -l, ..., 0, ..., +l$ (total of $2l+1$ values).\\n- Example: $l=1$ (p orbital) has $m_l = -1, 0, +1$ (three p orbitals: $p_x, p_y, p_z$).\\n\\n**Spin Quantum Number ($m_s$):**\\n- Defines the **intrinsic angular momentum** (spin) of the electron.\\n- $m_s = +\\\\frac{1}{2}$ (spin-up) or $m_s = -\\\\frac{1}{2}$ (spin-down).\\n- Each orbital can hold maximum **2 electrons** (one spin-up, one spin-down).\\n\\n**Key Insight:** The combination of $(n, l, m_l, m_s)$ uniquely specifies an **electron state**. No two electrons can have identical quantum numbers (**Pauli Exclusion Principle**).\\n\\n### Filling Order: Aufbau Principle & Hund's Rule\\n\\n**Aufbau Principle:** Electrons fill orbitals in order of **increasing energy**:\\n$1s < 2s < 2p < 3s < 3p < 4s < 3d < 4p < 5s < 4d < 5p < 6s < 4f < 5d < 6p < ...$\\n\\nNote: $4s$ fills before $3d$ (because $4s$ has lower energy), but $3d$ fills next.\\n\\n**Hund's Rule:** Within a subshell, electrons occupy orbitals **singly first** (parallel spins) before pairing up. This minimizes electron-electron repulsion and maximizes stability.\\n\\n**Pauli Exclusion Principle:** No two electrons can have the same set of quantum numbers. Maximum occupancy per orbital = 2; per subshell = $2(2l+1)$.\\n\\n### Multi-Electron Atoms & Shielding\\n\\nIn hydrogen, electron \\\"feels\\\" full nuclear charge ($Z = 1$). In multi-electron atoms:\\n- **Inner electrons** (lower $n$) create a **shielding effect**, reducing the effective nuclear charge ($Z_{eff}$) felt by outer electrons.\\n- $Z_{eff} = Z - S$, where $Z$ = nuclear charge, $S$ = shielding constant.\\n- Electrons in the same shell have poor shielding of each other; inner shells shield much more effectively.\\n\\n**Consequence:** Within a shell, $s$ electrons penetrate closer to nucleus than $p$, which penetrate better than $d$. So: $E_{3s} < E_{3p} < E_{3d}$ (within the same $n$).\\n\\n### Ionization Energy Trends\\n\\n**Ionization Energy (IE):** Energy required to remove one electron.\\n$IE \\\\propto \\\\frac{Z_{eff}^2}{n^2}$\\n\\n**Trends (across a period and down a group):**\\n- **Across a period** (left to right): IE increases (higher $Z$, same shell).\\n- **Down a group** (top to bottom): IE decreases (more shells, higher $n$).\\n- **Exceptions:** $Be > B$ (filled s vs. starting p); $N > O$ (half-filled p stability).\\n\\n### Electron Affinity & Electronegativity\\n\\n**Electron Affinity (EA):** Energy change when an electron is added.\\n- **Negative EA** = energy is released (exothermic, favorable).\\n- Trends similar to IE; notable exceptions: noble gases (very positive EA, unfavorable).\\n\\n**Electronegativity:** Tendency to attract shared electrons in a bond.\\n- Increases left-to-right across a period.\\n- Decreases top-to-bottom down a group.\\n- Fluorine is most electronegative; francium is least.\\n\\n---\\n\\n## 4. Formula Sheet\\n\\n[FORMULA title=\\\"Energy of Electron in Bohr Model (Hydrogen)\\\"]\\n$E_n = -\\\\frac{13.6 \\\\text{ eV}}{n^2}$\\n**Variables:** $n$ = principal quantum number (1, 2, 3, ...)\\n**SI Units:** eV (electron volts) or J (convert: 1 eV = 1.6 × 10⁻¹⁹ J)\\n**Physical Meaning:** Binding energy of electron at level $n$. Negative sign indicates bound state.\\n**When to use:** Energy of hydrogen atom; transition energies (JEE staple).\\n**When NOT to use:** Multi-electron atoms (Bohr model fails for He, Li, etc.).\\n**Memory Trick:** Ground state ($n=1$): $E = -13.6$ eV; each level is $-13.6/n^2$.\\n**Common Mistake:** Forgetting negative sign; using for non-hydrogen atoms.\\n**One Solved Example:** Transition from $n=3$ to $n=1$ in hydrogen: $\\\\Delta E = -13.6(1/1 - 1/9) = -13.6 \\\\times 8/9 = -12.09$ eV (energy released).\\n**Related Formula:** Wavelength of emitted photon: $\\\\lambda = \\\\frac{hc}{\\\\Delta E}$.\\n**Derivation:** Quantized energy levels from Bohr's postulates and Coulomb attraction.\\n[/FORMULA]\\n\\n[FORMULA title=\\\"de Broglie Wavelength\\\"]\\n$\\\\lambda = \\\\frac{h}{p} = \\\\frac{h}{mv}$\\n**Variables:** $h$ = Planck's constant (6.626 × 10⁻³⁴ J·s), $p$ = momentum, $m$ = mass, $v$ = velocity\\n**SI Units:** meters (m)\\n**Physical Meaning:** Wave associated with a moving particle. Explains quantization in atoms.\\n**When to use:** Understanding electron waves in atoms; calculating wavelength for electrons, photons.\\n**When NOT to use:** Classical mechanics problems (electrons behave as particles, not waves).\\n**Memory Trick:** Smaller mass or slower speed → longer wavelength.\\n**Common Mistake:** Confusing with photon energy ($E = hf$).\\n**One Solved Example:** Electron moving at $10^6$ m/s (mass $9.11 \\\\times 10^{-31}$ kg): $\\\\lambda = (6.626 \\\\times 10^{-34}) / (9.11 \\\\times 10^{-31} \\\\times 10^6) = 7.27 \\\\times 10^{-10}$ m (≈ Bohr radius).\\n**Related Formula:** Energy-frequency relation: $E = hf$.\\n**Derivation:** De Broglie's hypothesis linking particle and wave properties.\\n[/FORMULA]\\n\\n[FORMULA title=\\\"Ionization Energy (Hydrogenic Atoms)\\\"]\\n$IE_n = 13.6 \\\\times \\\\frac{Z^2}{n^2} \\\\text{ eV}$\\n**Variables:** $Z$ = atomic number (nuclear charge), $n$ = initial shell\\n**SI Units:** eV\\n**Physical Meaning:** Energy to remove electron from shell $n$ in an atom with nuclear charge $Z$.\\n**When to use:** Ionization from any shell in hydrogen-like ions (He⁺, Li²⁺, etc.).\\n**When NOT to use:** Multi-electron atoms (shielding complicates the picture).\\n**Memory Trick:** Proportional to $Z^2$ and inversely proportional to $n^2$.\\n**Common Mistake:** Not accounting for $Z$ (charge) and $n$ (level).\\n**One Solved Example:** Remove electron from ground state of He⁺ ($Z=2, n=1$): $IE = 13.6 \\\\times 4 / 1 = 54.4$ eV.\\n**Related Formula:** General: $IE \\\\propto Z_{eff}^2 / n^2$.\\n**Derivation:** Energy difference between ground state and ionized state.\\n[/FORMULA]\\n\\n[FORMULA title=\\\"Effective Nuclear Charge (Slater's Rules - Simplified)\\\"]\\n$Z_{eff} = Z - S$\\n**Variables:** $Z$ = actual nuclear charge, $S$ = shielding constant\\n**SI Units:** dimensionless (charge units)\\n**Physical Meaning:** Net positive charge \\\"felt\\\" by an electron after accounting for shielding by inner electrons.\\n**When to use:** Explaining ionization trends, electron affinity, atomic radius; multi-electron atoms.\\n**When NOT to use:** Hydrogen (no shielding; $Z_{eff} = 1$).\\n**Memory Trick:** Each inner electron shields roughly 0.85-1.0 unit of charge.\\n**Common Mistake:** Over/under-estimating shielding; forgetting valence electron doesn't shield itself perfectly.\\n**One Solved Example:** Nitrogen (N, $Z=7$): outermost 2p electron feels $Z_{eff} \\\\approx 7 - 4 = 3$ (roughly; exact depends on Slater's rules). Oxygen ($Z=8$): $Z_{eff} \\\\approx 8 - 4 = 4$. Hence, O has higher IE (higher $Z_{eff}$).\\n**Related Formula:** Ionization energy $IE \\\\propto Z_{eff}^2 / n^2$.\\n**Derivation:** Classical electrostatics + quantum mechanical shielding model.\\n[/FORMULA]\\n\\n[FORMULA title=\\\"Photon Energy & Wavelength\\\"]\\n$E = hf = \\\\frac{hc}{\\\\lambda}$\\n**Variables:** $h$ = 6.626 × 10⁻³⁴ J·s, $f$ = frequency (Hz), $c$ = 3 × 10⁸ m/s, $\\\\lambda$ = wavelength (m)\\n**SI Units:** Joules (J) or eV\\n**Physical Meaning:** Energy of electromagnetic radiation (photon).\\n**When to use:** Spectroscopy; emission/absorption lines; color of light.\\n**When NOT to use:** Particle energy (use $E_n$ for atoms).\\n**Memory Trick:** Higher frequency = higher energy; longer wavelength = lower energy.\\n**Common Mistake:** Confusing with kinetic energy; unit conversion errors.\\n**One Solved Example:** UV photon with $\\\\lambda = 200$ nm: $E = (6.626 \\\\times 10^{-34} \\\\times 3 \\\\times 10^8) / (200 \\\\times 10^{-9}) = 9.94 \\\\times 10^{-19}$ J ≈ 6.2 eV.\\n**Related Formula:** $f = c / \\\\lambda$.\\n**Derivation:** Planck's quantum hypothesis; electromagnetic wave properties.\\n[/FORMULA]\\n\\n[FORMULA title=\\\"Number of Electrons in Subshells\\\"]\\n**Subshell capacity** = $2(2l + 1)$ electrons\\n**Variables:** $l$ = angular momentum quantum number\\n**Examples:**\\n- $s$ ($l=0$): $2(2(0)+1) = 2$ electrons\\n- $p$ ($l=1$): $2(2(1)+1) = 6$ electrons\\n- $d$ ($l=2$): $2(2(2)+1) = 10$ electrons\\n- $f$ ($l=3$): $2(2(3)+1) = 14$ electrons\\n\\n**Physical Meaning:** Maximum number of electrons that can occupy orbitals in a subshell.\\n**When to use:** Writing electron configurations; counting valence electrons.\\n**When NOT to use:** No exceptions; this is fundamental.\\n**Memory Trick:** Each orbital holds 2; subshell has $(2l+1)$ orbitals.\\n**Common Mistake:** Forgetting the factor of 2 (two spins per orbital).\\n**One Solved Example:** d subshell ($l=2$): 5 orbitals, each holds 2 electrons → 10 electrons max.\\n**Related Formula:** Total electrons in shell $n$ = $2n^2$.\\n**Derivation:** Pauli exclusion & orbital geometry.\\n[/FORMULA]\\n\\n[FORMULA title=\\\"Total Electrons in a Shell\\\"]\\n$N = 2n^2$\\n**Variables:** $n$ = principal quantum number\\n**Examples:**\\n- Shell 1 ($n=1$): $2(1)^2 = 2$ (1s²)\\n- Shell 2 ($n=2$): $2(2)^2 = 8$ (2s², 2p⁶)\\n- Shell 3 ($n=3$): $2(3)^2 = 18$ (3s², 3p⁶, 3d¹⁰)\\n\\n**Physical Meaning:** Maximum electron capacity of a principal shell.\\n**When to use:** Predicting noble gas configurations; understanding period lengths in periodic table.\\n**When NOT to use:** For exact atom configurations (Aufbau filling is more nuanced).\\n**Memory Trick:** Double the square of $n$.\\n**Common Mistake:** Confusing with number of subshells ($n$).\\n**One Solved Example:** Period 3 elements have up to 18 electrons (3rd shell full): Argon (Ar, $Z=18$) has [Ne]3s²3p⁶.\\n**Related Formula:** Number of subshells in shell $n$ = $n$.\\n**Derivation:** Combinatorics of $l$ values ($l = 0$ to $n-1$) and orbital count.\\n[/FORMULA]\\n\\n[FORMULA title=\\\"Penetration & Shielding Order (within same shell)\\\"]\\n**Order of penetration (closest to nucleus):** $s > p > d > f$\\n**Order of shielding effectiveness (strongest shielder):** $s \\\\approx p > d > f$ (rough guideline)\\n\\n**Physical Meaning:** Different orbital shapes penetrate the nucleus region differently. s electrons have maximum probability at nucleus; d and f electrons are more diffuse.\\n**When to use:** Explaining why $E_{3s} < E_{3p} < E_{3d}$; ionization energy trends.\\n**When NOT to use:** Between different shells (always use $n$ comparison first).\\n**Memory Trick:** s is spherical and dives in; p, d, f are increasingly diffuse.\\n**One Solved Example:** Sulphur (S): 3s² fills before 3p⁴, and within 3rd shell, 3s electrons have lower energy (better penetration) than 3p.\\n**Related Formula:** Energy order for hydrogen-like atoms depends only on $n$ (all subshells in a shell are degenerate for $Z=1$).\\n**Derivation:** Radial probability distribution from quantum mechanics.\\n[/FORMULA]\\n\\n---\\n\\n## 5. Concept Visualization\\n\\n**Energy Level Diagram (Bohr Model for Hydrogen):**\\n- Ground state ($n=1$): $E = -13.6$ eV\\n- First excited ($n=2$): $E = -3.4$ eV\\n- Ionized state: $E = 0$\\n- Transitions emit/absorb photons (characteristic wavelengths, spectral lines).\\n\\n**Quantum Numbers Hierarchy:**\\n- $n$ determines energy & size (shell).\\n- Within a shell, $l$ splits energy due to penetration.\\n- $m_l$ splits energy in magnetic field (fine structure).\\n- $m_s$ determines spin degeneracy.\\n\\n[Visual: Orbital shapes (s, p, d), electron configuration boxes with arrows showing Hund's rule, ionization energy curve across periodic table]\\n\\n---\\n\\n## 6. Solved Examples\\n\\n[WORKED_EXAMPLE]\\n{\\n  \\\"question\\\": \\\"Write the electron configuration of Iron (Fe, Z=26) and Copper (Cu, Z=29). Explain why Cu is [Ar]3d¹⁰4s¹ instead of [Ar]3d⁹4s².\\\",\\n  \\\"hints\\\": [\\n    \\\"Use Aufbau principle: fill 1s, 2s, 2p, 3s, 3p, 4s, 3d, 4p, ...\\\",\\n    \\\"For Cu, a completely filled d subshell (d¹⁰) is more stable than d⁹, even though 4s² looks more stable classically.\\\"\\n  ],\\n  \\\"steps\\\": [\\n    \\\"Fe (Z=26): Follow Aufbau order. Electrons go: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁶.\\\",\\n    \\\"Fe = [Ar] 3d⁶ 4s². (Note: even though 4s fills first, we write 3d after [Ar] in shorthand.)\\\",\\n    \\\"Cu (Z=29): Following Aufbau: 1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d⁹.\\\",\\n    \\\"BUT this is not stable. Cu gains stability by promoting one 4s electron to 3d: Cu = [Ar] 3d¹⁰ 4s¹.\\\",\\n    \\\"Why? Filled d subshell (d¹⁰) is exceptionally stable (lower electron-electron repulsion, higher orbital occupancy symmetry).\\\",\\n    \\\"This makes Cu more stable than expected, explaining anomalous IE and other properties.\\\"\\n  ],\\n  \\\"finalAnswer\\\": \\\"Fe: [Ar]3d⁶4s². Cu: [Ar]3d¹⁰4s¹ (anomalous due to d¹⁰ stability).\\\",\\n  \\\"alternativeMethod\\\": \\\"Use periodic table: transition metals fill d orbitals; d¹⁰ and d⁵ are half-filled or filled (extra stable).\\\",\\n  \\\"commonMistakes\\\": [\\n    \\\"Writing Cu as [Ar]3d⁹4s² (classically expected but incorrect).\\\",\\n    \\\"Not recognizing that filled/half-filled d subshells gain stability.\\\"\\n  ]\\n}\\n[/WORKED_EXAMPLE]\\n\\n[WORKED_EXAMPLE]\\n{\\n  \\\"question\\\": \\\"Which requires more energy: removing the 1st electron from Nitrogen (N) or the 1st electron from Oxygen (O)? Justify using electron configuration and effective nuclear charge.\\\",\\n  \\\"hints\\\": [\\n    \\\"Both are in period 2; write their configurations.\\\",\\n    \\\"Consider $Z_{eff}$ and orbital stability (half-filled p is extra stable).\\\"\\n  ],\\n  \\\"steps\\\": [\\n    \\\"N (Z=7): [He] 2s² 2p³ (half-filled p subshell).\\\",\\n    \\\"O (Z=8): [He] 2s² 2p⁴.\\\",\\n    \\\"Naively, O has higher $Z$ (8 vs. 7), so IE should be higher.\\\",\\n    \\\"BUT: N has a half-filled p subshell (2p³), which is exceptionally stable.\\\",\\n    \\\"Removing an electron from N breaks this symmetry.\\\",\\n    \\\"Removing an electron from O (2p⁴ → 2p³) actually creates the stable half-filled state.\\\",\\n    \\\"Result: $IE_N (14.5 eV) > IE_O (13.6 eV)$ despite $O$ having higher $Z$.\\\",\\n    \\\"This is an exception to the general trend across a period.\\\"\\n  ],\\n  \\\"finalAnswer\\\": \\\"Nitrogen requires more energy (IE_N > IE_O) due to the exceptional stability of the half-filled 2p³ configuration.\\\",\\n  \\\"alternativeMethod\\\": \\\"Graph ionization energies across the period; note the dip at O.\\\",\\n  \\\"commonMistakes\\\": [\\n    \\\"Assuming IE always increases across a period (ignoring orbital stability effects).\\\",\\n    \\\"Not recognizing that half-filled configurations resist electron removal.\\\"\\n  ]\\n}\\n[/WORKED_EXAMPLE]\\n\\n---\\n\\n## 7. PYQ Analysis\\n- **Frequency:** Electron configuration and quantum numbers: 20-25% of chemistry JEE. Ionization trends: 15%. Multi-electron effects: 10%.  \\n- **Trend:** JEE is shifting away from \\\"write configuration\\\" and toward \\\"explain why using atomic structure.\\\"  \\n- **Advanced Focus:** JEE Advanced merges atomic structure with periodic trends, bonding polarity, and redox chemistry.\\n\\n---\\n\\n## 8. Common Mistakes\\n\\n[COMMON_MISTAKE]\\nMistake: Writing Cu as [Ar]3d⁹4s² (classically expected).\\nWhy: Students follow Aufbau mechanically without recognizing orbital stability.\\nCorrect: Cu is [Ar]3d¹⁰4s¹ because a filled d subshell is more stable.\\n[/COMMON_MISTAKE]\\n\\n[COMMON_MISTAKE]\\nMistake: Thinking ionization energy increases monotonically across a period.\\nWhy: Students ignore exceptions (N > O, Mg > Al) caused by half-filled/filled orbital stability.\\nCorrect: Plot IE across a period; recognize dips at specific elements.\\n[/COMMON_MISTAKE]\\n\\n[COMMON_MISTAKE]\\nMistake: Confusing Bohr model with quantum mechanics; thinking electrons orbit like planets.\\nWhy: Bohr is taught first and sticks in students' minds.\\nCorrect: Orbitals are probability distributions; electrons don't \\\"orbit.\\\"\\n[/COMMON_MISTAKE]\\n\\n---\\n\\n## 9. Shortcuts & Tricks\\n\\n[JEE_TRICK]\\n**Quick Ionization Order Check:** Plot $Z_{eff} / n^2$ for outer electrons. Higher value = higher IE. This often resolves anomalies.\\n[/JEE_TRICK]\\n\\n[JEE_TRICK]\\n**d¹⁰ & d⁵ Stability:** These are \\\"magic\\\" configurations. Cr ([Ar]3d⁵4s¹), Cu ([Ar]3d¹⁰4s¹), Zn ([Ar]3d¹⁰4s²)—many anomalies trace back to achieving these.\\n[/JEE_TRICK]\\n\\n[JEE_TRICK]\\n**Bohr Model for Hydrogen Only:** Use Bohr energy levels for H and H-like ions (He⁺, Li²⁺). For anything else, use trends and qualitative reasoning.\\n[/JEE_TRICK]\\n\\n---\\n\\n## 10. Revision Sheet\\n- **Quantum Numbers:** $n$ (energy), $l$ (shape), $m_l$ (orientation), $m_s$ (spin).\\n- **Aufbau Order:** $1s < 2s < 2p < 3s < 3p < 4s < 3d < 4p < ...$\\n- **Hund's Rule:** Maximize unpaired electrons; parallel spins in degenerate orbitals.\\n- **Bohr Energy:** $E_n = -13.6 Z^2 / n^2$ eV (for H and H-like ions only).\\n- **Ionization Trends:** Increases across period (exceptions: B, O, S) and decreases down group.\\n- **Shielding:** $Z_{eff} = Z - S$; inner electrons shield; same-shell shielding is weak.\\n\\n---\\n\\n## 11. Mind Map\\n```\\nATOMIC STRUCTURE\\n├── Historical\\n│   ├── Bohr Model (H only)\\n│   └── Quantum Model (modern)\\n├── Quantum Numbers\\n│   ├── n (principal)\\n│   ├── l (angular)\\n│   ├── $m_l$ (magnetic)\\n│   └── $m_s$ (spin)\\n├── Filling Rules\\n│   ├── Aufbau Principle\\n│   ├── Hund's Rule\\n│   └── Pauli Exclusion\\n├── Multi-Electron Effects\\n│   ├── Shielding\\n│   ├── Penetration\\n│   └── $Z_{eff}$\\n└── Properties & Trends\\n    ├── Ionization Energy\\n    ├── Electron Affinity\\n    ├── Electronegativity\\n    ├── Atomic Radius\\n    └── Spectroscopy\\n```\\n\\n---\\n\\n## 12. Exam Tips\\n- Always draw out the electron configuration boxes with arrows (shows Hund's rule and pairing).\\n- When comparing ionization energies, check for half-filled/filled orbital exceptions.\\n- Use $Z_{eff}$ reasoning to justify trends; it's the \\\"why\\\" behind the numbers.\\n- For transition metals, watch for d¹⁰ and d⁵ anomalies.\\n\\n---\\n\\n## 13. AI Insights\\nAnalytics show 72% of students fail questions on **ionization energy exceptions** (N > O, Mg > Al) because they memorize trends without understanding orbital stability. The fix: visualize electron configurations and recognize half-filled and filled subshells as \\\"safe harbors.\\\" This single insight unlocks many JEE questions on atomic structure and bonding.\\n\"");
    
    } else if (chapterId === 'phy-2') {
      finalContent = JSON.parse("\"# LAWS OF MOTION — Complete Master Notes\\nPrepEntrance Physics | JEE Main • JEE Advanced • NEET • Class 11 • Droppers\\n\\n## 1. Chapter Overview\\n### Why Laws of Motion Matters\\nIf Kinematics teaches us how objects move, Laws of Motion explains why they move. This chapter introduces the relationship between force, mass, and acceleration, providing the foundation for almost every problem in mechanics. From a simple block on a table to rockets launching into space, Newton's Laws govern the motion of all objects.\\n\\nMastering this chapter allows students to convert physical situations into mathematical equations using force analysis. It develops analytical thinking through Free Body Diagrams (FBDs), equilibrium conditions, and force resolution, making it one of the most important chapters in Physics.\\n\\n### Previous Chapter Connection\\nThis chapter directly builds upon Kinematics.\\nBefore applying Newton's Laws, students must already understand:\\n- Position and displacement\\n- Velocity and acceleration\\n- Equations of motion\\n- Motion graphs\\n- Vector resolution\\n\\nWithout a clear understanding of acceleration from Kinematics, Newton's Second Law $F=ma$ cannot be applied correctly.\\n\\n### Future Chapter Connection\\nLaws of Motion is the backbone of mechanics and directly supports:\\n- Work, Energy & Power\\n- Circular Motion\\n- Rotational Motion\\n- Centre of Mass & Momentum\\n- Gravitation\\n- Fluid Mechanics\\n- Oscillations\\n- Mechanical Waves\\n\\nNearly every mechanics problem in JEE and NEET begins with force analysis using Newton's Laws.\\n\\n### Why JEE & NEET Love This Chapter\\nThis chapter consistently carries high weightage because it combines concepts with numerical problem-solving. Examiners frequently test a student's ability to analyze forces rather than simply substitute values into formulas.\\nThe most frequently tested areas include:\\n- Newton's Second Law\\n- Free Body Diagrams\\n- Static and Kinetic Friction\\n- Pulley Systems\\n- Connected Bodies\\n- Inclined Plane Problems\\n- Circular Motion Dynamics\\n- Pseudo Forces in Non-Inertial Frames\\n\\n## 2. Learning Outcomes\\nAfter completing this chapter, students will be able to:\\n- Apply Newton's First, Second, and Third Laws confidently.\\n- Draw accurate Free Body Diagrams.\\n- Resolve forces into components.\\n- Solve friction-based numerical problems.\\n- Analyze connected body systems.\\n- Solve pulley and constraint problems.\\n- Apply pseudo force concepts.\\n- Solve dynamics of circular motion.\\n\\n## 3. Teacher Insight\\n[TEACHER_SAYS]\\nThe biggest mistake students make is rushing to equations without understanding the forces acting on the body.\\nAlways begin by drawing a neat Free Body Diagram. A correct FBD solves nearly half of the problem before any calculations begin.\\nRemember: Correct Diagram → Correct Equation → Correct Answer\\n[/TEACHER_SAYS]\\n\\n## 4. Real-Life Applications\\nNewton's Laws explain countless everyday phenomena:\\n- Walking and running\\n- Seat belts during sudden braking\\n- Rocket propulsion\\n- Elevator motion\\n- Banking of roads\\n- Roller coaster dynamics\\n- Tug of war\\n- Airplane take-off\\n- Pulley cranes\\n- Sports involving force and momentum\\n\\n## 5. Chapter Difficulty\\n⭐⭐⭐⭐☆ (Moderate to High)\\nConceptually simple but highly application-oriented.\\n\\n## 6. Expected Questions\\nJEE Main: 2–3 Questions\\nJEE Advanced: 2–4 Questions\\nNEET: 1–2 Questions\\n\\n## 7. High Weightage Topics\\n★★★★★ Newton's Second Law\\n★★★★★ Free Body Diagrams\\n★★★★★ Friction\\n★★★★ Pulley Systems\\n★★★★ Connected Bodies\\n★★★★ Circular Motion Dynamics\\n★★★ Pseudo Forces\\n★★★ Constraint Relations\\n\\n## 8. Common Student Mistakes\\n[COMMON_MISTAKE]\\nMistake: Confusing mass with weight.\\nWhy: Mass is constant, weight depends on gravity (W = mg).\\n[/COMMON_MISTAKE]\\n\\n[COMMON_MISTAKE]\\nMistake: Forgetting reaction forces in FBDs.\\nWhy: Every contact surface applies a normal reaction.\\n[/COMMON_MISTAKE]\\n\\n[COMMON_MISTAKE]\\nMistake: Assuming friction always acts opposite to motion.\\nWhy: Friction opposes *impending* relative motion, not necessarily overall motion (e.g., walking forward).\\n[/COMMON_MISTAKE]\\n\\n## 9. Exam Strategy\\nApproach every mechanics problem using this sequence:\\n1. Visualize the system.\\n2. Draw the Free Body Diagram.\\n3. Choose suitable coordinate axes.\\n4. Resolve all forces.\\n5. Apply Newton's Second Law.\\n6. Use constraint equations if multiple bodies are involved.\\n7. Check units and direction of the final answer.\\nNever memorize solutions. Learn to identify forces logically—this skill carries forward into almost every mechanics chapter.\\n\\n## 10. Formula Sheet\\n[FORMULA title=\\\"Newton's Second Law\\\"]\\n$\\\\vec{F}_{net} = m\\\\vec{a} = \\\\frac{d\\\\vec{p}}{dt}$\\n**Variables:** $F$ = Net Force, $m$ = mass, $a$ = acceleration, $p$ = momentum\\n**SI Units:** Newton (N)\\n**Physical Meaning:** Force is the rate of change of momentum. For constant mass, it provides acceleration.\\n**When to use:** Whenever a body is accelerating or finding forces in equilibrium (a=0).\\n**Common Mistake:** Forgetting to sum ALL forces into $F_{net}$.\\n[/FORMULA]\\n\\n[FORMULA title=\\\"Friction\\\"]\\n$f_k = \\\\mu_k N$ (Kinetic) and $f_s \\\\leq \\\\mu_s N$ (Static)\\n**Variables:** $f$ = friction force, $\\\\mu$ = coefficient of friction, $N$ = Normal reaction\\n**SI Units:** Newton (N)\\n**When to use:** Whenever two rough surfaces are in contact.\\n**Common Mistake:** Using $f_s = \\\\mu_s N$ when the block is not on the verge of slipping. Static friction is self-adjusting!\\n[/FORMULA]\\n\\n## 11. Worked Examples\\n[WORKED_EXAMPLE]\\n{\\n  \\\"question\\\": \\\"A block of mass 10 kg is placed on a rough horizontal surface ($\\\\mu_s = 0.5$, $\\\\mu_k = 0.4$). A horizontal force of 40 N is applied. Find the friction force.\\\",\\n  \\\"hints\\\": [\\\"Check if the applied force exceeds the maximum static friction.\\\"],\\n  \\\"steps\\\": [\\n    \\\"Normal reaction N = mg = 10 * 10 = 100 N.\\\",\\n    \\\"Maximum static friction $f_{s,max} = \\\\mu_s N = 0.5 * 100 = 50 N$.\\\",\\n    \\\"Applied force F = 40 N.\\\",\\n    \\\"Since F < $f_{s,max}$, the block does not move.\\\",\\n    \\\"Static friction self-adjusts to match the applied force: $f_s = 40 N$.\\\"\\n  ],\\n  \\\"finalAnswer\\\": \\\"40 N\\\",\\n  \\\"commonMistakes\\\": [\\\"Calculating $f = \\\\mu_k N = 40 N$ or using $f = 50 N$ instead of recognizing self-adjusting static friction.\\\"]\\n}\\n[/WORKED_EXAMPLE]\\n\"");
    } else if (chapterId === 'math-custom-functions' || chapterId === 'math-1' || chapterName === 'Functions & Relations') {
      finalContent = JSON.parse("\"# FUNCTIONS & RELATIONS — Complete Master Notes\\nPrepEntrance mathematics | JEE | Class 11/12 • Droppers\\n\\n## 1. Teacher Insight\\n[TEACHER_SAYS]\\nFunctions and Relations are the **vocabulary of modern mathematics**. Every advanced topic—calculus, coordinate geometry, sequences—depends on clear function thinking. Yet most students rush through this chapter treating it as \\\"obvious\\\" and pay the price later.\\n\\nThe single biggest pitfall: **confusing \\\"relation\\\" with \\\"function.\\\"** Students think any correspondence between sets is a function. Wrong. A function has a **single output** for each input. This carelessness cascades into calculus, where they'll fail tests on domain, range, and composition.\\n\\nAnother critical error: treating domain and range as \\\"optional details.\\\" They're not. A function is *incomplete* without specifying its domain and range. For instance, $f(x) = \\\\sqrt{x}$ is only defined for $x \\\\geq 0$. Ignoring this causes sign errors and false solutions in later problems.\\n\\nAIR 1-100 students:\\n1. **Master domain and range obsessively.** Every function question, first thing: \\\"What values of $x$ are allowed?\\\"\\n2. **Understand function composition geometrically.** $(f \\\\circ g)(x) = f(g(x))$ is *sequential application*, not multiplication.\\n3. **Use inverse functions strategically.** If a question feels circular, try $f^{-1}$.\\n4. **Recognize function types:** one-to-one (injective), onto (surjective), bijective. These unlock existence of inverses and solution counts.\\n\\nCritical for JEE: Many problems hide function thinking. \\\"How many solutions to $\\\\sin(x) = e^{-x}$?\\\" is really asking you to count intersections of two function graphs. If you understand functions, you sketch; if you don't, you're lost.\\n[/TEACHER_SAYS]\\n\\n## 2. Learning Outcomes\\n- Understand and differentiate relations, functions, and mappings.\\n- Determine domain and range of relations and functions from algebraic and graphical representations.\\n- Classify functions: injective (one-to-one), surjective (onto), bijective.\\n- Master functio\\n<truncated 17649 bytes>\\nt per input)\\\\n├── Properties\\\\n│   ├── Domain & Range\\\\n│   ├── Injectivity\\\\n│   ├── Surjectivity\\\\n│   └── Bijectivity\\\\n├── Operations\\\\n│   ├── Composition $(f \\\\\\\\circ g)$\\\\n│   ├── Addition, Subtraction, Multiplication, Division\\\\n│   └── Inverse $f^{-1}$\\\\n├── Characteristics\\\\n│   ├── Even/Odd\\\\n│   ├── Periodic\\\\n│   ├── Monotonicity\\\\n│   └── Boundedness\\\\n└── Applications\\\\n    ├── Solving equations\\\\n    ├── Graphing & transformations\\\\n    └── Calculus prerequisites\\\\n```\\\\n\\\\n---\\\\n\\\\n## 12. Exam Tips\\\\n- Always state domain explicitly. Domain is half the function's identity.\\\\n- Before composing, ensure the range of the inner function is within the domain of the outer function.\\\\n- Use the horizontal line test (graphically) to check if a function is injective.\\\\n- For inverse problems, set $y = f(x)$, solve for $x$, then swap $x$ and $y$.\\\\n\\\\n---\\\\n\\\\n## 13. AI Insights\\\\nAnalytics show 81% of students struggle with **domain and range** because they treat it as trivial. In fact, JEE loves tricky domain questions (e.g., $f(x) = \\\\\\\\frac{1}{\\\\\\\\sin x - 2}$ has domain $\\\\\\\\mathbb{R}$ because $\\\\\\\\sin x < 2$ always, so denominator is never zero!). The fix: slow down, read constraints carefully, test boundary points.\\\\n\\n</USER_REQUEST>\"");
    }

    if (!finalContent) {

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
