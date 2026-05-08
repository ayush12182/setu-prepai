/**
 * ai-proxy — Generic AI proxy backed by Gemini 1.5 Flash
 * Accepts OpenAI-style messages, returns OpenAI-style response.
 * Auth: pass header `x-api-key: <PROXY_API_KEY>` (set as a Supabase secret).
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
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const PROXY_API_KEY = Deno.env.get("PROXY_API_KEY");

    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Auth check (optional — skip if no PROXY_API_KEY is set)
    if (PROXY_API_KEY) {
      const provided =
        req.headers.get("x-api-key") ||
        req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
      if (provided !== PROXY_API_KEY) {
        return new Response(
          JSON.stringify({ error: "Unauthorized. Provide x-api-key header." }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
    }

    const body = await req.json().catch(() => ({}));
    const { messages, temperature = 0.7, ...rest } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "`messages` must be a non-empty array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Convert OpenAI messages to Gemini format
    const systemMsg = messages.find((m: any) => m.role === "system");
    const userMsgs = messages.filter((m: any) => m.role !== "system");
    const contents = userMsgs.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    if (systemMsg && contents.length > 0) {
      contents[0].parts[0].text = `${systemMsg.content}\n\n${contents[0].parts[0].text}`;
    }

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents, generationConfig: { temperature } }),
      }
    );

    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(
        JSON.stringify({ error: "Gemini error", status: upstream.status, detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const data = await upstream.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Return OpenAI-compatible response
    return new Response(JSON.stringify({
      choices: [{ message: { role: "assistant", content: text }, finish_reason: "stop" }],
      model: "gemini-2.5-flash",
    }), {
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
