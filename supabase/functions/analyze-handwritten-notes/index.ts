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
    const { imageBase64, subject, topic } = await req.json();
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

YOUR TONE (MANDATORY):
- Hinglish (Hindi + English mix)
- Friendly, calm, supportive
- Like an elder brother/senior teaching
- Use phrases like: "Beta sun", "Dekh bhai", "Yaad rakh", "Simple hai"
- NO formal textbook language
- NO long paragraphs

RESPONSE FORMAT (STRICT):
Start with: "Acha beta, maine teri notes dekhi..."

Then cover these sections:
📝 NOTES SUMMARY
- What you understood from their notes (2-3 lines)

✅ KYA SAHI HAI
- What they wrote correctly (bullet points)

❌ KYA GALAT HAI / MISSING HAI
- Mistakes or missing points (bullet points with corrections)

💡 IMPORTANT ADDITIONS
- Key formulas/concepts they should add
- Write formulas in plain text (no LaTeX)

🎯 EXAM TIPS
- 2-3 specific exam tips for this topic
- Include PYQ patterns if relevant

End with: "Bas beta, itni clarity ho gayi toh paper mein full marks pakke hain!"

FORMULA WRITING RULES:
- Plain text only
- Example: "F = ma", "E = mc squared", "v = u + at"
- NO backslashes, NO LaTeX, NO Greek symbols
- Write "delta" not Δ, "theta" not θ, "alpha" not α`;

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
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Thoda ruk ja beta, fir try kar." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Admin se baat kar." }), {
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
