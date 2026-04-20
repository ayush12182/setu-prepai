Deploy to Vercel (BP AI Portal)

1) Configure Environment Variable (Vercel)
- Project Settings → Environment Variables
- Name: VITE_OPENAI_API_KEY
- Value: your OpenAI API key
- Environments: Production, Preview, Development

Optional local dev: create .env.local with:
VITE_OPENAI_API_KEY=your-openai-api-key

2) Deploy Steps
- Push this folder to GitHub/GitLab/Bitbucket
- In Vercel, import the project
- Framework: Vite (auto-detected)
- Build Command: npm run build
- Output Directory: dist
- Deploy

3) Local Development
npm install
npm run dev

4) What’s Included
- Vite React app with a simple UI
- src/services/chatgptService.js (OpenAI Completions)
- analyzeGlucosePatterns supports meals/activity context
- Minimal CSS in index.html
- vercel.json for build config

5) Testing
- Click "Analyze Patterns"
- If key is set, you’ll see AI insights
- If not, UI will prompt to add the key

6) Troubleshooting
- 401/403: Check VITE_OPENAI_API_KEY
- 429: Rate limited; retry later
- Ensure API URL is https://api.openai.com

7) Notes
- To use Gemini instead, add @google/generative-ai and create a geminiService.js with the same interface as chatgptService.

