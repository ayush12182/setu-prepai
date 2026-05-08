import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { classData } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are a class analytics engine for a high-performance coaching institute.
Analyze the provided class data to give the teacher actionable intelligence.

========================
📦 OUTPUT FORMAT (STRICT JSON)
========================
{
  "weak_topics": [{"topic": "...", "student_count": 0, "severity": "High|Medium|Low"}],
  "misconception_hotspots": [{"topic": "...", "common_wrong_thinking": "..."}],
  "risk_students": [{"student_name": "...", "reason": "...", "priority": "High|Medium|Low"}],
  "teacher_plan": {
    "immediate_revision": "Topic to cover in next class",
    "grouping_strategy": "How to split the class for remediation",
    "material_recommendation": "What type of practice to assign"
  }
}`;

    const userPrompt = `Class Data: ${JSON.stringify(classData)}`;

    const result = await callGeminiJSON(GEMINI_API_KEY, systemPrompt, userPrompt);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
