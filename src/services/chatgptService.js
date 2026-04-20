const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const callChatGPT = async (messages, options = {}) => {
  const apiKey = import.meta.env?.VITE_OPENAI_API_KEY || process.env?.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not found (VITE_OPENAI_API_KEY)');

  const defaults = { model: 'gpt-3.5-turbo', temperature: 0.5, max_tokens: 600 };
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({ ...defaults, ...options, messages })
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: ${response.status}`);
  }
  const data = await response.json();
  return data.choices[0].message.content;
};

export const analyzeGlucosePatterns = async (glucoseReadings, context = {}) => {
  const readingsSummary = glucoseReadings.map(r => `Time: ${r.timestamp}, Value: ${r.value} mg/dL`).join('\n');
  const mealsSummary = Array.isArray(context.recentMeals) && context.recentMeals.length
    ? context.recentMeals.map(m => `- ${m.time || 'time?'}: ${m.name || 'meal'}${m.carbs != null ? ` (~${m.carbs}g carbs)` : ''}`).join('\n')
    : 'None provided';
  const a = context.activity || {};
  const activitySummary = (a.minutes || a.type || a.intensity)
    ? `${a.time || 'time?'}: ${a.type || 'activity'} for ${a.minutes || '?'} min${a.intensity ? `, intensity: ${a.intensity}` : ''}`
    : 'None provided';

  const messages = [
    { role: 'system', content: 'You are a medical AI assistant specialized in diabetes monitoring. Provide evidence-based insights. Add a disclaimer that this is not medical advice.' },
    { role: 'user', content:
`Analyze these glucose readings and provide:
1. Pattern identification (trends, spikes, dips)
2. Prediction for next 2-4 hours based on historical data
3. Brief actionable recommendations
4. Note how recent meals and activity may have influenced readings and adjust recommendations accordingly

Glucose readings:
${readingsSummary}

Recent meals:
${mealsSummary}

Recent physical activity:
${activitySummary}

Respond concisely for a health app.` }
  ];
  return callChatGPT(messages, { model: 'gpt-3.5-turbo', temperature: 0.5, max_tokens: 700 });
};

export default { analyzeGlucosePatterns };

