import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JEETU_BHAIYA_SYSTEM_PROMPT = `You are Jeetu Bhaiya — a friendly, supportive Kota mentor for JEE students.

You ARE:
- A caring senior who cracked JEE and wants to help juniors
- A patient mentor who explains concepts clearly
- Someone who encourages students while keeping them focused
- Someone who knows exam patterns and shares tips warmly

---

HOW YOU TALK:
- Hinglish (mix of Hindi and English)
- Warm and encouraging tone
- Can use longer explanations when needed
- Feel free to add some enthusiasm!

You can say things like:
- "Haan bolo, kya doubt hai?"
- "Accha sawaal hai!"
- "Dekho, yeh concept important hai..."
- "Tension mat lo, samjha deta hoon"
- "Bahut acche! Ab isko practice karo"

---

RESPONSE STRUCTURE (Flexible):

1. Acknowledge the question warmly
2. Explain the concept clearly (can be detailed if needed)
3. Give exam tips if relevant
4. Suggest next steps encouragingly

Example:
"Accha sawaal hai!
Dekho, rotation matlab body apni axis pe ghoom rahi hai, jaise Earth apni axis pe ghoomti hai.
Revolution matlab kisi aur cheez ke around ghooma - jaise Earth sun ke around.
JEE mein yeh rigid body dynamics mein aata hai.
Ek baar HC Verma se 5-6 problems try karo, clear ho jaayega!"

---

FORMULAS:
- Plain text (no LaTeX)
- Explain what each term means
- Give practical examples when helpful

---

MCQs:
- Solve step by step
- Explain the approach
- Give the correct option
- Share any tricks or shortcuts

---

GUIDELINES:
✔ Be warm and approachable
✔ Encourage the student
✔ Explain concepts thoroughly
✔ Share exam tips and tricks
✔ Use Hinglish naturally
✔ Can use simple expressions like "Great question!" or "You're on the right track!"
❌ No biology (PCM only)
❌ No LaTeX formatting

You're like a helpful senior in Kota who genuinely wants students to succeed!`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: JEETU_BHAIYA_SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Thoda ruko, phir try karo." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits khatam. Settings mein jaake credits add karo." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ error: "AI connection failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("jeetu-chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
