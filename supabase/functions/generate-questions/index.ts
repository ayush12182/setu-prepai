import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-key",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

async function generateWithGemini(prompt: string, timeoutMs: number = 8000): Promise<any[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.7, 
          responseMimeType: 'application/json'
        },
      }),
      signal: abortController.signal
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Gemini Error: ${res.status}`);
      return [];
    }

    const raw = await res.json();
    const text = raw.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];

    let cleanedText = text.trim();
    if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleanedText);
    return parsed.questions || [];
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`[Timeout] Gemini call aborted after ${timeoutMs}ms`);
    } else {
      console.error("Gemini call failed:", err.message);
    }
    return [];
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    // Destructure standard parameters passed by useAssessmentEngine.ts & usePracticeQuestions.ts
    const { 
      examMode,
      subject,
      chapterId,
      chapterName,
      subchapterId,
      subchapterName,
      difficulty,
      count = 10,
      excludeIds = [],
      excludeQuestionIds = []
    } = body;

    const examStr = examMode || "JEE";
    const chapterCode = chapterId || "phy-1";
    const difficultyStr = difficulty || "medium";
    const finalExcludeIds = [...excludeIds, ...excludeQuestionIds];

    if (!examStr || !subject || !chapterCode || !difficultyStr) {
      return new Response(JSON.stringify({ error: "Missing required parameters", body }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const examUpper = examStr.toUpperCase();
    let examTypes = [examUpper];
    if (examUpper === 'JEE') {
      examTypes = ['JEE_MAINS', 'JEE_ADVANCED'];
    }

    // 1. Fetch Cached Questions from Database (Cache Read: ~100ms)
    // Matches by chapter_id (code like 'phy-1') and status
    const { data: cachedQuestions, error: dbError } = await supabase
      .from('questions')
      .select('*')
      .eq('verification_status', 'APPROVED')
      .in('exam_type', examTypes)
      .eq('chapter_id', chapterCode)
      .eq('difficulty', difficultyStr.toLowerCase())
      .limit(count * 3);

    if (dbError) {
      console.warn("Error fetching from cache:", dbError.message);
    }

    let usableCache = [];
    if (cachedQuestions) {
       usableCache = cachedQuestions.filter(q => !finalExcludeIds.includes(q.question_id) && !finalExcludeIds.includes(q.id));
    }

    // Cache hit: If we have enough questions, return immediately!
    if (usableCache.length >= count) {
      const shuffled = usableCache.sort(() => 0.5 - Math.random());
      const mapped = shuffled.slice(0, count).map(q => ({
        id: q.id,
        subchapter_id: q.subchapter_id,
        chapter_id: q.chapter_id,
        subject: q.subject,
        difficulty: q.difficulty,
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option,
        explanation: q.explanation,
        concept_tested: q.concept_tested,
        common_mistake: q.common_mistake,
        is_verified: q.is_verified,
        verification_status: q.verification_status,
        exam_type: q.exam_type,
        question_type: q.question_type,
        source: q.source
      }));
      
      return new Response(JSON.stringify({ questions: mapped, source: 'cache', generationMode: 'offline' }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. Generate Missing Questions via Gemini (No timeout if cache is empty, 8s if partial)
    const missingCount = count - usableCache.length;
    console.log(`Cache hit: ${usableCache.length}. Generating ${missingCount} new questions for ${chapterCode} (${difficultyStr})`);

    const prompt = `You are a legendary JEE/NEET exam question setter at a premium institute like Allen or Resonance in Kota.
Generate EXACTLY ${missingCount} brand new, highly rigorous multiple-choice questions for ${examStr} ${subject}.
Chapter: ${chapterName || chapterCode}
Topic/Subtopic: ${subchapterName || 'General'}
Difficulty Level: ${difficultyStr} (Easy=NCERT, Medium=Coaching Sheet, Hard=JEE Main Difficult, Very Hard=JEE Advanced/Olympiad)

CRITICAL RULES:
1. Do not repeat standard textbook questions. Generate fresh, application-based questions.
2. Ensure mathematical rigor. Use LaTeX notation ($...$ or $$...$$) for equations.
3. Distractors (wrong options) must be realistic common mistakes made by students.

You MUST return a valid JSON object EXACTLY matching this schema. DO NOT wrap the JSON in Markdown code blocks. 
{
  "questions": [
    {
      "question": "Question text here...",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctOption": "A",
      "solution": "Step by step solution... Concept -> Approach -> Solution -> Shortcut -> Common Mistake",
      "hint": "Level 1 Hint...",
      "concept": "Specific concept tested",
      "estimatedTime": "120"
    }
  ]
}`;

    const inlineTimeout = usableCache.length === 0 ? 0 : 8000;
    const generated = await generateWithGemini(prompt, inlineTimeout);

    // 3. Transform and Insert into Supabase Cache
    const dbInserts = generated.map((q: any) => {
      return {
        subchapter_id: subchapterId || chapterCode,
        chapter_id: chapterCode,
        subject: subject,
        difficulty: difficultyStr.toLowerCase(),
        question_text: q.question,
        option_a: q.options[0] || "",
        option_b: q.options[1] || "",
        option_c: q.options[2] || "",
        option_d: q.options[3] || "",
        correct_option: q.correctOption,
        explanation: q.solution,
        concept_tested: q.concept || "General",
        verification_status: 'APPROVED',
        is_verified: true,
        exam_type: examUpper === 'JEE' ? 'JEE_MAINS' : examUpper,
        question_type: 'MCQ',
        source: 'Live AI Generator'
      };
    });

    let insertedRows = [];
    if (dbInserts.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from('questions')
        .insert(dbInserts)
        .select('*');
        
      if (insertError) {
        console.error("Failed to cache questions:", insertError);
      } else if (inserted) {
        console.log(`Successfully cached ${inserted.length} new questions.`);
        insertedRows = inserted;
      }
    }

    // Combine cache and newly generated (mapped to frontend interface format)
    const formattedCache = usableCache.map(q => ({
      id: q.id,
      subchapter_id: q.subchapter_id,
      chapter_id: q.chapter_id,
      subject: q.subject,
      difficulty: q.difficulty,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake,
      is_verified: q.is_verified,
      verification_status: q.verification_status,
      exam_type: q.exam_type,
      question_type: q.question_type,
      source: q.source
    }));

    const formattedInserts = insertedRows.map(q => ({
      id: q.id,
      subchapter_id: q.subchapter_id,
      chapter_id: q.chapter_id,
      subject: q.subject,
      difficulty: q.difficulty,
      question_text: q.question_text,
      option_a: q.option_a,
      option_b: q.option_b,
      option_c: q.option_c,
      option_d: q.option_d,
      correct_option: q.correct_option,
      explanation: q.explanation,
      concept_tested: q.concept_tested,
      common_mistake: q.common_mistake,
      is_verified: q.is_verified,
      verification_status: q.verification_status,
      exam_type: q.exam_type,
      question_type: q.question_type,
      source: q.source
    }));

    const finalQuestions = [...formattedCache, ...formattedInserts];

    return new Response(JSON.stringify({ 
      questions: finalQuestions, 
      source: formattedInserts.length > 0 ? 'ai_hybrid' : 'partial_fallback',
      generationMode: formattedInserts.length > 0 ? 'ai' : 'offline'
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Edge Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
