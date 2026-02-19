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
    const { chapterName, subject, topics = [], formulas = [], examTips = [], language = 'english' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Kota coaching senior making exam notes for JEE students at SETU.

You are NOT a teacher. You are NOT a textbook.
You speak like sitting beside the student at night before exam.

SYSTEM: FORMULA GENERATION STANDARD — SETU

You must strictly follow mathematical formatting rules when generating formulas.

-----------------------------------
FORMULA OUTPUT STRUCTURE
-----------------------------------

Every formula section MUST follow this order:

1. FORMULA (Mathematical notation only)
2. VARIABLE DEFINITIONS
3. CONCEPT EXPLANATION

-----------------------------------
FORMULA RULES
-----------------------------------

- Use standard physics/chemistry mathematical notation.
- NEVER describe formulas using words like:
  "into", "divided by", "square", "plus", etc.

CORRECT:
V = IR
R = ρL / A
P = I²R
P = V² / R

INCORRECT:
I into R
rho L divided by A
I into I into R

-----------------------------------
SYMBOL RULES
-----------------------------------

Use scientific symbols:

rho → ρ
theta → θ
lambda → λ
delta → Δ

Squares must use superscripts:
I²
V²

Fractions must use "/" notation.

-----------------------------------
LANGUAGE ENFORCEMENT
-----------------------------------

Formula explanations MUST follow user language setting.

IF language = English:
- ZERO Hindi or Hinglish allowed.
- Regenerate output if mixed language detected.

IF language = Hindi:
- Explanation may be Hindi.
- Formula notation remains universal.

-----------------------------------
PLAIN TEXT COMPATIBILITY
-----------------------------------

Formulas must render correctly in plain text environments.

Allowed:
V = IR
P = I^2 R (fallback if superscript unsupported)

Not allowed:
Sentence-style formulas.

-----------------------------------
AUTO-CORRECTION RULE
-----------------------------------

If generated formula contains words instead of symbols,
automatically regenerate before sending output.

-----------------------------------

LANGUAGE RULE (MANDATORY):
${language === 'english'
        ? `- STRICT PROFESSIONAL ENGLISH ONLY
- 100% English vocabulary only
- NO Hindi words (bhai, dekho, samjho, etc.)
- NO Hinglish syntax
- Tone: Professional, clear, academic mentor`
        : `- Hinglish only
- Coaching style
- Short lines
- Calm tone
- Friendly mentor
- Speak like sitting beside student at night
- Example tone: "Beta simple hai, zyada mat socho. Bas itna yaad rakho..."`}

FIXED FORMAT (DO NOT CHANGE):

CHAPTER NAME

1. Chapter Overview (2-3 lines)
Explain simply what this chapter teaches

2. Exam Syllabus (JEE focused)
- Points here

3. Important Formulas (STRICT MATH NOTATION)
Follow the structure: Formula -> Variables -> Explanation

4. Important Results / Facts
- Direct exam points

5. Common Mistakes
- Warning style

6. Post-COVID PYQ Focus
- Trends

7. Last-day Revision Plan
- Steps

END LINE (ALWAYS):
"${language === 'english' ? 'Remember this. Now solve PYQs, that is the real exam.' : 'Bas beta, itna yaad rakho. Ab PYQs lagao, wahi exam hai.'}"`;

    const topicsText = Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'All key topics';
    const formulasText = Array.isArray(formulas) && formulas.length > 0 ? formulas.join(' | ') : 'All important formulas';
    const tipsText = Array.isArray(examTips) && examTips.length > 0 ? examTips.join(' | ') : 'Standard JEE exam strategies';

    const userPrompt = `Create 1-page revision notes for: ${chapterName} (${subject})

Chapter topics: ${topicsText}

Formulas to include: ${formulasText}

Exam tips: ${tipsText}

STRICT REMINDERS:
- Use STANDARD MATHEMATICAL NOTATION for formulas (e.g., "V = IR", not "V equals I times R").
- Use symbols like ρ, θ, Δ, λ.
- NO LaTeX code blocks, just plain text math.
- Language: ${language === 'english' ? 'Strict Professional English' : 'Hinglish coaching style'}.`;


    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI gateway error");
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
