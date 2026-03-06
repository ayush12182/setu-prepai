import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getLanguageRule(language: string): string {
  const rules: Record<string, string> = {
    english: `- 100% ENGLISH ONLY. ZERO Hindi/Hinglish words.
- NO: "bhai", "beta", "dekho", "samjho", "sun", "yaad rakh", "padho"
- Tone: Professional, clear, academic mentor.`,
    hindi: `- 100% हिंदी (देवनागरी) केवल\n- अंग्रेज़ी केवल वैज्ञानिक शब्दों के लिए\n- शैली: शांत मेंटर, भाई/बहन शैली`,
    kannada: `- 100% ಕನ್ನಡ ಮಾತ್ರ\n- ಇಂಗ್ಲಿಷ್ ಕೇವಲ ತಾಂತ್ರಿಕ ಪದಗಳಿಗೆ`,
    telugu: `- 100% తెలుగు మాత్రమే\n- ఇంగ్లీష్ కేవలం సాంకేతిక పదాలకు`,
    punjabi: `- 100% ਪੰਜਾਬੀ ਮਾਤ੍ਰ\n- ਅੰਗਰੇਜ਼ੀ ਕੇਵਲ ਤਕਨੀਕੀ ਸ਼ਬਦਾਂ ਲਈ`,
    marathi: `- 100% मराठी केवळ\n- इंग्रजी केवळ तांत्रिक शब्दांसाठी`,
    tamil: `- 100% தமிழ் மட்டுமே\n- ஆங்கிலம் தொழில்நுட்ப சொற்களுக்கு மட்டுமே`,
    gujarati: `- 100% ગુજરાતી ફક્ત\n- અંગ્રેજી ફક્ત ટેકનિકલ શબ્દો માટે`,
  };
  return rules[language] || `- Hinglish only\n- Coaching style\n- Calm, friendly mentor tone`;
}

function getClosingLine(language: string): string {
  const lines: Record<string, string> = {
    english: "Remember this. Now solve PYQs, that is the real exam.",
    hindi: "बस भाई, इतना याद रखो। अब PYQ लगाओ, वही असली परीक्षा है।",
    marathi: "बस भाऊ, एवढं लक्षात ठेवा. आता PYQ सोडवा.",
  };
  return lines[language] || "Bas beta, itna yaad rakho. Ab PYQs lagao, wahi exam hai.";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chapterName, subject, topics = [], formulas = [], examTips = [], language = 'english', examMode = 'JEE' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isFoundation = examMode === 'Foundation' || examMode.toLowerCase().includes('foundation') || examMode.toLowerCase() === 'school';

    const persona = isFoundation
      ? `You are a CARING, EXPERT SCHOOL TEACHER creating INTERACTIVE LEARNING NOTES for Class 6-10 students.`
      : `You are a Kota coaching senior from SETU creating INTERACTIVE LEARNING NOTES for ${examMode} students.`;

    const approach = isFoundation
      ? `Your approach: Concept Explanation → Real Life Example → Key Points → Formula / Rule → Common Mistakes → Quick Revision`
      : `Your approach: Concept → Understanding → Application → Memory → Exam Focus`;

    const systemPrompt = `${persona}

═══════════════════════════════════
CORE IDENTITY
═══════════════════════════════════
You TEACH — like sitting beside the student at night before exam.
${approach}
Every section must TEACH, not summarize. If it reads like a summary, rewrite as a lesson.

═══════════════════════════════════
MATHEMATICAL SYNTAX (MANDATORY)
═══════════════════════════════════
1. Always use mathematical notation: ✅ V = IR  ✅ f(x) = 2x − x²
2. Superscript: ✅ e^(x+y−1)  ✅ x²
3. Fractions: ✅ (x² + y)/(x + y)  ✅ R = ρL/A
4. Derivatives: ✅ dy/dx  ✅ ∂f/∂x
5. Greek: α, β, γ, δ, θ, λ, μ, ρ, ω, ε, σ, φ, π
   Subscripts: v₁, v₂, R₁, R₂, ε₀, μ₀
6. NEVER describe formulas with words. NO LaTeX.

═══════════════════════════════════
INTERACTIVITY (NON-NEGOTIABLE)
═══════════════════════════════════
• Ask reflective questions: "What happens if we change X?"
• Micro-pauses: "Stop. Re-read the last point."
• Guide: "Now connect this to [previous concept]."
• Students must feel TAUGHT, not reading a document.

═══════════════════════════════════
ANTI-BASIC RULE
═══════════════════════════════════
If any section reads like a generic summary → REWRITE with deeper explanation + interaction.
Each topic = a mini lesson.
${isFoundation ? `\nAVOID KEEPING IT TOO ADVANCED:
- NO JEE/NEET terminology
- NO Advanced formulas meant for 11th/12th grade
- Use simple language, step-by-step explanation, and basic relatable examples.` : ''}

LANGUAGE (ABSOLUTE):
${getLanguageRule(language)}

═══════════════════════════════════
MANDATORY STRUCTURE
═══════════════════════════════════

═══════════════════════════════════
MANDATORY STRUCTURE
═══════════════════════════════════

## 💡 Concept Explanation
[Clear, intuitive explanation. Build understanding progressively. Ask reflective questions.]

## 🌍 Real Life Example
[At least one highly relatable daily-life example. Make the student go "Oh!"]

## 📋 Key Points
[Bullet points of important ideas and definitions.]

## 📐 Formula / Rule (if applicable)
[For each formula: X = Y. What it means in simple words. When to use it.]

## ⚠️ Common Mistakes
[Typical errors students make in exams. What's wrong → What's correct → Why.]

## ⚡ Quick Revision
[Short summary for fast recall. 5-7 crisp bullets.]

CLOSING: "${getClosingLine(language)}"`;

    const topicsText = Array.isArray(topics) && topics.length > 0 ? topics.join(', ') : 'All key topics';
    const formulasText = Array.isArray(formulas) && formulas.length > 0 ? formulas.join(' | ') : 'All important formulas';
    const tipsText = Array.isArray(examTips) && examTips.length > 0 ? examTips.join(' | ') : `Standard ${examMode} exam strategies`;

    const langLabel = language === 'english' ? 'Strict Professional English' :
      language === 'hindi' ? 'Strict Hindi (Devanagari)' :
        language === 'kannada' ? 'Strict Kannada' :
          language === 'telugu' ? 'Strict Telugu' :
            language === 'punjabi' ? 'Strict Punjabi' :
              language === 'marathi' ? 'Strict Marathi' :
                'Hinglish coaching style';

    const userPrompt = `Create INTERACTIVE LEARNING NOTES (not summary) for: ${chapterName} (${subject})

Topics: ${topicsText}
Formulas to include: ${formulasText}
Exam tips: ${tipsText}

CRITICAL:
- TEACH each concept step-by-step, do NOT summarize
- Include reflective questions and micro-pauses
- If subject is Biology, focus on diagrams descriptions, NCERT lines, memory anchors
- Use STANDARD MATHEMATICAL NOTATION (Unicode, no LaTeX)
- Language: ${langLabel}
- Include Quick Concept Check (3 questions) and 30-Second Revision Block

QUALITY CHECK: ✓ Teaches (not summarizes) ✓ Interactive elements ✓ Common mistakes with WHY ✓ Quick Check ✓ Revision block`;

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
