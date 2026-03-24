import { load } from '@cashfreepayments/cashfree-js';
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cashfreeInstance: any = null;

export const getCashfree = async () => {
  if (cashfreeInstance) return cashfreeInstance;

  // Since the user provided a 'cfsk_ma_prod_...' key, we must use production mode
  cashfreeInstance = await load({
    mode: "production" 
  });
  
  return cashfreeInstance;
};

/**
 * Creates an order via the securely proxied backend (or Supabase Edge Function in real deployment)
 * and returns the Cashfree Payment Session ID
 */
export const createPaymentSession = async (
  amount: number, 
  customerId: string, 
  customerPhone: string, 
  customerEmail: string, 
  customerName: string
): Promise<string> => {
  
  const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const orderPayload = {
    order_id: orderId,
    order_amount: amount,
    order_currency: "INR",
    customer_details: {
      customer_id: customerId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
    }
  };

  try {
    const { data, error } = await supabase.functions.invoke('create-cashfree-order', {
      body: orderPayload
    });

    if (error) {
      console.error("Supabase Function Error:", error);
      throw new Error(`Failed to create order: ${error.message}`);
    }

    if (!data?.payment_session_id) {
       console.error("Malformed response from function:", data);
       throw new Error("No payment session ID returned from server");
    }

    return data.payment_session_id;

  } catch (err) {
    console.error("Payment Order Creation failed:", err);
    throw err;
  }
};

/**
 * Top-level function to handle the entire payment flow (create order -> trigger UI popup)
 */
export const startSubscriptionCheckout = async (
  amount: number,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any // from useAuth()
) => {
  try {
    const cashfree = await getCashfree();
    
    // Fallbacks if user details are missing
    const phone = user?.phone || "9999999999";
    const email = user?.email || "student@setulearning.in";
    const name = user?.user_metadata?.name || "Student";
    const customerId = user?.id || `cust_${Date.now()}`;

    // 1. Create order on securely proxied backend
    const sessionId = await createPaymentSession(amount, customerId, phone, email, name);

    if (!sessionId) {
      throw new Error("No payment session ID returned from server");
    }

    // 2. Launch Cashfree Drop-in Checkout
    const checkoutOptions = {
        paymentSessionId: sessionId,
        redirectTarget: "_self", // FIXED: use '_self' for full-page redirect as requested
    };
    
    cashfree.checkout(checkoutOptions);

  } catch (error) {
    console.error("Checkout initiation error:", error);
    throw error;
  }
};
