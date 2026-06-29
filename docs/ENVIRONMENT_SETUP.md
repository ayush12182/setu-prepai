# Local Environment Setup

Welcome to PrepEntrance! Follow these steps to get the project running locally on your machine.

## Prerequisites
- Node.js (v20+ recommended)
- npm (v10+ recommended)
- Git

## Step 1: Clone the Repository
```bash
git clone https://github.com/ayush12182/setu-prepai.git
cd setu-prepai
```

## Step 2: Install Dependencies
```bash
npm install
```

## Step 3: Environment Setup
1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
2. Request the development API keys from the lead engineer.
3. Populate `.env.local` with your `VITE_SUPABASE_URL`, `VITE_OPENAI_API_KEY`, etc.

## Step 4: Supabase
The app relies on Supabase for auth and database.
If you are running a local Supabase instance using Docker:
```bash
npx supabase start
npx supabase db reset
```
*(Alternatively, just use the cloud development database credentials provided in `.env.local`)*

## Step 5: Running Locally
Start the Vite development server:
```bash
npm run dev
```
Navigate to `http://localhost:8081` (or whichever port Vite provides) in your browser.

## Troubleshooting
- **Missing API Keys**: The app will fail to load certain data if Supabase keys are missing. Verify `.env.local`.
- **Port Conflicts**: If port 8081 is taken, Vite will assign a new one. Check your terminal output.
- **Dependency Issues**: Try running `rm -rf node_modules package-lock.json && npm install` if you experience weird package errors.
