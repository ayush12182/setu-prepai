import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const HEYGEN_API_KEY = Deno.env.get("HEYGEN_API_KEY");

    if (!HEYGEN_API_KEY) {
      throw new Error("HEYGEN_API_KEY is not configured");
    }

    const response = await fetch("https://api.heygen.com/v1/streaming.create_token", {
      method: "POST",
      headers: {
        "x-api-key": HEYGEN_API_KEY,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HeyGen Token error:", response.status, errorText);
      throw new Error(`HeyGen Token failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("HeyGen token stream error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
