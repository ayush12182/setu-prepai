/**
 * generate-notes — Supabase Edge Function
 * Premium Smart Revision Notes Generator (JSON Pipeline)
 * ENGINE: Gemini 2.5 Flash
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function buildPrompt(chapterName: string, subject: string, topics: string[], examMode: string): string {
  const topicList = topics.length > 0 ? topics.join(", ") : chapterName;
  const exam = examMode.toUpperCase().includes("NEET") ? "NEET" : examMode.toUpperCase().includes("CUET") ? "CUET" : "JEE Main + Advanced";

  return `SYSTEM PROMPT — PREPENTRANCE PREMIUM JSON REVISION ENGINE

You are an expert Kota faculty generating a highly structured JSON revision note for ${exam}.
Your output MUST be valid JSON. No markdown wrappers around the JSON. No conversational text. Just raw JSON.

CRITICAL INSTRUCTIONS:
- NEVER define UI colors or presentation styles. Use semantic importance (e.g. importance: "high").
- Always use the provided enums for graphs and diagrams. NEVER invent free-text diagram names.
- Ensure KaTeX formulas use standard syntax.

=========================================
REQUIRED JSON SCHEMA
=========================================
{
  "schemaVersion": "1.0.0",
  "generator": "gemini-2.5-flash",
  "generatedAt": "<current_iso_timestamp>",
  "chapter": "${chapterName}",
  "metadata": {
    "title": "...",
    "weightage": "⭐⭐⭐⭐☆",
    "expectedQuestions": "1-2",
    "time": "10-12 min",
    "difficulty": "Moderate"
  },
  "whyThisMatters": [
    "Bullet 1", "Bullet 2", "Bullet 3"
  ],
  "conceptMap": {
    "nodes": [
      { "id": "1", "label": "Motion" }
    ],
    "edges": [
      { "from": "1", "to": "2" }
    ]
  },
  "highYieldTopics": [
    { "topic": "Projectile Motion", "stars": 3 }
  ],
  "formulaCards": [
    {
      "id": "kin_001",
      "name": "Final Velocity",
      "latex": "v=u+at",
      "variables": "v: Final velocity, u: Initial velocity...",
      "whenToUse": "Constant acceleration only",
      "commonMistake": "Using when acceleration is variable",
      "pyqFrequency": "Very High"
    }
  ],
  "graphs": [
    {
      "type": "<MUST BE ONE OF: position_time, velocity_time, acceleration_time, projectile, shm, waves, electric_field, magnetic_field, lens, mirror, circuits, functions, parabola, circle, ellipse, hyperbola, trigonometry>",
      "variant": "uniform_acceleration",
      "annotations": ["slope", "area"],
      "interactive": true
    }
  ],
  "diagrams": [
    {
      "type": "<MUST BE ONE OF: projectile_motion, river_boat, free_fall, circular_motion, reaction_mechanism, periodic_trends, energy_profile, orbitals, hybridization>",
      "showVelocity": true,
      "showGravity": true,
      "showTrajectory": true,
      "showAngle": true
    }
  ],
  "memoryTricks": [
    { "title": "...", "explanation": "..." }
  ],
  "commonMistakes": [
    { "wrong": "...", "right": "...", "why": "..." }
  ],
  "pyqAnalysis": [
    { "topic": "...", "frequency": "Very High", "stars": 5 }
  ],
  "quickRevision": {
    "formulas": [
      { "equation": "...", "name": "..." }
    ]
  },
  "checklist": [
    "Checklist item 1", "Checklist item 2"
  ]
}
=========================================

INPUT DETAILS:
  Chapter: ${chapterName}
  Subject: ${subject}
  Topics: ${topicList}
  Target Exam: ${exam}
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

  if (!GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: "Configuration Error: GEMINI_API_KEY not set" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const {
      chapterName,
      subject = "Physics",
      topics = [],
      examMode = "JEE",
      mode = "notes",
      language = "english",
      forceRegenerate = false,
      action,
      chapterId: clearChapterId,
    } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (action === 'clearCache' && clearChapterId) {
      const { error: delError } = await supabase.from('chapter_standardized_notes').delete().eq('chapter_id', clearChapterId);
      if (delError) throw new Error(delError.message);
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (!chapterName) {
      return new Response(JSON.stringify({ error: "chapterName is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const chapterId = chapterName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const lang = (language || "english").toLowerCase();

    // Cache lookup
    if (mode === "notes" && !forceRegenerate) {
      const { data: cachedNote } = await supabase
        .from("chapter_standardized_notes")
        .select("content")
        .eq("chapter_id", chapterId)
        .eq("language", lang)
        .maybeSingle();

      if (cachedNote?.content) {
        console.log(`[GenerateNotes] Cache HIT for Chapter: ${chapterName}`);
        try {
            const parsedCache = JSON.parse(cachedNote.content);
            return new Response(JSON.stringify({ success: true, data: parsedCache }), {
              headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-cache" },
            });
        } catch(e) {
            console.warn("[GenerateNotes] Cache contained invalid JSON, ignoring.");
        }
      }
    }

    const prompt = buildPrompt(chapterName, subject, topics, examMode);
    const model = "gemini-2.5-flash";
    let finalJsonData = null;
    let attempts = 0;
    const maxAttempts = 3;

    // Generation and Validation Loop
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`[GenerateNotes] Attempt ${attempts} for ${chapterName}`);
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.3,
              responseMimeType: "application/json",
            }
          }),
        }
      );

      if (!response.ok) {
        console.error(`Attempt ${attempts} failed HTTP ${response.status}`);
        continue;
      }

      const resData = await response.json();
      const content = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!content) continue;

      try {
        const parsed = JSON.parse(content);
        
        // Basic Validation Schema check
        if (!parsed.schemaVersion || !parsed.metadata || !parsed.metadata.title) {
          throw new Error("Missing required schema fields");
        }
        
        // Validation passed
        finalJsonData = parsed;
        break;
      } catch (err) {
        console.error(`Attempt ${attempts} Validation Failed:`, err.message);
      }
    }

    if (!finalJsonData) {
       return new Response(JSON.stringify({ error: "Failed to generate valid JSON content after multiple attempts." }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Save to Cache
    const jsonString = JSON.stringify(finalJsonData);
    await supabase.from("chapter_standardized_notes").upsert({
        chapter_id: chapterId,
        chapter_name: chapterName,
        subject: subject,
        language: lang,
        content: jsonString,
    }, { onConflict: "chapter_id,language" });

    // Return the response synchronously to the frontend
    return new Response(JSON.stringify({ success: true, data: finalJsonData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-cache" },
    });

  } catch (error: any) {
    console.error("[GenerateNotes] Fatal Error:", error);
    return new Response(JSON.stringify({ error: error.message || "Internal Engine Error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
