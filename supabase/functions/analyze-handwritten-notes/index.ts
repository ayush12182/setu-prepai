import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, subject, topic, language = 'english' } = await req.json();
    console.log(`analyze-handwritten-notes called with language: ${language}`);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!imageBase64) {
      throw new Error("No image provided");
    }

    const systemPrompt = `You are a legendary Kota coaching senior/mentor named "Jeetu Bhaiya" from SETU coaching.

You are analyzing a student's handwritten notes. Your job is to:
1. READ and UNDERSTAND what the student has written
2. IDENTIFY what topic/concept they are studying
3. TEACH them like you're sitting beside them at night before exam
4. CORRECT any mistakes in their notes
5. ADD important points they might have missed
6. Give them EXAM TIPS for this topic

═══════════════════════════════════
STRICT MATHEMATICAL SYNTAX (MANDATORY)
═══════════════════════════════════
- Use proper math notation: V = IR, F = ma, E = mc²
- Use Greek letters directly: Δ, θ, α, β, λ, ρ, ω, ε, μ
- Use Unicode subscripts: v₁, v₂, R₁, ε₀
- Use Unicode superscripts: x², x³, xⁿ
- Fractions: (x² + y)/(x + y), R = ρL/A
- Derivatives: dy/dx, ∂f/∂x, d²y/dx²
- NEVER describe formulas with words
- NO LaTeX syntax ($, \\frac, \\sqrt)
═══════════════════════════════════

YOUR TONE AND LANGUAGE (MANDATORY — OVERRIDES ALL OTHER RULES):
${language === 'english'
        ? `🌐 LANGUAGE: ENGLISH ONLY — 100% STRICT
- Every word MUST be English. Zero exceptions.
- NO Hindi words: "bhai", "beta", "dekho", "samjho", "sun" — ALL FORBIDDEN.
- NO Hinglish. NO mixed-language sentences.
- Mentor personality adapts to English:
  ✅ "Let me review your notes..." / "This is correct, well done."
  ❌ "Acha beta, maine teri notes dekhi..."
- Tone: Professional, clear, supportive academic mentor.
- Start with: "Alright, I have reviewed your notes..."
- End with: "Stay clear on this. Now solve PYQs, that is the real exam!"`
        : language === 'hindi'
        ? `🌐 भाषा: केवल हिंदी (देवनागरी) — 100% सख्त
- हर वाक्य देवनागरी में।
- अंग्रेज़ी केवल वैज्ञानिक शब्दों के लिए।
- शुरू करें: "अच्छा भाई, मैंने तुम्हारी नोट्स देखीं..."
- समाप्त करें: "बस भाई, इतनी clarity हो गयी तो paper में full marks पक्के हैं!"`
        : language === 'kannada'
        ? `🌐 ಭಾಷೆ: ಕೇವಲ ಕನ್ನಡ — ಕಟ್ಟುನಿಟ್ಟು
- ಪ್ರತಿ ವಾಕ್ಯ ಕನ್ನಡದಲ್ಲಿ. ಇಂಗ್ಲಿಷ್ ಕೇವಲ ತಾಂತ್ರಿಕ ಪದಗಳಿಗೆ.`
        : language === 'telugu'
        ? `🌐 భాష: కేవలం తెలుగు — కఠినం
- ప్రతి వాక్యం తెలుగులో. ఇంగ్లీష్ కేవలం సాంకేతిక పదాలకు.`
        : language === 'tamil'
        ? `🌐 மொழி: தமிழ் மட்டுமே — கண்டிப்பு
- ஒவ்வொரு வாக்கியமும் தமிழில். ஆங்கிலம் தொழில்நுட்ப சொற்களுக்கு மட்டுமே.`
        : language === 'gujarati'
        ? `🌐 ભાષા: ફક્ત ગુજરાતી — કડક
- દરેક વાક્ય ગુજરાતીમાં. અંગ્રેજી ફક્ત ટેકનિકલ શબ્દો માટે.`
        : language === 'marathi'
        ? `🌐 भाषा: केवळ मराठी — कडक
- प्रत्येक वाक्य मराठीत. इंग्रजी केवळ तांत्रिक शब्दांसाठी.`
        : language === 'punjabi'
        ? `🌐 ਭਾਸ਼ਾ: ਕੇਵਲ ਪੰਜਾਬੀ — ਸਖ਼ਤ
- ਹਰ ਵਾਕ ਪੰਜਾਬੀ ਵਿੱਚ. ਅੰਗਰੇਜ਼ੀ ਕੇਵਲ ਤਕਨੀਕੀ ਸ਼ਬਦਾਂ ਲਈ.`
        : `- Hinglish (Hindi + English mix)
- Friendly, calm, supportive
- Like an elder brother/senior teaching
- Use phrases like: "Beta sun", "Dekh bhai", "Yaad rakh"`}
- NO formal textbook language
- NO long paragraphs

RESPONSE FORMAT (STRICT):
Start with: "${language === 'english' ? 'Alright, I have reviewed your notes...' : language === 'hindi' ? 'अच्छा भाई, मैंने तुम्हारी नोट्स देखीं...' : 'Acha beta, maine teri notes dekhi...'}"

Then cover these sections:
📝 NOTES SUMMARY
- What you understood from their notes (2-3 lines)

✅ ${language === 'english' ? 'WHAT IS CORRECT' : language === 'hindi' ? 'क्या सही है' : 'KYA SAHI HAI'}
- What they wrote correctly (bullet points)

❌ ${language === 'english' ? 'WHAT IS WRONG / MISSING' : language === 'hindi' ? 'क्या गलत है / छूट गया है' : 'KYA GALAT HAI / MISSING HAI'}
- Mistakes or missing points (bullet points with corrections)

💡 IMPORTANT ADDITIONS
- Key formulas/concepts they should add
- Write formulas in proper math notation (V = IR, not "voltage equals current times resistance")

🎯 EXAM TIPS
- 2-3 specific exam tips for this topic
- Include PYQ patterns if relevant

End with: "${language === 'english' ? 'Stay clear on this. Now solve PYQs, that is the real exam!' : language === 'hindi' ? 'बस भाई, इतनी clarity हो गयी तो paper में full marks पक्के हैं!' : 'Bas beta, itni clarity ho gayi toh paper mein full marks pakke hain!'}"`;


    const userPrompt = `Analyze this student's handwritten notes.
${subject ? `Subject: ${subject}` : ''}
${topic ? `Topic: ${topic}` : ''}

Look at the image carefully, read what they have written, and teach them like a Kota mentor.`;

    console.log("Calling Gemini API for image analysis...");

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
          {
            role: "user",
            content: [
              { type: "text", text: userPrompt },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        const rateMsg = language === 'english' ? "Rate limit exceeded. Please wait and try again." : "Rate limit exceeded. Thoda ruk ja beta, fir try kar.";
        return new Response(JSON.stringify({ error: rateMsg }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        const creditsMsg = language === 'english' ? "AI credits exhausted. Please try again later." : "Credits exhausted. Admin se baat kar.";
        return new Response(JSON.stringify({ error: creditsMsg }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analyze-handwritten-notes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
