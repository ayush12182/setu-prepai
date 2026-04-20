import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { students } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are an expert educational consultant for JEE/NEET coaching institutes. Analyze student performance data and provide actionable interventions. Return a JSON object with an "insights" array.`;
    const userPrompt = `Analyze these ${students?.length || 0} students: ${JSON.stringify(students)}. Provide 5-8 specific suggestions, each with: student_name, suggestion, priority (high|medium|low), action_type (revision|practice|test|counseling).`;

    const data = await callGeminiJSON<{ insights: any[] }>(GEMINI_API_KEY, systemPrompt, userPrompt, 0.4);

    return new Response(JSON.stringify({ insights: data.insights || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-teacher-insights]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
