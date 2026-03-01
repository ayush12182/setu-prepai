import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const { userId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get learning profile
    const { data: profile } = await supabase
      .from('learning_profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    // Get student profile
    const { data: studentProfile } = await supabase
      .from('profiles')
      .select('student_level, target_exam, class')
      .eq('user_id', userId)
      .maybeSingle();

    const weakTopics = (profile?.weak_topics as string[]) || [];
    const strongTopics = (profile?.strong_topics as string[]) || [];
    const gaps = (profile?.prerequisite_gaps as string[]) || [];
    const level = profile?.overall_level || 'beginner';

    const prompt = `Create a 4-week personalized learning roadmap for a Class ${studentProfile?.class || '11'} student (${studentProfile?.target_exam || 'JEE'} track).

Student Profile:
- Overall Level: ${level}
- Weak Topics: ${weakTopics.join(', ') || 'None identified'}
- Strong Topics: ${strongTopics.join(', ') || 'None identified'}
- Prerequisite Gaps: ${gaps.join(', ') || 'None'}
- Concept Score: ${profile?.concept_score || 0}%
- Accuracy Score: ${profile?.accuracy_score || 0}%
- Speed Score: ${profile?.speed_score || 0}%

Rules:
- Week 1: Fix prerequisite gaps
- Week 2: Concept reinforcement on weak topics
- Week 3: Applied practice with mixed problems
- Week 4: Speed drills and revision
- Each week should have 5-7 specific activities
- Each activity needs: name, type (video/practice/notes/quiz), duration (e.g., "30 min")

Return a JSON array of 4 objects:
[{
  "week_number": 1,
  "title": "Foundation Fix",
  "focus_area": "Fix prerequisite gaps",
  "topics": [{"name": "...", "type": "...", "duration": "..."}]
}]

Return ONLY the JSON array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert educational planner. Create actionable, specific learning roadmaps. Return only valid JSON." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let roadmap;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      roadmap = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      // Fallback roadmap
      roadmap = [
        { week_number: 1, title: "Foundation Fix", focus_area: "Fix prerequisite gaps", topics: gaps.map(g => ({ name: `Review: ${g}`, type: "notes", duration: "30 min" })) },
        { week_number: 2, title: "Concept Building", focus_area: "Concept reinforcement", topics: weakTopics.map(t => ({ name: `Study: ${t}`, type: "video", duration: "45 min" })) },
        { week_number: 3, title: "Practice Mode", focus_area: "Applied practice", topics: weakTopics.map(t => ({ name: `Practice: ${t}`, type: "practice", duration: "30 min" })) },
        { week_number: 4, title: "Speed & Revision", focus_area: "Applied practice", topics: [{ name: "Full Mock Test", type: "quiz", duration: "3 hours" }] },
      ];
    }

    // Delete old roadmap for this user
    await supabase.from('learning_roadmaps').delete().eq('user_id', userId);

    return new Response(JSON.stringify({ roadmap }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
