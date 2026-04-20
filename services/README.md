# ChatGPT API Integration for Glucose Tracking Platform

This service integrates OpenAI's ChatGPT API to provide AI-powered features for the glucose health tracking app.

## Features

- **Glucose Pattern Analysis**: Analyzes historical readings and predicts future trends
- **Meal Recommendations**: Provides personalized meal suggestions based on current glucose levels
- **Medical Report Analysis**: Extracts and analyzes glucose data from OCR-processed medical reports
- **Health Insights**: Generates personalized wellness recommendations

## Setup

1. **Get an OpenAI API Key**
   - Visit https://platform.openai.com/api-keys
   - Sign up or log in
   - Create a new API key

2. **Configure Environment Variables**
   - Copy `.env.example` to `.env`
   - Add your API key: `VITE_OPENAI_API_KEY=your-key-here`

3. **For Production**
   - Store API keys in your hosting platform's environment variables
   - Never commit `.env` files with real keys to version control

## Usage Examples

### Analyze Glucose Patterns
```javascript
import { analyzeGlucosePatterns } from '@/services/chatgptService';

const readings = [
  { timestamp: '2025-01-15 08:00', value: 95 },
  { timestamp: '2025-01-15 12:00', value: 140 },
  { timestamp: '2025-01-15 18:00', value: 120 },
];

const insights = await analyzeGlucosePatterns(readings);
console.log(insights):

```

### Get Meal Recommendations
```javascript
import { getMealRecommendations } from '@/services/chatgptService';

const recommendations = await getMealRecommendations(
  110, // current glucose
  [{ value: 100 }, { value: 115 }], // recent readings
  { dietaryRestrictions: 'vegetarian' }
);
```

### Analyze Medical Report
```javascript
import { analyzeMedicalReport } from '@/services/chatgptService';

const reportText = "Patient glucose readings: 95 mg/dL (fasting), 140 mg/dL (post-prandial)...";
const analysis = await analyzeMedicalReport(reportText);
// Returns: { glucoseValues: [95, 140], dates: [...], insights: "...", recommendations: "..." }
```

## Models

- **gpt-4**: Best accuracy, recommended for medical insights (default)
- **gpt-3.5-turbo**: Faster and cheaper, good for general recommendations
- **gpt-4-turbo**: Balanced performance and cost

## Cost Considerations

- GPT-4 is more expensive but provides higher quality medical insights
- GPT-3.5-turbo is more cost-effective for general use cases
- Monitor your API usage at https://platform.openai.com/usage

## Security Notes

- Always use environment variables for API keys
- Implement rate limiting on your backend for production
- Consider adding user authentication and usage quotas
- For production, proxy API calls through your backend server to keep keys secure



