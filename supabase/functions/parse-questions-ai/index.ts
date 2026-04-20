import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { rawText, source = 'AI_GENERATED', exam, subject, userClass } = await req.json();

    if (!rawText) {
      return new Response(JSON.stringify({ error: 'Missing rawText in payload' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!anthropicKey) {
      throw new Error("Missing Anthropic API Key");
    }

    // Call Claude
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 4000,
        system: `You are an expert AI educational content parser and generator in India.
Your job is to parse unstructured question text, PYQ dumps, or raw text and output a strictly typed JSON array of questions matching this schema.

Schema requirements for array objects:
- "exam": "JEE_MAINS" | "NEET" | "CUET"
- "class": "11" | "12" | "dropper"
- "subject": "Physics" | "Chemistry" | "Maths" | "Biology"
- "chapter": string
- "subtopic": string
- "concept": string (concept_tag)
- "difficulty": "easy" | "medium" | "hard"
- "avg_time_seconds": integer
- "question_text": string
- "options": array of exactly 4 strings
- "correct_index": integer (0-3)
- "explanation": string (brief summary)
- "solution_steps": array of strings (detailed steps)
- "common_mistake": string (what students usually get wrong here)
- "mistake_type": "Conceptual" | "Calculation" | "Silly" | "Guessed" | "None"

Output ONLY the JSON array. Do not output any markdown formatting like \`\`\`json. Return just the raw array [{ ... }].`,
        messages: [
          { role: 'user', content: `Parse the following text into structured questions for Exam: ${exam}, Class: ${userClass}, Subject: ${subject}.\n\nRaw text:\n${rawText}` }
        ]
      })
    });

    const llmData = await claudeResponse.json();
    if (llmData.error) {
      throw new Error(`Claude Error: ${llmData.error.message}`);
    }

    const rawJsonString = llmData.content[0].text.trim();
    let parsedQuestions = [];
    try {
      parsedQuestions = JSON.parse(rawJsonString);
    } catch (e) {
      console.error("Failed to parse Claude output directly.");
      parsedQuestions = JSON.parse(rawJsonString.replace(/```json/g, "").replace(/```/g, ""));
    }

    if (!Array.isArray(parsedQuestions)) {
      throw new Error("Output was not a JSON array.");
    }

    // Insert into DB with `is_verified: false`
    const insertPayload = parsedQuestions.map(q => ({
      ...q,
      exam: q.exam || exam,
      class: q.class || userClass,
      subject: q.subject || subject,
      source,
      is_verified: false
    }));

    const { data: dbData, error: dbError } = await supabaseClient
      .from('questions')
      .insert(insertPayload)
      .select();

    if (dbError) throw dbError;

    return new Response(JSON.stringify({ success: true, count: dbData.length, data: dbData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})
