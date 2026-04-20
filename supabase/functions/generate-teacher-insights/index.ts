/**
 * generate-teacher-insights — Supabase Edge Function
 * 
 * UNIVERSAL ENGINE: Migrated to OpenAI GPT-4o
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

  try {
    const { students } = await req.json();

    console.log(`[UniversalEngine] Generating teacher insights for ${students?.length || 0} students`);

    const systemPrompt = `You are an expert educational consultant. Analyze student performance data and provide actionable interventions for the teacher. Return a JSON object with a "insights" array.`;
    const userPrompt = `Analyze these students: ${JSON.stringify(students)}. Provide 5-8 suggestions with fields: student, suggestion, priority (high|medium|low).`;

    const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) throw new Error(`OpenAI error: ${aiRes.status}`);
    const aiData = await aiRes.json();
    const insights = JSON.parse(aiData.choices[0].message.content).insights;

    return new Response(JSON.stringify({ insights }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[UniversalEngine] Teacher Insights Error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
