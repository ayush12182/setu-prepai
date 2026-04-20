import React, { useState } from 'react';
import { analyzeGlucosePatterns } from './services/chatgptService.js';
import { Activity, Brain, ChartBar, Zap } from 'lucide-react';

export default function App() {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');

  const handleAnalyzeGlucose = async () => {
    const sampleReadings = [
      { timestamp: '2025-01-15 08:00', value: 95 },
      { timestamp: '2025-01-15 12:00', value: 140 },
      { timestamp: '2025-01-15 18:00', value: 120 },
    ];
    const context = {
      recentMeals: [
        { time: '2025-01-15 07:30', name: 'Breakfast: Oatmeal with banana', carbs: 45 },
        { time: '2025-01-15 12:15', name: 'Lunch: Grilled chicken with brown rice', carbs: 55 },
        { time: '2025-01-15 17:30', name: 'Snack: Apple', carbs: 25 },
      ],
      activity: { time: '2025-01-15 18:30', type: 'Walking', minutes: 30, intensity: 'moderate' }
    };
    setAiLoading(true);
    setAiResponse('');
    try {
      const insights = await analyzeGlucosePatterns(sampleReadings, context);
      setAiResponse(insights);
    } catch (error) {
      const message = error?.message || 'Unknown error';
      setAiResponse(
        `Unable to analyze patterns: ${message}\n\n` +
        `Please set your OpenAI API key as VITE_OPENAI_API_KEY in Vercel Project Settings > Environment Variables.`
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="container">
      <header className="row" style={{ justifyContent: 'space-between', marginBottom: 16 }}>
        <h1>BP AI Portal</h1>
      </header>

      <section className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h2 className="row"><Brain size={18} /> Try AI Glucose Analysis</h2>
          <p className="muted">Includes meal and activity context</p>
          <div className="row" style={{ marginTop: 12 }}>
            <button className="btn" onClick={handleAnalyzeGlucose} disabled={aiLoading} aria-label="Analyze glucose patterns with AI">
              {aiLoading ? 'Analyzing...' : 'Analyze Patterns'}
            </button>
            <button className="btn btn-outline" onClick={() => setAiResponse('')}>Clear</button>
          </div>
        </div>

        <div className="card">
          <h2 className="row"><ChartBar size={18} /> What it does</h2>
          <ul>
            <li>Analyzes glucose trends and predicts next 2–4 hours</li>
            <li>Factors in recent meals and physical activity</li>
            <li>Provides concise, actionable recommendations</li>
          </ul>
        </div>
      </section>

      {aiResponse && (
        <section className="card">
          <h3 className="row"><Zap size={16} /> AI Analysis Result</h3>
          <pre>{aiResponse}</pre>
        </section>
      )}

      <footer style={{ marginTop: 24 }}>
        <p className="muted">Set VITE_OPENAI_API_KEY in your Vercel project to enable AI.</p>
      </footer>
    </div>
  );
}

