# ChatGPT API Setup Guide

## Quick Setup Steps

1. **Get Your OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in to your OpenAI account
   - Click "Create new secret key"
   - Copy the key (you won't be able to see it again!)

2. **Add API Key to Your Project**
   
   Create a `.env` file in your project root:
   ```bash
   VITE_OPENAI_API_KEY=sk-your-api-key-here
   ```
   
   **Important:** Never commit your `.env` file to version control!

3. **Install Dependencies** (if needed)
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Start Your Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

## API Key Security

### For Development:
- Store your key in `.env` file
- Add `.env` to `.gitignore`

### For Production:
- Use your hosting platform's environment variables:
  - **Vercel**: Settings → Environment Variables
  - **Netlify**: Site Settings → Environment Variables
  - **Heroku**: Settings → Config Vars
  - **Railway**: Variables tab

## Available Features

The ChatGPT API is now integrated for:

1. **Glucose Pattern Analysis** - `analyzeGlucosePatterns()`
2. **Meal Recommendations** - `getMealRecommendations()`
3. **Medical Report Analysis** - `analyzeMedicalReport()`
4. **Health Insights** - `getHealthInsights()`

## Usage Example

```javascript
import { analyzeGlucosePatterns } from '@/services/chatgptService';

const readings = [
  { timestamp: '2025-01-15 08:00', value: 95 },
  { timestamp: '2025-01-15 12:00', value: 140 },
];

const insights = await analyzeGlucosePatterns(readings);
console.log(insights);
```

## Cost Information

- **GPT-4**: ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
- **GPT-3.5-turbo**: ~$0.0015 per 1K input tokens, ~$0.002 per 1K output tokens

Start with GPT-3.5-turbo for testing, upgrade to GPT-4 for production.

## Troubleshooting

**Error: "API key not configured"**
- Check that your `.env` file exists and contains `VITE_OPENAI_API_KEY`
- Restart your dev server after adding the key
- Verify the key starts with `sk-`

**Error: "Insufficient quota"**
- Check your OpenAI account billing at https://platform.openai.com/account/billing
- Add payment method if needed

**Rate limit errors**
- Implement request throttling
- Consider caching responses for common queries
- Use GPT-3.5-turbo for less critical features

## Need Help?

- OpenAI Docs: https://platform.openai.com/docs
- API Status: https://status.openai.com
- Pricing: https://openai.com/pricing

