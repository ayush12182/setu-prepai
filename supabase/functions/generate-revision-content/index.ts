import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, subject, examMode = "JEE", language = "english", chapter } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let systemPrompt = "";
    let userPrompt = "";

    const examLabel = examMode === "CUET" ? "CUET UG" : examMode === "NEET" ? "NEET" : "JEE";
    const langRule = language === "english"
      ? "100% ENGLISH ONLY. Professional, academic tone."
      : language === "hindi"
      ? "100% हिंदी (देवनागरी)। तकनीकी शब्द अंग्रेज़ी में।"
      : "Hinglish coaching style. Friendly mentor tone.";

    if (type === "formulas") {
      systemPrompt = `You are a ${examLabel} exam revision expert creating a formula/concept sheet for ${subject}.
Language: ${langRule}

OUTPUT FORMAT (STRICT JSON ARRAY):
Return ONLY a valid JSON array. No markdown, no code blocks, no explanation.

Each element:
{
  "chapter": "Chapter Name",
  "formulas": [
    {
      "title": "Formula Name",
      "latex": "Formula in LaTeX (e.g. F=ma, NO $ signs)",
      "variables": [
        { "symbol": "F", "meaning": "Force", "unit": "N" }
      ],
      "usedFor": "1-line explanation of when to use this",
      "difficulty": "Hard | Medium | Easy",
      "importance": 5,
      "jeeFrequency": "Very High | High | Medium | Low",
      "commonMistake": "Common error students make",
      "shortcut": "Any shortcut or trick",
      "derivation": "Short explanation of derivation",
      "relatedFormulas": ["Formula A", "Formula B"],
      "prerequisiteConcepts": ["Concept A", "Concept B"],
      "topic": "Subtopic name",
      "tags": ["Tag1", "Tag2"]
    }
  ]
}

Rules:
- ${chapter ? "Generate 10-15 formulas for the requested chapter." : "Return 4-6 chapters with 5-8 formulas each."}
- For ${examMode === "CUET" ? "CUET: Focus on NCERT Class 12 definitions, key terms, ratios." : "JEE/NEET: Use strict LaTeX for the 'latex' field. Do not include $ or $$ wrappers."}
- Importance should be an integer from 1 to 5.
- Make sure 'topic' is a short, concise categorization string (e.g., 'Newton\\'s Laws', 'Gauss Law').
- Include current year exam trends
- ONLY return the JSON array, nothing else`;

      userPrompt = `Generate a ${examLabel} formula/concept sheet for subject: ${subject}${chapter ? `, specifically for the chapter: ${chapter}` : ""}.
Include exam-critical formulas that students often miss. Focus on ${new Date().getFullYear()} exam patterns.`;

    } else {
      // (Difference tables and quizzes logic remains simple for now, as focus is formulas)
      return new Response(JSON.stringify({ error: "Only formulas type is currently supported for Knowledge Base injection." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          generationConfig: { temperature: 0.8, response_mime_type: "application/json" },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    let parsed: any[];
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse AI response", raw: content }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Process the formulas and insert into Supabase Knowledge Base
    if (type === "formulas" && Array.isArray(parsed)) {
      for (const chapterData of parsed) {
        if (!chapterData.chapter || !chapterData.formulas) continue;

        const chapName = chapterData.chapter;
        const formulas = chapterData.formulas;
        
        // Upsert Chapter Metadata
        const formulaCount = formulas.length;
        const highPriorityCount = formulas.filter((f: any) => f.importance >= 4).length;
        const revisionTimeMins = Math.ceil(formulaCount * 1.5); // Average 1.5 mins per formula
        
        const { data: chapterRes, error: chapError } = await supabase
          .from("revision_chapter_metadata")
          .upsert({
            subject,
            chapter_name: chapName,
            formula_count: formulaCount,
            high_priority_formula_count: highPriorityCount,
            revision_time_mins: revisionTimeMins,
            updated_at: new Date().toISOString()
          }, { onConflict: 'subject,chapter_name' })
          .select()
          .single();

        if (chapError || !chapterRes) {
          console.error("Failed to upsert chapter metadata:", chapError);
          continue;
        }

        const chapterId = chapterRes.id;

        // Delete existing formulas for this chapter to do a fresh replacement
        await supabase.from("revision_formulas").delete().eq("chapter_id", chapterId);

        // Insert new formulas
        const formulasToInsert = formulas.map((f: any) => ({
          chapter_id: chapterId,
          subject,
          chapter_name: chapName,
          topic: f.topic || 'General',
          title: f.title || 'Untitled',
          latex: f.latex || '',
          variables: f.variables || [],
          used_for: f.usedFor || '',
          difficulty: f.difficulty || 'Medium',
          importance: f.importance || 3,
          jee_frequency: f.jeeFrequency || 'Medium',
          shortcut: f.shortcut || '',
          common_mistake: f.commonMistake || '',
          derivation: f.derivation || '',
          related_formulas: f.relatedFormulas || [],
          prerequisite_concepts: f.prerequisiteConcepts || [],
          tags: f.tags || []
        }));

        if (formulasToInsert.length > 0) {
           const { error: insertErr } = await supabase.from("revision_formulas").insert(formulasToInsert);
           if (insertErr) console.error("Failed to insert formulas:", insertErr);
        }
      }
    }

    return new Response(JSON.stringify({ success: true, message: "Successfully inserted into Knowledge Base" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-revision-content error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
