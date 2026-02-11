import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const KOTA_NOTES_SYSTEM_PROMPT = `You are "Lecture-SETU Notes Engine (Kota Edition)" for JEE/NEET exam preparation.

ABSOLUTE RULES:
- NO LaTeX syntax (no $, \\frac, \\vec, \\sqrt)
- NO Markdown symbols (no **, ##, *, _, #)
- NO escape characters
- NO paragraphs or storytelling

Your response MUST be valid JSON:
{
  "structuredNotes": "Section-wise notes as plain text",
  "keyTimestamps": [{"time": "0:00", "topic": "Topic", "importance": "high"}],
  "formulas": [{"formula": "F = kq₁q₂/r²", "name": "Coulomb's Law", "usage": "For point charges"}],
  "flashcards": [{"front": "Question", "back": "Answer"}],
  "pyqConnections": [{"year": "2023", "exam": "JEE Main", "topic": "Topic"}],
  "onePageSummary": "Crisp summary"
}

SECTION FORMAT FOR structuredNotes:

SECTION 1 – SHORT THEORY (EXAM-READY)
- 5-8 crisp bullet points only
- Pure JEE-relevant explanation

SECTION 2 – KEY FORMULAS (CLEAN EXAM FORMAT)
Use standard physics notation. One formula per line. No LaTeX.
Use subscripts ₁₂₃ and superscripts ²³. Use Greek letters ε, θ, λ, ω directly.

SECTION 3 – WHEN TO USE IN EXAM
3-4 bullet points only.

SECTION 4 – COMMON MISTAKES (JEE TRAPS)
3-4 crisp points.

SECTION 5 – JEETU BHAIYA LINE
ONE line only, Hinglish, calm mentor tone.

For formulas array: Use proper notation like "F = kq₁q₂/r²" NOT words.`;

function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Get video title via oEmbed (reliable, no parsing needed)
async function getVideoTitle(videoId: string): Promise<string> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (res.ok) {
      const data = await res.json();
      return data.title || '';
    }
  } catch (e) {
    console.error('oEmbed failed:', e);
  }
  return '';
}

// Fetch transcript using YouTube's innertube API
async function getTranscript(videoId: string): Promise<string> {
  try {
    // Step 1: Get the video page to find serialized player response with caption tracks
    const pageRes = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    const html = await pageRes.text();

    // Find caption track URL from ytInitialPlayerResponse
    const captionUrlMatch = html.match(/"captionTracks":\[.*?"baseUrl":"(.*?)"/);
    if (!captionUrlMatch) {
      console.log('No caption tracks found in player response');
      
      // Fallback: try to get description
      const descMatch = html.match(/"shortDescription":"((?:[^"\\]|\\.)*)"/);
      if (descMatch) {
        const desc = descMatch[1].replace(/\\n/g, '\n').replace(/\\u0026/g, '&').replace(/\\"/g, '"');
        console.log('Using description as fallback context, length:', desc.length);
        return desc;
      }
      return '';
    }

    // Decode the caption URL
    const captionUrl = captionUrlMatch[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
    console.log('Fetching captions from URL');

    // Step 2: Fetch the caption XML
    const captionRes = await fetch(captionUrl);
    const captionXml = await captionRes.text();

    // Parse text from XML
    const textSegments = captionXml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
    if (!textSegments || textSegments.length === 0) {
      console.log('No text segments in caption XML');
      return '';
    }

    const transcript = textSegments
      .map((seg: string) => {
        const m = seg.match(/<text[^>]*>([\s\S]*?)<\/text>/);
        return m ? m[1]
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'")
          .replace(/\n/g, ' ')
          .trim() : '';
      })
      .filter(Boolean)
      .join(' ');

    console.log('Got transcript, length:', transcript.length, 'chars');
    return transcript;
  } catch (e) {
    console.error('Transcript fetch error:', e);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, userId, language = 'english' } = await req.json();

    if (!videoUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'Video URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const videoId = extractYouTubeVideoId(videoUrl);
    if (!videoId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid YouTube URL. Please provide a valid YouTube video link.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch real video data in parallel
    const [videoTitle, transcript] = await Promise.all([
      getVideoTitle(videoId),
      getTranscript(videoId),
    ]);

    const displayTitle = videoTitle || `Video ${videoId}`;
    console.log('Processing:', displayTitle);
    console.log('Has transcript:', transcript.length > 0, 'length:', transcript.length);

    // Build prompt with real content
    const transcriptSection = transcript
      ? `\n\nACTUAL VIDEO TRANSCRIPT:\n"""\n${transcript.substring(0, 12000)}\n"""`
      : '';

    const isHinglish = language === 'hinglish' || language === 'hindi' || language === 'crisp';
    const langInstruction = isHinglish
      ? `LANGUAGE: Write ALL notes in natural Hinglish (Hindi + English mix). Example: "Bhai, capacitance ka matlab hai charge store karne ki capacity." Formulas stay in universal math notation.`
      : `LANGUAGE: Write ALL notes in clean English. Only the Jeetu Bhaiya signature line should be in Hinglish. Formulas stay in universal math notation.`;

    const userPrompt = `Create Kota-style JEE-focused study materials for this lecture: "${displayTitle}"${transcriptSection}

${langInstruction}

CRITICAL: Generate notes STRICTLY based on the video title${transcript ? ' and transcript' : ''} above.
- Every point must relate to what is taught in THIS specific video.
- Do NOT generate generic or unrelated content.
- Write formulas in proper notation (C = Q/V). Use subscripts ₁₂₃ and superscripts ²³. No LaTeX.
- Include 5-8 flashcards from the concepts in this lecture.
- Connect to real PYQ years where this topic appeared in JEE Main/Advanced.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: KOTA_NOTES_SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    let parsedContent;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedContent = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI JSON, using raw content');
      parsedContent = {
        structuredNotes: content,
        keyTimestamps: [],
        formulas: [],
        flashcards: [],
        pyqConnections: [],
        onePageSummary: content.substring(0, 500)
      };
    }

    const { data: savedNote, error: dbError } = await supabaseClient
      .from('lecture_notes')
      .insert({
        user_id: userId,
        video_url: videoUrl,
        video_title: displayTitle,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        structured_notes: parsedContent.structuredNotes,
        key_timestamps: parsedContent.keyTimestamps,
        formulas: parsedContent.formulas,
        flashcards: parsedContent.flashcards,
        pyq_connections: parsedContent.pyqConnections,
        one_page_summary: parsedContent.onePageSummary,
        processing_status: 'completed'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to save notes. Please try again.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Lecture processed successfully:', savedNote.id);
    return new Response(
      JSON.stringify({ success: true, data: savedNote }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing lecture:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process lecture'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
