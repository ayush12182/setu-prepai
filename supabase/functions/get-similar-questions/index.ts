import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SimilarQuestionsRequest {
  conceptTested: string;
  subchapterName: string;
  subject: string;
  originalQuestion: string;
  count?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { conceptTested, subchapterName, subject, originalQuestion, count = 3 }: SimilarQuestionsRequest = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a JEE expert creating practice questions to help students master a specific concept they got wrong.
The student just answered a question incorrectly about: "${conceptTested}"
Topic: ${subject} > ${subchapterName}

Create ${count} similar but simpler questions that help build understanding progressively.
Start with easier variations and gradually increase complexity.`;

    const userPrompt = `The student got this question wrong:
"${originalQuestion}"

They need to practice the concept: "${conceptTested}"

Generate ${count} progressively harder questions on the same concept.
Return JSON array:
[{
  "question_text": "Question text",
  "option_a": "Option A",
  "option_b": "Option B",
  "option_c": "Option C", 
  "option_d": "Option D",
  "correct_option": "A/B/C/D",
  "explanation": "Brief explanation",
  "difficulty_note": "Why this helps understand the concept"
}]`;

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
        temperature: 0.6,
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
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let similarQuestions;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        similarQuestions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found");
      }
    } catch {
      console.error("Parse error:", content);
      throw new Error("Failed to parse similar questions");
    }

    return new Response(JSON.stringify({ questions: similarQuestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("get-similar-questions error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
