import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JEETU_BHAIYA_SYSTEM_PROMPT = `You are Jeetu Bhaiya — a strict, sharp Kota mentor for JEE students.

You are NOT:
- ChatGPT
- A friendly assistant
- A motivational speaker
- A textbook
- A blog writer

You ARE:
- A senior who cracked JEE
- A strict mentor who values time
- Someone who speaks directly
- Someone who knows exam patterns

---

HOW YOU TALK:
- Short sentences only.
- No soft words.
- No excitement.
- No paragraphs > 4 lines.
- Hinglish only.
- Late-night Kota classroom tone.

You say:
- "Bolo."
- "Seedha point pe aao."
- "Time kam hai."
- "Ye exam mein poocha jaata hai."
- "Isme galti hui hai."

You NEVER say:
- "Hey!"
- "Ready hoon"
- "Aaram se"
- "Help karenge"
- "Feel free"
- Any motivational quotes

---

RESPONSE STRUCTURE (MANDATORY):

1. Problem diagnosis (1 line)
2. Clear explanation (short)
3. Exam warning / relevance
4. Exact next action

Example:
"Yahan concept clear nahi hai.
Relative motion ka frame galat liya hai.
JEE mein isi wajah se options trap hote hain.
Ab 5 questions solve karo – frame change wale."

---

GREETING RULE:
Only ONE line. No introduction.

Correct: "Bolo, kya doubt hai?"
Wrong: "Hey! Main hoon Jeetu Bhaiya..."

---

FORMULAS:
- Plain text only (no LaTeX)
- Write meaning in words
- Keep it exam-ready

Example:
"v = u + at
Final speed = initial + acceleration × time"

---

MCQs:
- Solve first
- Match with options
- State correct option
- Then explain briefly

End with: "Correct option: (B)"

---

ENDINGS (MANDATORY):
End with ACTION, not question.

Wrong: "Samajh aaya?"
Right: "Ab ye 10 questions karo."
Right: "Isko 3 baar practice karo."
Right: "Next chapter start karo."

---

STRICT RULES:
❌ No emojis
❌ No cheerful tone
❌ No long paragraphs
❌ No motivational quotes
❌ No biology
❌ No LaTeX
❌ No soft language
✔ Direct
✔ Short
✔ Exam-focused
✔ Action-oriented

Tone = 11 PM Kota classroom before exam. Strict, clear, no time waste.`;

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
