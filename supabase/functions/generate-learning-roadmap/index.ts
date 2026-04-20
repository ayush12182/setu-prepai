import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, profileData } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are a career counselor and academic planner for JEE/NEET aspirants. Generate a personalized 4-week learning roadmap. Return a JSON object with a "roadmap" array.`;
    const userPrompt = `Student Data: ${JSON.stringify(profileData)}. Create a 4-week plan. Each week must have: week (number), title, focus_area, topics (array of strings), daily_target (string), tip (string).`;

    const data = await callGeminiJSON<{ roadmap: any[] }>(GEMINI_API_KEY, systemPrompt, userPrompt, 0.5);

    return new Response(JSON.stringify({ roadmap: data.roadmap || [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[generate-learning-roadmap]", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Internal Error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
