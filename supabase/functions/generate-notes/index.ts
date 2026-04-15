import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      chapterName, 
      subject, 
      topics = [], 
      smartMode = 'default', // 'beginner', 'advanced', 'formulas_only', 'mistakes_only', 'revision'
      language = 'hinglish', 
      examMode = 'JEE' 
    } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const isFoundation = examMode === 'Foundation' || examMode.toLowerCase().includes('foundation') || examMode.toLowerCase() === 'school';

    // ─── 1. PERSONA & TONE ─────────────────────
    let persona = "";
    if (isFoundation) {
      persona = `You are a CARING, FRIENDLY SCHOOL TEACHER creating NOTES for Class 6-10 students. Keep it very simple, engaging, and fun.`;
    } else {
      persona = `You are a TOP TIER KOTA COACHING FACULTY (like Allen/Resonance/FIITJEE). 
You are currently creating highly exam-oriented, competitive classroom notes for ${examMode} aspirants.
Your tone is like "Jeetu Bhaiya" — Friendly, sharp, no fluff, exceptionally clear, and slightly motivating.`;
    }

    // ─── 2. EXAM ADAPTATION ─────────────────────
    let examLogic = "";
    if (examMode === 'JEE') {
      examLogic = `- Deep conceptual clarity & Problem-solving approach.
- Include heavy derivations, mathematical shortcuts, and multi-step thinking.
- Focus heavily on highly-repeated PYQ traps from JEE Main / Advanced.`;
    } else if (examMode === 'NEET') {
      examLogic = `- Theory heavy & strict NCERT line-by-line focus.
- Describe critical diagrams vividly. 
- Include Memory tricks (mnemonics) for direct fact recall.
- Focus strictly on high-yield biology/chemistry points and fast physics calculations.`;
    } else if (examMode === 'CUET') {
      examLogic = `- Concise & fast revision oriented.
- Key facts, direct definitions, and MCQ-oriented bullet points.
- Speed-focused solving tricks.`;
    }

    // ─── 3. SMART MODES ────────────────────────
    let smartModeOverride = "";
    if (smartMode === 'beginner') {
      smartModeOverride = `CRITICAL: The student has requested 'Explain like beginner'. Break down the concepts extremely fundamentally. Use daily life examples and avoid jumping straight into advanced formulas. Explain the 'Why' before the 'How'.`;
    } else if (smartMode === 'advanced') {
      smartModeOverride = `CRITICAL: The student requested 'Advanced depth'. Skip basic definitions. Dive straight into edge cases, complex multi-concept application problems, and tricky PYQ exceptions.`;
    } else if (smartMode === 'formulas_only') {
      smartModeOverride = `CRITICAL: The student requested 'Only Formulas'. DO NOT output the full structure. ONLY output a highly crisp, formatted list of the equations, variables, SI units, and conditions of applicability. Nothing else.`;
    } else if (smartMode === 'mistakes_only') {
      smartModeOverride = `CRITICAL: The student requested 'Only Mistakes'. DO NOT output the full structure. ONLY output a detailed analysis of common traps, silly mistakes, and PYQ trick options related to this topic. Provide 'Wrong vs Right' examples.`;
    } else if (smartMode === 'revision') {
      smartModeOverride = `CRITICAL: The student requested '1 Min Revision'. DO NOT output the full structure. Condense the entire chapter into a brutal 1-minute read. Only the absolute highest-yield facts and one critical trick.`;
    }

    // ─── 4. LANGUAGE CONFIG ────────────────────
    const langRule = language.toLowerCase() === 'hinglish' ? 
      `- Use Hinglish (Student friendly). Examples: "Bhai yahan sabse common mistake ye hoti hai...", "Dekho dhyaan se..."` : 
      `- Use strict, professional English only. No Hinglish.`;

    const topicsText = Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'All key concepts';

    // ─── FULL SYSTEM PROMPT ────────────────────
    const systemPrompt = `${persona}
    
${examLogic}

${langRule}

${smartModeOverride}

${smartMode === 'default' ? `
═══════════════════════════════════
MANDATORY 7-POINT NOTES STRUCTURE
═══════════════════════════════════
You MUST format the output EXACTLY using the following markdown headers. Do not deviate.

## 1. 💡 Concept Explanation
[Clear, sharp instructor-style explanation. Core logic simply explained.]

## 2. 📋 Key Formulas & Points
[Bullet list of critical equations, units, or theory facts.]

## 3. 🎯 Important Tricks / Shortcuts
[Kota-level time-saving tricks. "Jugaad" methods where applicable.]

## 4. 📚 PYQ Pattern Insight
[What exactly does the examiner ask? E.g., "In the last 5 years, 80% of questions from here mix friction with circular motion..."]

## 5. ⚠️ Common Mistakes
[Where do students lose marks? Format: What's wrong → What's correct → Why.]

## 6. ✍️ Solved Examples
[2-3 highly targeted examples with step-by-step logic.]

## 7. ⚡ Quick Revision Summary
[Crisp bullet points to wrap it up.]
` : ""}

IMPORTANT MARKDOWN RULES:
1. NEVER use LaTeX like \(\) or \\[. Use standard unicode math: ✅ V = IR, ✅ x², ✅ (a+b)/c.
2. Structure carefully using strict ## headers.
3. Be friendly and motivating. Make it feel like top-tier coaching notes.
`;

    const userPrompt = `Generate the notes for Chapter: ${chapterName} (${subject}). 
Focus mainly on: ${topicsText}.
Exam Target: ${examMode}.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) throw new Error("Rate limit exceeded");
      if (response.status === 402) throw new Error("Credits exhausted");
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("generate-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
