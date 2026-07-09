import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_THRESHOLD = 30; 
const TARGET_GENERATE = 100;

async function generateWithGemini(geminiKey: string, prompt: string, count: number, timeoutMs: number = 0): Promise<any[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
  const abortController = new AbortController();
  let timeoutId: number | undefined;

  if (timeoutMs > 0) {
    timeoutId = setTimeout(() => abortController.abort(), timeoutMs);
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
        }
      }),
      signal: abortController.signal
    });

    if (timeoutId) clearTimeout(timeoutId);

    if (!res.ok) {
      console.error(`Gemini Error: ${res.status}`);
      return [];
    }

    const json = await res.json();
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return [];

    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsed = JSON.parse(cleaned);
    return parsed.questions || [];
  } catch (err: any) {
    if (timeoutId) clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn(`Gemini call timed out after ${timeoutMs}ms`);
      return [];
    }
    console.error("Gemini fetch error:", err);
    return [];
  }
}

function buildPrompt(exam: string, subject: string, chapter: string, difficulty: string, count: number) {
  return `
You are an expert ${exam} examiner for ${subject}.
Generate ${count} high-quality, strictly unique ${difficulty || "medium"} difficulty multiple-choice questions for the chapter: "${chapter}".

These must be premium, coaching-level questions (like Allen/Resonance/Physics Galaxy) that test conceptual understanding and mathematical rigor, NOT just factual recall.

Return a JSON object containing an array of exactly ${count} question objects.
Each question object MUST strictly follow this JSON schema:
{
  "questions": [
    {
      "question_text": "The actual question...",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct_option": "A", 
      "explanation": "Detailed step-by-step solution...",
      "topic": "The specific topic within the chapter",
      "concept": "The core concept tested",
      "distractor_logic": {
        "B": "Why a student might wrongly choose B",
        "C": "Why a student might wrongly choose C",
        "D": "Why a student might wrongly choose D"
      }
    }
  ]
}

Make sure LaTeX is properly escaped (e.g., \\\\frac, \\\\sqrt, etc).
Do NOT include markdown block markers like \`\`\`json. Output ONLY raw JSON.
`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { exam, subject, chapter, chapterId, difficulty, count, isBackgroundJob } = await req.json();

    if (!exam || !subject || !chapter || !count) {
      return new Response(JSON.stringify({ error: "Missing required parameters" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const geminiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiKey) throw new Error("GEMINI_API_KEY not configured");

    // ==========================================
    // BACKGROUND WORKER PATH
    // ==========================================
    if (isBackgroundJob) {
      console.log(`[BACKGROUND] Generating ${count} questions for ${subject} -> ${chapter}`);
      const numWorkers = 4;
      const qsPerWorker = Math.ceil(count / numWorkers);
      const prompt = buildPrompt(exam, subject, chapter, difficulty, qsPerWorker);
      
      const promises = [];
      for(let i=0; i<numWorkers; i++) {
        promises.push(generateWithGemini(geminiKey, prompt, qsPerWorker, 120000));
      }
      
      const results = await Promise.all(promises);
      const generatedQs = results.flat();
      
      console.log(`[BACKGROUND] Generated ${generatedQs.length} questions successfully.`);

      const dbInserts = generatedQs.map((q: any) => ({
        id: crypto.randomUUID(),
        exam_type: exam === 'JEE' ? 'JEE_MAINS' : exam,
        subject,
        chapter_id: chapterId || "phy-1",
        chapter: chapter,
        topic: q.topic || "General",
        concept: q.concept || "",
        difficulty: (difficulty || "medium").toLowerCase(),
        question_type: "MCQ",
        question_text: q.question_text,
        option_a: q.options.A,
        option_b: q.options.B,
        option_c: q.options.C,
        option_d: q.options.D,
        correct_option: q.correct_option,
        explanation: q.explanation,
        is_verified: false,
        verification_status: 'PENDING',
        source: "ai_generated",
        generation_model: "gemini-2.5-flash-parallel"
      }));

      if (dbInserts.length > 0) {
        await supabase.from("questions").insert(dbInserts);
      }
      return new Response(JSON.stringify({ success: true, count: generatedQs.length }), { headers: corsHeaders });
    }

    // ==========================================
    // FRONTEND REQUEST PATH
    // ==========================================
    
    // 1. Check existing questions in consolidated 'questions' table
    const examTypes = exam.toUpperCase() === 'JEE' || exam.toUpperCase() === 'JEE_MAINS'
      ? ['JEE_MAINS', 'JEE_ADVANCED', 'JEE']
      : [exam.toUpperCase()];

    let dbQuery = supabase
      .from("questions")
      .select("*")
      .in("exam_type", examTypes)
      .eq("subject", subject)
      .eq("difficulty", (difficulty || "medium").toLowerCase());

    if (chapterId) {
      dbQuery = dbQuery.eq("chapter_id", chapterId);
    } else {
      dbQuery = dbQuery.eq("chapter", chapter);
    }

    const { data: cachedQuestions, error: fetchError } = await dbQuery.limit(TARGET_GENERATE);

    if (fetchError) throw fetchError;

    const availableCount = cachedQuestions?.length || 0;
    let questionsToReturn = cachedQuestions?.slice(0, count) || [];
    let generationMode = "cache";
    let message = "Loaded from cache";

    // 2. If we don't have enough questions:
    if (availableCount < count) {
      console.log(`[INLINE] Cache miss for ${chapter}. Need ${count}, have ${availableCount}. Generating inline...`);
      generationMode = "ai_inline";
      const deficit = count - availableCount;
      const prompt = buildPrompt(exam, subject, chapter, difficulty, deficit);
      
      // OPTIMIZATION: If cache is completely empty, disable timeout (0) to guarantee
      // that the student gets a test. If we have some questions cached, cap at 8s.
      const inlineTimeout = availableCount === 0 ? 0 : 8000;
      
      const generatedQs = await generateWithGemini(geminiKey, prompt, deficit, inlineTimeout);
      
      if (generatedQs.length > 0) {
        const dbInserts = generatedQs.map((q: any) => ({
          id: crypto.randomUUID(),
          exam_type: exam === 'JEE' ? 'JEE_MAINS' : exam,
          subject,
          chapter_id: chapterId || "phy-1",
          chapter: chapter,
          topic: q.topic || "General",
          concept: q.concept || "",
          difficulty: (difficulty || "medium").toLowerCase(),
          question_type: "MCQ",
          question_text: q.question_text,
          option_a: q.options.A,
          option_b: q.options.B,
          option_c: q.options.C,
          option_d: q.options.D,
          correct_option: q.correct_option,
          explanation: q.explanation,
          is_verified: false,
          verification_status: 'PENDING',
          source: "ai_generated",
          generation_model: "gemini-2.5-flash-inline"
        }));
        
        await supabase.from("questions").insert(dbInserts);
        questionsToReturn = [...questionsToReturn, ...dbInserts];
        message = "Generated inline successfully";
      } else {
        message = "Inline generation timed out or failed. Returning partial cache.";
      }
    }

    const shouldTriggerBackground = availableCount < CACHE_THRESHOLD;

    return new Response(JSON.stringify({ 
      questions: questionsToReturn.slice(0, count), 
      generationMode,
      message,
      triggerBackground: shouldTriggerBackground,
      backgroundCount: TARGET_GENERATE
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err: any) {
    console.error("Test generation error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
