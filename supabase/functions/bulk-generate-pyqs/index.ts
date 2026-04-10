import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { examMode = "JEE" } = await req.json();

    // Define all subject-topic combos to generate
    const batches: { subject: string; topics: string[]; yearRange: { start: number; end: number } }[] = [];

    if (examMode === "JEE") {
      batches.push(
        { subject: "physics", topics: ["Mechanics", "Electrodynamics", "Optics", "Waves & Sound", "Magnetism", "Thermodynamics", "Modern Physics"], yearRange: { start: 1998, end: 2024 } },
        { subject: "chemistry", topics: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Coordination Compounds", "Chemical Bonding", "Equilibrium", "Electrochemistry"], yearRange: { start: 1998, end: 2024 } },
        { subject: "mathematics", topics: ["Calculus", "Algebra", "Coordinate Geometry", "Trigonometry", "Vectors & 3D", "Probability & Statistics", "Complex Numbers"], yearRange: { start: 1998, end: 2024 } },
      );
    } else if (examMode === "NEET") {
      batches.push(
        { subject: "physics", topics: ["Mechanics", "Electrodynamics", "Optics", "Waves", "Thermodynamics", "Modern Physics"], yearRange: { start: 1998, end: 2024 } },
        { subject: "chemistry", topics: ["Physical Chemistry", "Organic Chemistry", "Inorganic Chemistry", "Biomolecules", "Polymers"], yearRange: { start: 1998, end: 2024 } },
        { subject: "biology", topics: ["Genetics", "Ecology", "Human Physiology", "Plant Physiology", "Cell Biology", "Reproduction", "Evolution", "Biotechnology"], yearRange: { start: 1998, end: 2024 } },
      );
    } else if (examMode === "CUET") {
      batches.push(
        { subject: "english", topics: ["Comprehension", "Grammar", "Vocabulary"], yearRange: { start: 2022, end: 2024 } },
        { subject: "mathematics", topics: ["Calculus", "Algebra", "Matrices", "Linear Programming", "Vectors"], yearRange: { start: 2022, end: 2024 } },
        { subject: "physics", topics: ["Electrostatics", "Optics", "Modern Physics", "Magnetism"], yearRange: { start: 2022, end: 2024 } },
        { subject: "chemistry", topics: ["Organic", "Inorganic", "Physical Chemistry"], yearRange: { start: 2022, end: 2024 } },
        { subject: "biology", topics: ["Genetics", "Ecology", "Reproduction", "Molecular Biology"], yearRange: { start: 2022, end: 2024 } },
        { subject: "economics", topics: ["Microeconomics", "Macroeconomics", "Indian Economy"], yearRange: { start: 2022, end: 2024 } },
        { subject: "accountancy", topics: ["Partnership", "Company Accounts", "Ratio Analysis"], yearRange: { start: 2022, end: 2024 } },
        { subject: "general_test", topics: ["Reasoning", "Quantitative Aptitude", "Data Interpretation", "General Knowledge"], yearRange: { start: 2022, end: 2024 } },
      );
    }

    const results: { subject: string; topic: string; generated: number; status: string }[] = [];
    let totalGenerated = 0;

    // Process each batch by calling the existing generate-pyq-questions function
    for (const batch of batches) {
      for (const topic of batch.topics) {
        try {
          const { data, error } = await supabase.functions.invoke("generate-pyq-questions", {
            body: {
              subject: batch.subject,
              chapterName: topic,
              subchapterName: topic,
              chapterId: `pyq_${batch.subject}_${topic.toLowerCase().replace(/\s+/g, '_')}`,
              subchapterId: `pyq_${batch.subject}_${topic.toLowerCase().replace(/\s+/g, '_')}_sub`,
              yearRange: batch.yearRange,
              count: 25,
              examMode,
            },
          });

          const count = data?.questions?.length || 0;
          totalGenerated += count;
          results.push({ subject: batch.subject, topic, generated: count, status: error ? "error" : "success" });

          // Small delay to avoid rate limits
          await new Promise(r => setTimeout(r, 2000));
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Unknown error";
          results.push({ subject: batch.subject, topic, generated: 0, status: `error: ${message}` });
        }
      }
    }

    return new Response(JSON.stringify({
      examMode,
      totalGenerated,
      batches: results,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("bulk-generate-pyqs error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
