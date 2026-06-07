export interface AIAvailabilityResult {
  available: boolean;
  mode: 'ai' | 'offline' | 'recovery';
  reason?: string;
}

export async function checkAIAvailability(): Promise<AIAvailabilityResult> {
  // 1. Check browser network connection
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { available: false, mode: 'offline', reason: 'Browser is offline' };
  }

  // 2. Check API key existence
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    return { available: false, mode: 'offline', reason: 'VITE_GEMINI_API_KEY is not configured' };
  }

  // 3. Ping Gemini API endpoint with a 2-second timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 2000);

  try {
    // Ping models list endpoint as a lightweight connection verify
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        signal: controller.signal,
      }
    );
    clearTimeout(id);

    if (response.ok) {
      return { available: true, mode: 'ai' };
    } else {
      return {
        available: false,
        mode: 'offline',
        reason: `Gemini API check returned status ${response.status}`,
      };
    }
  } catch (error: any) {
    clearTimeout(id);
    const isTimeout = error.name === 'AbortError';
    return {
      available: false,
      mode: 'offline',
      reason: isTimeout ? 'Gemini API ping timed out (2s)' : (error.message || 'Network error pinging Gemini API'),
    };
  }
}
