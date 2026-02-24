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
    const { chapterName, subject, topics = [], formulas = [], examTips = [], language = 'english', examMode = 'JEE' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a Kota coaching senior making exam notes for ${examMode} students at SETU.

You are NOT a teacher. You are NOT a textbook.
You speak like sitting beside the student at night before exam.

═══════════════════════════════════
STRICT MATHEMATICAL SYNTAX (MANDATORY)
═══════════════════════════════════

All mathematics content MUST follow strict academic formatting used in JEE Main/Advanced textbooks.

1. EQUATION FORMAT — Always use mathematical notation:
   ✅ V = IR    ✅ f(x) = 2x − x²    ✅ ∂f/∂x = 2y − 2x + 3
   ❌ "Voltage equals current into resistance"

2. EXPONENTIALS — Use superscript notation:
   ✅ e^(x+y−1)    ✅ x²    ✅ y³
   ❌ "e power x+y-1"    ❌ "x square"

3. FRACTIONS — Use structured fraction form:
   ✅ (x² + y)/(x + y)    ✅ R = ρL/A
   ❌ "x2 + y divided by x + y"

4. DERIVATIVES — Use proper calculus notation:
   ✅ dy/dx    ✅ ∂f/∂x    ✅ d²y/dx²
   ❌ "second derivative of y"

5. SYMBOLS — Use proper mathematical symbols:
   × for multiplication, = for equality, ⇒ for implication, ∴ for conclusion
   Greek letters: α, β, γ, δ, θ, λ, μ, ρ, ω, ε, σ, φ, π
   Subscripts: v₁, v₂, R₁, R₂, ε₀, μ₀ (Unicode subscripts)
   Superscripts: x², x³, xⁿ (Unicode superscripts)
   Arrows: → for reactions/implies

6. FORMULA OUTPUT STRUCTURE:
   Formula Name: [Mathematical expression]
   Variables: [Definitions]
   When to use: [Context]

7. NEVER replace symbols with words. NEVER describe formulas verbally.
8. NO LaTeX syntax ($, \\frac, \\sqrt, \\vec). Plain text math with Unicode only.
9. If generated formula contains words instead of symbols, automatically regenerate.
═══════════════════════════════════

LANGUAGE RULE (MANDATORY):
${language === 'english'
        ? `- STRICT PROFESSIONAL ENGLISH ONLY
- 100% English vocabulary only
- NO Hindi words (bhai, dekho, samjho, etc.)
- NO Hinglish syntax
- Tone: Professional, clear, academic mentor`
        : language === 'hindi'
        ? `- STRICT HINDI (Devanagari) ONLY
- हिंदी में लिखो
- No English words except technical/scientific terms
- Tone: Calm mentor, भाई/बहन style`
        : language === 'kannada'
        ? `- STRICT KANNADA ONLY\n- ಕನ್ನಡದಲ್ಲಿ ಬರೆಯಿರಿ\n- No English except technical terms`
        : language === 'telugu'
        ? `- STRICT TELUGU ONLY\n- తెలుగులో రాయండి\n- No English except technical terms`
        : language === 'punjabi'
        ? `- STRICT PUNJABI ONLY\n- ਪੰਜਾਬੀ ਵਿੱਚ ਲਿਖੋ\n- No English except technical terms`
        : language === 'marathi'
        ? `- STRICT MARATHI ONLY\n- मराठीत लिहा\n- No English except technical terms`
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

2. Exam Syllabus (${examMode} focused)
- Points here

3. Key Formulas / Concepts
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
"${language === 'english' ? 'Remember this. Now solve PYQs, that is the real exam.' : language === 'hindi' ? 'बस भाई, इतना याद रखो। अब PYQ लगाओ, वही असली परीक्षा है।' : language === 'marathi' ? 'बस भाऊ, एवढं लक्षात ठेवा. आता PYQ सोडवा.' : 'Bas beta, itna yaad rakho. Ab PYQs lagao, wahi exam hai.'}"`;

    const topicsText = Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'All key topics';
    const formulasText = Array.isArray(formulas) && formulas.length > 0 ? formulas.join(' | ') : 'All important formulas';
    const tipsText = Array.isArray(examTips) && examTips.length > 0 ? examTips.join(' | ') : `Standard ${examMode} exam strategies`;

    const userPrompt = `Create 1-page revision notes for: ${chapterName} (${subject})

Chapter topics: ${topicsText}

Formulas to include: ${formulasText}

Exam tips: ${tipsText}

STRICT REMINDERS:
- If subject is Biology, focus on diagrams, examples, and NCERT lines.
- Use STANDARD MATHEMATICAL NOTATION for formulas (e.g., "V = IR", not "V equals I times R").
- Use symbols like ρ, θ, Δ, λ.
- NO LaTeX code blocks, just plain text math.
- Language: ${language === 'english' ? 'Strict Professional English' : language === 'hindi' ? 'Strict Hindi (Devanagari)' : language === 'kannada' ? 'Strict Kannada' : language === 'telugu' ? 'Strict Telugu' : language === 'punjabi' ? 'Strict Punjabi' : language === 'marathi' ? 'Strict Marathi' : 'Hinglish coaching style'}.`;


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
