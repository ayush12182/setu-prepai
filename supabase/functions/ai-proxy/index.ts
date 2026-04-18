/**
 * ai-proxy — Public Lovable AI proxy endpoint
 *
 * Lets external tools (e.g. Antigravity) call Lovable AI through this app.
 * Auth: pass header `x-api-key: <PROXY_API_KEY>` (set as a Supabase secret).
 *
 * POST body (OpenAI-compatible):
 * {
 *   "model": "google/gemini-3-flash-preview",
 *   "messages": [{ "role": "user", "content": "Hello" }],
 *   "stream": false
 * }
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PROXY_API_KEY = Deno.env.get("PROXY_API_KEY");

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!PROXY_API_KEY) {
      return new Response(
        JSON.stringify({ error: "PROXY_API_KEY not configured. Set it in Cloud → Secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Auth: accept either x-api-key or Authorization: Bearer <key>
    const provided =
      req.headers.get("x-api-key") ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ||
      "";

    if (provided !== PROXY_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Unauthorized. Provide x-api-key header." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      model = "google/gemini-3-flash-preview",
      messages,
      stream = false,
      ...rest
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "`messages` must be a non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model, messages, stream, ...rest }),
    });

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await upstream.text();
      return new Response(
        JSON.stringify({ error: "Upstream error", status: upstream.status, detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (stream) {
      return new Response(upstream.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await upstream.json();
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("[ai-proxy] error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
