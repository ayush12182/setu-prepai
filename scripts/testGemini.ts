import { loadEnv } from 'vite';

const env = loadEnv('development', process.cwd(), '');
const GEMINI_API_KEY = env.VITE_GEMINI_API_KEY || "AQ.Ab8RN6KxQiPWUYrteYzPYrmItnhEaUteH45YOyIy9lgjREV6-g";

async function main() {
  console.log("Testing Gemini API Key...");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
  
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Respond with 'Hello World'" }] }]
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log("Success! Gemini response:", data.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
    } else {
      console.error("Failed:", res.status, await res.text());
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

main();
