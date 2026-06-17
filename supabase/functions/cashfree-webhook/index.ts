import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-api-key, content-type, x-webhook-signature, x-webhook-timestamp",
};

/**
 * Cashfree Webhook Handler
 * 
 * Cashfree sends a POST request to this endpoint when a payment event occurs.
 * We verify the signature, then update the user's subscription status in Supabase.
 * 
 * Security: signature is verified using HMAC-SHA256 before any DB write.
 * Idempotency: we check if the order was already processed before writing.
 * 
 * Required Secrets (set in Supabase Dashboard → Edge Functions → Secrets):
 *   - CASHFREE_WEBHOOK_SECRET: Your Cashfree webhook secret key
 *   - SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 */

async function verifySignature(
  rawBody: string,
  timestamp: string,
  receivedSignature: string,
  secret: string
): Promise<boolean> {
  try {
    const data = `${timestamp}${rawBody}`;
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      new TextEncoder().encode(data)
    );
    // Convert to base64
    const computedSignature = btoa(
      String.fromCharCode(...new Uint8Array(signatureBuffer))
    );
    return computedSignature === receivedSignature;
  } catch (err) {
    console.error("[cashfree-webhook] Signature verification error:", err);
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const webhookSecret = Deno.env.get("CASHFREE_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!webhookSecret || !supabaseUrl || !supabaseServiceKey) {
    console.error("[cashfree-webhook] Missing required environment variables");
    return new Response(JSON.stringify({ error: "Server configuration error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const rawBody = await req.text();
    const timestamp = req.headers.get("x-webhook-timestamp") || "";
    const receivedSignature = req.headers.get("x-webhook-signature") || "";

    // ── VERIFY SIGNATURE ──────────────────────────────────────
    if (!timestamp || !receivedSignature) {
      console.warn("[cashfree-webhook] Missing signature headers");
      return new Response(JSON.stringify({ error: "Missing signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const isValid = await verifySignature(rawBody, timestamp, receivedSignature, webhookSecret);
    if (!isValid) {
      console.warn("[cashfree-webhook] Invalid signature — possible spoofing attempt");
      return new Response(JSON.stringify({ error: "Invalid signature" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── PARSE PAYLOAD ─────────────────────────────────────────
    const payload = JSON.parse(rawBody);
    const event = payload?.data?.payment || payload?.data;
    const eventType = payload?.type || "";
    const orderId = event?.order?.order_id || payload?.data?.order?.order_id || "";
    const paymentStatus = event?.payment_status || "";
    const customerId = event?.customer_details?.customer_id || "";

    console.log(`[cashfree-webhook] Event: ${eventType} | Order: ${orderId} | Status: ${paymentStatus}`);

    // ── HANDLE PAYMENT SUCCESS ────────────────────────────────
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK" || paymentStatus === "SUCCESS") {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // IDEMPOTENCY CHECK: Has this order already been processed?
      const { data: existingOrder } = await supabase
        .from("payment_events")
        .select("id")
        .eq("order_id", orderId)
        .maybeSingle();

      if (existingOrder) {
        console.log(`[cashfree-webhook] Order ${orderId} already processed — skipping`);
        return new Response(JSON.stringify({ ok: true, duplicate: true }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // RESOLVE USER: Map Cashfree customer_id to Supabase user_id
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, user_id, subscription_status")
        .eq("user_id", customerId)
        .maybeSingle();

      if (profileError || !profile) {
        console.error(`[cashfree-webhook] Could not find profile for customer: ${customerId}`);
        // Log to payment_events anyway for manual review
        await supabase.from("payment_events").insert({
          order_id: orderId,
          customer_id: customerId,
          status: "UNRESOLVED",
          payload: payload,
          created_at: new Date().toISOString(),
        }).catch(() => {});

        return new Response(JSON.stringify({ error: "User not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // ACTIVATE SUBSCRIPTION
      const subscriptionEnd = new Date();
      subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1); // +1 month

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          subscription_status: "active",
          trial_ends_at: null, // clear trial timer
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", customerId);

      if (updateError) {
        console.error(`[cashfree-webhook] Failed to activate subscription:`, updateError);
        return new Response(JSON.stringify({ error: "DB update failed" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // LOG THE EVENT (for auditing / idempotency)
      await supabase.from("payment_events").insert({
        order_id: orderId,
        customer_id: customerId,
        user_id: profile.user_id,
        status: "SUCCESS",
        amount: event?.payment_amount || event?.order?.order_amount || 0,
        currency: "INR",
        payload: payload,
        created_at: new Date().toISOString(),
      }).catch((e: any) => console.warn("[cashfree-webhook] Failed to log payment event:", e));

      console.log(`[cashfree-webhook] ✅ Subscription activated for user ${profile.user_id}`);
      return new Response(JSON.stringify({ ok: true, activated: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── HANDLE PAYMENT FAILURE ────────────────────────────────
    if (eventType === "PAYMENT_FAILED_WEBHOOK" || paymentStatus === "FAILED") {
      console.log(`[cashfree-webhook] Payment failed for order: ${orderId}`);
      // No subscription change needed — just log
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase.from("payment_events").insert({
        order_id: orderId,
        customer_id: customerId,
        status: "FAILED",
        payload: payload,
        created_at: new Date().toISOString(),
      }).catch(() => {});

      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Unknown event type — acknowledge receipt
    console.log(`[cashfree-webhook] Unhandled event type: ${eventType}`);
    return new Response(JSON.stringify({ ok: true, event: "unhandled" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[cashfree-webhook] Unhandled error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
