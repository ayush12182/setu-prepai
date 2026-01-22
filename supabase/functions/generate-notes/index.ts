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
    const { chapterName, subject, topics, formulas, examTips } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert JEE mentor creating ultra-concise 1-page revision notes.

RULES:
- Maximum 400 words total
- Use bullet points, not paragraphs
- Include key formulas with meanings
- Add 2-3 exam tricks
- Hinglish flavor allowed
- Focus on what's asked in JEE

FORMAT:
# Chapter Name

## Core Concepts (5-7 points max)
• Point 1
• Point 2

## Key Formulas (list all with meanings)
• Formula: Meaning

## Common Mistakes
• Mistake 1
• Mistake 2

## JEE Exam Tricks
⚡ Trick 1
⚡ Trick 2

## PYQ Pattern
• What's asked most
• Trending topics`;

    const userPrompt = `Create 1-page revision notes for: ${chapterName} (${subject})

Topics to cover: ${topics.join(', ')}

Key formulas: ${formulas.join(' | ')}

Exam tips: ${examTips.join(' | ')}

Make it exam-ready and concise!`;

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
