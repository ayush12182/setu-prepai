/**
 * ChatGPT API Service for Glucose Health Tracking Platform
 * 
 * This service integrates OpenAI's ChatGPT API for:
 * - Glucose pattern analysis and predictions
 * - Personalized meal recommendations
 * - Medical report analysis (OCR text processing)
 * - Health insights and lifestyle suggestions
 * 
 * Setup:
 * 1. Get your API key from https://platform.openai.com/api-keys
 * 2. Add to .env file: VITE_OPENAI_API_KEY=your-api-key-here
 * 3. For production, use environment variables on your server
 */

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Make a request to ChatGPT API
 * @param {Array} messages - Array of message objects with role and content
 * @param {Object} options - Additional options (model, temperature, max_tokens)
 * @returns {Promise<Object>} - API response with AI-generated content
 */
const callChatGPT = async (messages, options = {}) => {
  const apiKey = import.meta.env?.VITE_OPENAI_API_KEY || process.env?.VITE_OPENAI_API_KEY || process.env?.REACT_APP_OPENAI_API_KEY;
  
  if (!apiKey) {
    const errorMsg = 'OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file. Get your key at https://platform.openai.com/api-keys';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  const defaultOptions = {
    model: options.model || 'gpt-3.5-turbo', // Default to 3.5-turbo for faster/cheaper responses
    temperature: options.temperature || 0.7,
    max_tokens: options.max_tokens || 500,
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        ...defaultOptions,
        ...options,
        messages: messages,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('ChatGPT API Error:', error);
    throw error;
  }
};

/**
 * Analyze glucose patterns and predict future trends
 * @param {Array} glucoseReadings - Array of {timestamp, value} objects
 * @param {Object} context - Optional context like meals and activity
 * @param {Array} context.recentMeals - Array of { time, name, carbs } objects
 * @param {Object} context.activity - { minutes, intensity, type, time }
 * @returns {Promise<string>} - AI-generated prediction and insights
 */
export const analyzeGlucosePatterns = async (glucoseReadings, context = {}) => {
  const readingsSummary = glucoseReadings
    .map(r => `Time: ${r.timestamp}, Value: ${r.value} mg/dL`)
    .join('\n');

  const mealsSummary = Array.isArray(context.recentMeals) && context.recentMeals.length > 0
    ? context.recentMeals.map(m => `- ${m.time || 'unknown time'}: ${m.name || 'meal'}${m.carbs != null ? ` (~${m.carbs}g carbs)` : ''}`).join('\n')
    : 'None provided';

  const activity = context.activity || {};
  const activitySummary = (activity && (activity.minutes || activity.type || activity.intensity))
    ? `${activity.time || 'unknown time'}: ${activity.type || 'activity'} for ${activity.minutes || '?'} min${activity.intensity ? `, intensity: ${activity.intensity}` : ''}`
    : 'None provided';

  const messages = [
    {
      role: 'system',
      content: 'You are a medical AI assistant specialized in diabetes and glucose monitoring. Provide clear, evidence-based insights about glucose patterns. Always include disclaimers that this is not medical advice and users should consult healthcare professionals.'
    },
    {
      role: 'user',
      content: `Analyze these glucose readings and provide:
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

Respond in a clear, concise format suitable for a health tracking app.`
    }
  ];

  return await callChatGPT(messages, {
    model: 'gpt-3.5-turbo', // Use 3.5-turbo for faster responses, change to 'gpt-4' for higher quality
    temperature: 0.5, // Lower temperature for more consistent medical insights
    max_tokens: 600,
  });
};

/**
 * Generate personalized meal recommendations based on glucose levels
 * @param {number} currentGlucose - Current glucose reading
 * @param {Array} recentReadings - Recent glucose readings for context
 * @param {Object} userPreferences - Dietary preferences, restrictions, etc.
 * @returns {Promise<string>} - AI-generated meal recommendations
 */
export const getMealRecommendations = async (currentGlucose, recentReadings = [], userPreferences = {}) => {
  const avgGlucose = recentReadings.length > 0
    ? recentReadings.reduce((sum, r) => sum + r.value, 0) / recentReadings.length
    : currentGlucose;

  const messages = [
    {
      role: 'system',
      content: 'You are a nutrition AI assistant specialized in diabetes meal planning. Provide practical, healthy meal suggestions that help maintain stable glucose levels. Always emphasize consulting with a registered dietitian for personalized meal plans.'
    },
    {
      role: 'user',
      content: `Provide 3 meal recommendations based on:
- Current glucose: ${currentGlucose} mg/dL
- Average recent glucose: ${avgGlucose.toFixed(1)} mg/dL
${userPreferences.dietaryRestrictions ? `- Dietary restrictions: ${userPreferences.dietaryRestrictions}` : ''}
${userPreferences.preferences ? `- Preferences: ${userPreferences.preferences}` : ''}

Format: Brief meal name, approximate carb content, and why it's suitable. Keep each recommendation to 2-3 sentences.`
    }
  ];

  return await callChatGPT(messages, {
    model: 'gpt-3.5-turbo', // Use 3.5-turbo for faster responses, change to 'gpt-4' for higher quality
    temperature: 0.7,
    max_tokens: 500,
  });
};

/**
 * Analyze medical report text extracted from OCR
 * @param {string} reportText - Text extracted from uploaded medical report
 * @returns {Promise<Object>} - Structured analysis with extracted data and insights
 */
export const analyzeMedicalReport = async (reportText) => {
  const messages = [
    {
      role: 'system',
      content: 'You are a medical AI assistant that extracts and analyzes glucose-related data from medical reports. Extract glucose values, dates, and any relevant patterns. Format your response as JSON with: glucoseValues (array), dates (array), insights (string), and recommendations (string).'
    },
    {
      role: 'user',
      content: `Extract and analyze glucose data from this medical report:

${reportText}

Return a JSON object with:
- glucoseValues: array of numeric glucose values found
- dates: array of corresponding dates/timestamps (if available)
- insights: brief analysis of the data
- recommendations: suggested actions based on the readings

If no glucose data is found, return null values with an explanation in insights.`
    }
  ];

  const response = await callChatGPT(messages, {
    model: 'gpt-3.5-turbo', // Use 3.5-turbo for faster responses, change to 'gpt-4' for higher quality
    temperature: 0.3, // Lower temperature for accurate data extraction
    max_tokens: 800,
  });

  try {
    // Parse JSON response (ChatGPT may wrap in markdown code blocks)
    const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : response;
    return JSON.parse(jsonString);
  } catch (error) {
    // If JSON parsing fails, return structured object with raw text
    return {
      glucoseValues: null,
      dates: null,
      insights: response,
      recommendations: 'Please review the report manually or consult with a healthcare provider.',
    };
  }
};

/**
 * Get general health insights based on user's glucose history and lifestyle
 * @param {Object} userData - User's glucose history, activity, meals, etc.
 * @returns {Promise<string>} - Personalized health insights
 */
export const getHealthInsights = async (userData) => {
  const { glucoseHistory, activityLevel, meals, sleepPattern } = userData;

  const summary = `
Glucose History: ${glucoseHistory.length} readings, average: ${glucoseHistory.reduce((s, r) => s + r.value, 0) / glucoseHistory.length} mg/dL
Activity Level: ${activityLevel || 'Not specified'}
Recent Meals: ${meals?.slice(0, 5).join(', ') || 'Not tracked'}
Sleep Pattern: ${sleepPattern || 'Not specified'}
`;

  const messages = [
    {
      role: 'system',
      content: 'You are a wellness AI assistant focused on diabetes management. Provide encouraging, actionable insights that help users understand their glucose patterns and make positive lifestyle changes. Always include appropriate medical disclaimers.'
    },
    {
      role: 'user',
      content: `Based on this user data, provide:
1. Key insights about their glucose management
2. Lifestyle factors that may be influencing their levels
3. 2-3 actionable recommendations

${summary}

Keep the response friendly, supportive, and concise (3-4 paragraphs).`
    }
  ];

  return await callChatGPT(messages, {
    model: 'gpt-3.5-turbo', // Use 3.5-turbo for faster responses, change to 'gpt-4' for higher quality
    temperature: 0.7,
    max_tokens: 600,
  });
};

export default {
  analyzeGlucosePatterns,
  getMealRecommendations,
  analyzeMedicalReport,
  getHealthInsights,
};

