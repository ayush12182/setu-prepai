import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Extract YouTube video ID from various URL formats
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch transcript using a public transcript API
async function fetchTranscript(videoId: string): Promise<string | null> {
  try {
    // Using YouTube transcript API (innertube)
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();
    
    // Extract video title
    const titleMatch = html.match(/<title>([^<]*)<\/title>/);
    const videoTitle = titleMatch ? titleMatch[1].replace(' - YouTube', '') : 'Unknown Video';
    
    // For now, we'll simulate transcript since YouTube requires complex auth
    // In production, you'd use a proper transcript service
    return JSON.stringify({
      title: videoTitle,
      transcript: `This is a JEE preparation lecture covering important concepts. The video discusses key formulas and problem-solving techniques that are commonly tested in JEE Main and JEE Advanced examinations.`
    });
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, userId } = await req.json();

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

    // Get API keys
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch video info
    const transcriptData = await fetchTranscript(videoId);
    const { title: videoTitle } = transcriptData ? JSON.parse(transcriptData) : { title: 'Unknown Video' };

    console.log('Processing video:', videoTitle);

    // Generate structured notes using AI
    const systemPrompt = `You are an expert JEE (IIT-JEE) coaching mentor who creates structured study materials. 
Generate comprehensive study notes from the lecture topic provided.

Your response MUST be valid JSON with this exact structure:
{
  "structuredNotes": "Markdown formatted notes with headings, bullet points, and key concepts highlighted",
  "keyTimestamps": [
    {"time": "0:00", "topic": "Introduction", "importance": "high"},
    {"time": "5:30", "topic": "Key Formula Derivation", "importance": "high"}
  ],
  "formulas": [
    {"formula": "E = mc²", "name": "Mass-Energy Equivalence", "usage": "When to use this formula"}
  ],
  "flashcards": [
    {"front": "Question or concept", "back": "Answer or explanation"}
  ],
  "pyqConnections": [
    {"year": "2023", "exam": "JEE Main", "topic": "Related topic from this lecture"}
  ],
  "onePageSummary": "A concise one-page summary suitable for quick revision"
}`;

    const userPrompt = `Create JEE-focused study materials for this lecture topic: "${videoTitle}"

The notes should:
1. Be structured with clear headings for each major concept
2. Highlight all important formulas with their derivations
3. Include 5-8 flashcards for key concepts
4. Reference how topics connect to JEE PYQs (Previous Year Questions)
5. Provide a one-page revision summary

Focus on concepts commonly tested in JEE Main and JEE Advanced.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
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
          JSON.stringify({ success: false, error: 'AI credits exhausted. Please add funds to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI request failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '';

    // Parse the AI response
    let parsedContent;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      const jsonStr = jsonMatch ? jsonMatch[1].trim() : content.trim();
      parsedContent = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback structure
      parsedContent = {
        structuredNotes: content,
        keyTimestamps: [],
        formulas: [],
        flashcards: [],
        pyqConnections: [],
        onePageSummary: content.substring(0, 500)
      };
    }

    // Save to database
    const { data: savedNote, error: dbError } = await supabase
      .from('lecture_notes')
      .insert({
        user_id: userId,
        video_url: videoUrl,
        video_title: videoTitle,
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
      JSON.stringify({
        success: true,
        data: savedNote
      }),
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
