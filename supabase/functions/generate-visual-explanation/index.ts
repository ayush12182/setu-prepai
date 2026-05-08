import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callGeminiJSON } from "../_shared/gemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { topic, subconcept, weaknessType, studentErrorType, classLevel } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not configured");

    const systemPrompt = `You are an AI Visual Learning Engine that combines visual explanation + validation + mastery tracking for JEE/NEET/CBSE students.

========================
🎬 OBJECTIVE
========================
Generate a VISUAL-FIRST learning experience, not text-heavy notes. 

The output must include:
1. Animation Concept (Scene-by-scene breakdown, focus on what changes)
2. Visual Explanation Script (Jeetu Bhaiya style, conversational, corrects mistake step-by-step)
3. Misconception Demonstration (Show WRONG thinking vs CORRECT thinking visually)
4. Interactive Element (Slider/toggle/drag simulation suggestion)
5. Learning Validation (3 MCQ questions: 2 easy, 1 medium)
6. Confidence Recheck Prompt (e.g. "Ab bata — kitna confidence hai is concept pe?")
7. Mastery Decision Logic (Define outcomes based on 0-3 score)

========================
🎨 STYLE RULES
========================
- Minimal text, maximum visualization
- Use colors: Red (mistake), Green (correct), Yellow (attention)
- Avoid long theory

========================
📦 OUTPUT FORMAT (STRICT JSON)
========================
{
  "animation_scenes": [{"scene": 1, "description": "...", "visuals": "..."}],
  "script": "...",
  "misconception_demo": {"wrong_view": "...", "correction_steps": ["..."]},
  "interaction": {"type": "slider|drag|toggle", "description": "...", "goal": "..."},
  "validation_questions": [
    {"question": "...", "options": [], "correct_answer": 0, "difficulty": "easy|medium", "visual_hint": "..."}
  ],
  "confidence_prompt": "...",
  "mastery_logic": {"3_correct": "...", "2_correct": "...", "less_than_2": "..."}
}`;

    const userPrompt = `Topic: ${topic}
Subconcept: ${subconcept}
Student Weakness Type: ${weaknessType}
Student Error Type: ${studentErrorType}
Class Level: ${classLevel}`;

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
