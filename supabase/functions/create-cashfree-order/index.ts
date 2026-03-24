import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order_id, order_amount, customer_details, order_meta } = await req.json();

    // WARNING: In a real system, verify the user token and authenticate them 
    // before allowing an order creation request to pass through.

    // Get the Secret keys stored in Supabase Edge Functions Environment Variables
    const appId = Deno.env.get('CASHFREE_APP_ID');
    const secretKey = Deno.env.get('CASHFREE_SECRET_KEY');

    if (!appId || !secretKey) {
      throw new Error("Cashfree keys are missing from Supabase Environment configuration.");
    }

    const cashfreePayload = {
      order_id,
      order_amount,
      order_currency: "INR",
      customer_details,
      order_meta
    };

    // Call the Cashfree Production API natively from the edge
    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(cashfreePayload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cashfree Order API failed: ${errorText}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
