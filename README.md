# BP AI Portal - Blood Pressure & Glucose Monitoring

A modern web application for monitoring blood pressure and glucose levels with AI-powered analysis. Features meal and activity context integration for personalized health insights.

## Features

- 🔬 **AI-Powered Glucose Analysis** - ChatGPT analyzes glucose patterns with meal and activity context
- 💓 **Blood Pressure Monitoring** - Track BP readings with automatic alerts for abnormal values
- 📊 **Health Insights** - Get personalized recommendations based on your data
- 🍽️ **Meal Tracking Integration** - AI considers recent meals when analyzing glucose patterns
- 🏃 **Activity Context** - Physical activity data included in analysis
- 🎨 **Modern UI** - Clean, responsive design built with React and Tailwind CSS

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS (inline styles for minimal setup)
- **Icons**: Lucide React
- **AI**: OpenAI ChatGPT API (GPT-3.5-turbo)
- **Deployment**: Vercel-ready

## Quick Start

### Prerequisites

- Node.js 18+ installed
- OpenAI API key (get one at [platform.openai.com](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd bp-ai-portal
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   VITE_OPENAI_API_KEY=your-openai-api-key-here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   - Navigate to the URL shown in the terminal (usually `http://localhost:5173`)

## Project Structure

```
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # React entry point
│   └── services/
│       └── chatgptService.js # OpenAI API integration
├── components/
│   ├── BPReminder.jsx       # BP alert component
│   └── PatientPortal.jsx    # Patient dashboard
├── services/
│   ├── bpMonitoringService.js # BP monitoring logic
│   └── chatgptService.js    # AI service (duplicate for compatibility)
├── index.html               # HTML entry point
├── package.json             # Dependencies
├── vite.config.js           # Vite configuration
└── vercel.json              # Vercel deployment config
```

## Deployment to Vercel

See [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md) for detailed deployment instructions.

### Quick Deploy Steps

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variable: `VITE_OPENAI_API_KEY`
4. Deploy!

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_OPENAI_API_KEY` | Your OpenAI API key | Yes |

See [ENV_VARS.txt](./ENV_VARS.txt) for setup instructions.

## Usage

### AI Glucose Analysis

The app includes example glucose readings with meal and activity context. Click "Analyze Patterns" to see AI-powered insights that consider:

- Glucose reading trends
- Recent meals and carbohydrate intake
- Physical activity timing and intensity
- Personalized recommendations

### Blood Pressure Monitoring

The BP monitoring feature includes:

- Automatic status detection (normal, elevated, high, low, critical)
- Immediate alerts for abnormal readings
- Reading history tracking
- Doctor contact integration

## Documentation

- [TECH_STACK.md](./TECH_STACK.md) - Complete technology breakdown
- [BP_MONITORING_README.md](./BP_MONITORING_README.md) - BP feature documentation
- [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - Feature overview
- [CHATGPT_SETUP.md](./CHATGPT_SETUP.md) - ChatGPT API setup guide
- [DEPLOY_TO_VERCEL.md](./DEPLOY_TO_VERCEL.md) - Deployment guide

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Support

For issues or questions:
- Check the documentation files
- Review the troubleshooting section in DEPLOY_TO_VERCEL.md
- Ensure your OpenAI API key is correctly configured

## Disclaimer

This application is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.

