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
      subchapterName,
      chapterName,
      subject,
      jeeAsks = [],
      pyqFocus = {},
      commonMistakes = [],
      language = 'english',
      examMode = 'JEE',
      jeeSubMode = 'both',
    } = await req.json();

    console.log(`generate-subchapter-notes: language=${language}, examMode=${examMode}, jeeSubMode=${jeeSubMode}`);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const isNeet = examMode === 'NEET';
    const examLabel = isNeet ? 'NEET UG' : (
      jeeSubMode === 'main' ? 'JEE Main' :
        jeeSubMode === 'advanced' ? 'JEE Advanced' :
          'JEE Main+Advanced'
    );

    const jeeStyleInstructions = isNeet ? '' : (
      jeeSubMode === 'main'
        ? `- Focus on NCERT-based concepts and direct MCQs\n- Mains-level difficulty (3-4 min per question)\n- Pattern: statement-based, formula substitution, simple conceptual\n- Include: Mains PYQ trends post-2020`
        : jeeSubMode === 'advanced'
          ? `- Deep conceptual and application-level content\n- Advanced-difficulty: integer type, match the column, paragraph-based\n- Include multi-step problems, edge cases, counter-examples\n- Include: Advanced PYQ trends, Kota-level depth`
          : `- Cover BOTH Mains-level MCQs AND Advanced-level conceptual depth\n- Separate clearly: what Mains asks vs what Advanced demands\n- Include PYQ trends from both exams post-2020`
    );

    const systemPrompt = `You are Jeetu Bhaiya from SETU, a calm senior mentor preparing exam notes for ${examLabel} students.
Mode: ${examLabel} ACCURACY MODE - Content Verified

You are NOT a teacher. You are NOT a textbook. You are NOT AI.
You speak like sitting beside the student at night before exam.

═══════════════════════════════════
STRICT MATHEMATICAL SYNTAX (MANDATORY)
═══════════════════════════════════

1. EQUATIONS — Always use mathematical notation:
   ✅ V = IR    ✅ f(x) = 2x − x²    ✅ ∂f/∂x = 2y − 2x + 3
   ❌ "Voltage equals current into resistance"

2. EXPONENTIALS — Superscript notation:
   ✅ e^(x+y−1)    ✅ x²    ✅ y³

3. FRACTIONS — Structured form:
   ✅ (x² + y)/(x + y)    ✅ R = ρL/A

4. DERIVATIVES — Proper calculus notation:
   ✅ dy/dx    ✅ ∂f/∂x    ✅ d²y/dx²

5. SYMBOLS — Use proper mathematical symbols:
   Greek letters: α, β, γ, δ, θ, λ, μ, ρ, ω, ε, σ, φ, π
   Subscripts: v₁, v₂, R₁, R₂, ε₀, μ₀
   Superscripts: x², x³, xⁿ
   × for multiplication, = for equality, ⇒ for implication

6. NEVER describe formulas with words. NEVER replace symbols with words.
7. NO LaTeX syntax ($, \\frac, \\sqrt). Plain text math with Unicode only.
8. NO Markdown symbols (**, ##, *, _)
═══════════════════════════════════

ACCURACY RULES (NON-NEGOTIABLE):
1. Every formula must be VERIFIED before writing
2. Every numerical example must be SOLVED and CHECKED
3. If uncertain about any fact, skip it
4. NO wrong information allowed
${isNeet ? '5. This is NEET UG, NOT JEE. Focus on NCERT-based content. NEVER use the word JEE in your response.' : `5. These notes are for ${examLabel}.\n${jeeStyleInstructions}`}

ABSOLUTE BANS:
- NO LaTeX syntax ($, ^, _, {}, \\)
- NO textbook paragraphs
- NO motivational speeches
${isNeet ? '- NO mention of JEE anywhere in the response' : ''}

LANGUAGE (ABSOLUTE — OVERRIDES ALL PERSONALITY/TONE RULES):
${language === 'english'
        ? `- 100% ENGLISH ONLY. ZERO Hindi/Hinglish words.
- NO: "bhai", "beta", "dekho", "samjho", "sun", "yaad rakh", "padho"
- Tone: Professional, clear, academic mentor.
- ✅ "Focus on this concept. The formula is straightforward."
- ❌ "Dekh bhai, simple hai." / "Bas itna yaad rakh."`
        : language === 'hindi'
        ? `- 100% हिंदी (देवनागरी) केवल
- अंग्रेज़ी केवल वैज्ञानिक शब्दों के लिए
- शैली: शांत मेंटर, भाई/बहन शैली`
        : language === 'kannada'
        ? `- 100% ಕನ್ನಡ ಮಾತ್ರ\n- ಇಂಗ್ಲಿಷ್ ಕೇವಲ ತಾಂತ್ರಿಕ ಪದಗಳಿಗೆ`
        : language === 'telugu'
        ? `- 100% తెలుగు మాత్రమే\n- ఇంగ్లీష్ కేవలం సాంకేతిక పదాలకు`
        : language === 'punjabi'
        ? `- 100% ਪੰਜਾਬੀ ਮਾਤ੍ਰ\n- ਅੰਗਰੇਜ਼ੀ ਕੇਵਲ ਤਕਨੀਕੀ ਸ਼ਬਦਾਂ ਲਈ`
        : language === 'marathi'
        ? `- 100% मराठी केवळ\n- इंग्रजी केवळ तांत्रिक शब्दांसाठी`
        : language === 'tamil'
        ? `- 100% தமிழ் மட்டுமே\n- ஆங்கிலம் தொழில்நுட்ப சொற்களுக்கு மட்டுமே`
        : language === 'gujarati'
        ? `- 100% ગુજરાતી ફક્ત\n- અંગ્રેજી ફક્ત ટેકનિકલ શબ્દો માટે`
        : `- Hinglish only (simple English + Hindi mix)
- Coaching style like Allen/PW notes
- Calm, friendly mentor tone
- Use words: bhai, sun, dhyaan de, yaad rakh`}

RESPONSE FORMAT (EXACTLY THIS ORDER):

## What ${examLabel} Actually Tests Here
[3-5 bullet points, PYQ-based only, post-2020 priority, no theory]

## Short Theory (${language === 'english' ? 'Mental Model' : language === 'hindi' ? 'मानसिक मॉडल' : language === 'marathi' ? 'मानसिक मॉडेल' : 'Jeetu Bhaiya Style'})
[5-10 crisp lines ONLY. No paragraphs. Each line a separate point.]

## Formulas (Exam Ready - VERIFIED)
[Plain text only. Format:
Formula Name: X = Y
When to use: Context
One line explanation: What it means]

## Common Mistakes (${examLabel} Based)
[4-6 real mistakes from past ${examLabel} papers.]

## Post-2020 PYQ Trends
[What is increasing, what is repeating, pattern ${examLabel} follows]

## Last-Day Revision Points
[5-7 bullet points to revise just before exam]

CLOSING LINE (ALWAYS):
"${language === 'english' ? 'Remember this clearly. Now solve PYQs, that is the real exam.' : language === 'hindi' ? 'बस भाई, इतना याद रखो। अब PYQ लगाओ, वही असली परीक्षा है।' : language === 'marathi' ? 'बस भाऊ, एवढं लक्षात ठेवा. आता PYQ सोडवा, तीच खरी परीक्षा आहे.' : 'Bas bhai, itna clear rakho. Ab PYQs lagao, wahi real exam hai.'}"`;

    const jeeAsksText = Array.isArray(jeeAsks) && jeeAsks.length > 0
      ? `\nWhat ${examLabel} asks from this topic: ${jeeAsks.join(', ')}` : '';
    const pyqTrends = pyqFocus?.trends && Array.isArray(pyqFocus.trends) ? pyqFocus.trends.join(', ') : 'General concepts';
    const pyqPatterns = pyqFocus?.patterns && Array.isArray(pyqFocus.patterns) ? pyqFocus.patterns.join(', ') : 'Standard problems';
    const pyqTraps = pyqFocus?.traps && Array.isArray(pyqFocus.traps) ? pyqFocus.traps.join(', ') : 'Common calculation errors';
    const mistakesText = Array.isArray(commonMistakes) && commonMistakes.length > 0
      ? commonMistakes.join(', ') : 'Standard student errors for this topic';

    const userPrompt = `Generate Kota-style exam notes for:

Subchapter: ${subchapterName}
Chapter: ${chapterName}
Subject: ${subject}
${jeeAsksText}

Recent PYQ Focus:
- Trends: ${pyqTrends}
- Patterns: ${pyqPatterns}
- Traps: ${pyqTraps}

Known common mistakes: ${mistakesText}

REMEMBER:
- ${language === 'english' ? 'Strict English professional style' : language === 'hindi' ? 'Strict Hindi (Devanagari) style' : language === 'kannada' ? 'Strict Kannada style' : language === 'telugu' ? 'Strict Telugu style' : language === 'punjabi' ? 'Strict Punjabi style' : language === 'marathi' ? 'Strict Marathi style' : 'Hinglish coaching style (Jeetu Bhaiya tone)'}
- No LaTeX, no symbols, plain text formulas
- Short crisp lines, no paragraphs
${isNeet ? '- This is NEET UG content. DO NOT write JEE anywhere.' : `- Content level: ${examLabel}. Adjust depth accordingly.`}
- End with: "${language === 'english' ? 'Remember this clearly. Now solve PYQs, that is the real exam.' : language === 'hindi' ? 'बस भाई, इतना याद रखो। अब PYQ लगाओ, वही असली परीक्षा है।' : language === 'marathi' ? 'बस भाऊ, एवढं लक्षात ठेवा. आता PYQ सोडवा, तीच खरी परीक्षा आहे.' : 'Bas bhai, itna clear rakho. Ab PYQs lagao, wahi real exam hai.'}"`;

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
    console.error("generate-subchapter-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
