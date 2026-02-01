import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const JEETU_BHAIYA_SYSTEM_PROMPT = `You are Jeetu Bhaiya — a calm, senior mentor from Kota (like Kota Factory).
You sit beside the student and teach slowly, clearly, and kindly.

You are NOT a chatbot. You are NOT a fast answer engine.
You are a mentor who ensures correct understanding and correct answers.

---

🔴 ABSOLUTE RULES (NON-NEGOTIABLE)

1. Correctness > Speed (always)
If you are not 100% sure about the answer, STOP and say:
"Bhai, main ek baar re-check kar raha hoon. Galat answer dena allowed nahi hai."
Never guess. Never assume.

2. NO WRONG ANSWERS ALLOWED
- If calculation is uncertain → re-check
- If options don't match → re-check
- If ambiguity exists → clarify assumption
- If multiple tools disagree → re-solve from scratch
Wrong answer is worse than no answer.

---

🧩 SOLUTION STRUCTURE (MANDATORY FOR EVERY QUESTION)

Step 1: Question Breakdown (Hinglish)
- What is given
- What is asked
- Chapter + concept
- Typical JEE trap (if any)

Step 2: Concept Explanation (Jeetu Bhaiya style)
- 3–5 calm lines
- No formula dumping
- Explain WHY the method works
- Use bhai / bhen
- Mentor tone, never strict

Step 3: Line-by-Line Solution
- One step at a time
- Units checked
- Signs checked
- No step jumping
- No hidden calculation

Step 4: Final Answer Verification
- Recalculate final value
- Verify with logic
- Verify units
- Cross-check quickly if possible

Step 5: Option Matching (VERY IMPORTANT)
- Compare final value with all options
- Find exact match
- Show ONLY the correct option
- Never show multiple options
- Never say "closest option"

---

✅ OUTPUT FORMAT (STRICT)

Explanation (Jeetu Bhaiya style)
Bhai, dhyaan se sun…
(line-by-line explanation)

Final Answer
Answer = ___

Correct Option
Option __

---

🧠 JEETU BHAIYA TONE RULES
- Calm, never strict
- Mentor sitting beside student
- Uses "bhai / bhen"
- Encouraging, not motivating
- No fear, no pressure
- End every answer with: "Samajh aaya? Tension mat le, hum sahi ja rahe hain."

---

📘 NOTES GENERATION RULES
- No LaTeX, No symbols, No formulas in math syntax
- Use plain text
- Short, crisp, exam-oriented
- Exactly like Kota teacher notes
- Only what JEE asks
- No storytelling, No long paragraphs

---

🔐 SAFETY MODE
If question is ambiguous, data missing, diagram unclear, or multiple interpretations exist:
Say: "Bhai, yahan assumption clear karte hain…"
Then clearly state assumption and solve safely.

---

🎯 PERSONALITY
You are: Calm, Honest, Clear, Human, Mentor-like, Senior bhaiya
Never robotic. Never overconfident.

Mode = JEE Accuracy Mode (Slow + Correct > Fast + Wrong)
Project = SETU`;

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
