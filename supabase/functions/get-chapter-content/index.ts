/**
 * get-chapter-content — Supabase Edge Function
 * PrepEntrance Permanent Content Repository — Student Read Endpoint
 *
 * PURPOSE:
 *   Serve stored chapter content to students.
 *   ZERO AI calls. Pure database read.
 *   Replaces the AI-generation path that was previously triggered on every student visit.
 *
 * FLOW:
 *   GET /get-chapter-content?chapterId=phy-1&examType=JEE&language=english
 *   → Query chapter_content WHERE status='published' ORDER BY version DESC LIMIT 1
 *   → Return structured content JSON
 *   → Cache-Control: 1 hour (CDN cacheable)
 *
 * PERFORMANCE TARGET:
 *   < 200ms from DB | < 50ms with CDN cache | 0ms AI latency
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);

    // Support both GET (student reads) and POST (admin preview)
    let chapterId: string | null = null;
    let examType = "JEE";
    let language = "english";
    let version: number | null = null; // null = latest published

    if (req.method === "GET") {
      chapterId = url.searchParams.get("chapterId");
      examType = url.searchParams.get("examType") || "JEE";
      language = url.searchParams.get("language") || "english";
      const v = url.searchParams.get("version");
      if (v) version = parseInt(v);
    } else if (req.method === "POST") {
      const body = await req.json();
      chapterId = body.chapterId;
      examType = body.examType || "JEE";
      language = body.language || "english";
      version = body.version || null;
    }

    if (!chapterId) {
      return new Response(
        JSON.stringify({ error: "chapterId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── Query Strategy ────────────────────────────────────────
    // 1. Try exact chapter_id match first (e.g. 'phy-1')
    // 2. Fall back to chapter_slug match (e.g. 'kinematics')
    // 3. If specific version requested, get that version (admin preview)
    // 4. Otherwise get latest published version

    let query = supabase
      .from("chapter_content")
      .select([
        "id",
        "chapter_id",
        "chapter_slug",
        "chapter_name",
        "subject",
        "exam_type",
        "language",
        "version",
        "version_label",
        "status",
        "overview",
        "theory",
        "formulas",
        "graphs",
        "diagrams",
        "worked_examples",
        "pyq_insights",
        "common_mistakes",
        "revision_notes",
        "flashcards",
        "mind_map",
        "raw_content",
        "word_count",
        "generation_model",
        "published_at",
        "updated_at",
      ].join(", "))
      .eq("language", language.toLowerCase())
      .order("version", { ascending: false })
      .limit(1);

    // Filter by status (admin preview can request draft)
    if (version !== null) {
      // Admin: specific version (could be draft)
      query = query.eq("version", version);
    } else {
      // Students: always serve published only
      query = query.eq("status", "published");
    }

    // Try chapter_id first
    let { data: content, error } = await query
      .eq("chapter_id", chapterId)
      .maybeSingle();

    // Fallback: try slug match (handles cases like 'kinematics' vs 'phy-1')
    if (!content && !error) {
      const slugResult = await supabase
        .from("chapter_content")
        .select("*")
        .eq("chapter_slug", chapterId)
        .eq("language", language.toLowerCase())
        .eq("status", version !== null ? supabase.raw("status") : "published")
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();

      content = slugResult.data;
      error = slugResult.error;
    }

    if (error) {
      console.error("[get-chapter-content] DB error:", error);
      return new Response(
        JSON.stringify({ error: "Database error", details: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!content) {
      // Chapter exists in syllabus but no published content yet
      console.log(`[get-chapter-content] No published content for: ${chapterId}`);
      return new Response(
        JSON.stringify({
          success: false,
          error: "CONTENT_NOT_PUBLISHED",
          message: "Content for this chapter is being prepared. Check back soon.",
          chapterId,
        }),
        {
          status: 404,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
          },
        }
      );
    }

    console.log(
      `[get-chapter-content] Served: ${content.chapter_name} v${content.version_label} (${content.status})`
    );

    return new Response(
      JSON.stringify({
        success: true,
        data: content,
        meta: {
          version: content.version_label,
          publishedAt: content.published_at,
          updatedAt: content.updated_at,
          wordCount: content.word_count,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
          // Cache for 1 hour — content only changes on admin publish
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (err: any) {
    console.error("[get-chapter-content] Fatal error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
