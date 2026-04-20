# Quick Deploy to Vercel - 3 Easy Steps

## Method 1: Deploy via Vercel Website (Easiest - No GitHub needed)

### Step 1: Prepare Your Project
1. Make sure you have all files in this folder
2. You're ready! ✅

### Step 2: Go to Vercel
1. Visit [vercel.com](https://vercel.com)
2. Sign up or log in (use GitHub account for easy login)
3. Click **"Add New Project"**

### Step 3: Deploy
**Option A: Drag & Drop (if available)**
- Drag this entire folder to Vercel's upload area
- Wait for upload

**Option B: Connect GitHub (Recommended)**
1. First, push to GitHub (see GITHUB_SETUP.md)
2. In Vercel, click **"Import Git Repository"**
3. Select your repository
4. Vercel will auto-detect Vite settings ✅

### Configure Environment Variables
**IMPORTANT:** Before deploying, add your API key:

1. In Vercel project settings, go to **"Environment Variables"**
2. Add new variable:
   - **Name:** `VITE_OPENAI_API_KEY`
   - **Value:** Your OpenAI API key
   - **Environments:** Select all (Production, Preview, Development)
3. Click **"Save"**

### Deploy!
1. Click **"Deploy"**
2. Wait 1-2 minutes
3. Get your live URL! 🎉

---

## Method 2: Using Vercel CLI

If you have Node.js installed:

```bash
# Install Vercel CLI globally
npm i -g vercel

# Navigate to project
cd "/Users/ayushdixit12/untitled folder"

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? bp-ai-portal
# - Directory? ./
# - Override settings? No

# Add environment variable
vercel env add VITE_OPENAI_API_KEY
# Enter your API key when prompted
# Select all environments (Production, Preview, Development)

# Deploy to production
vercel --prod
```

---

## After Deployment

1. **Get your URL**: Vercel will give you a URL like `your-project.vercel.app`
2. **Test**: Visit the URL and click "Analyze Patterns"
3. **Custom Domain** (optional): Add your own domain in Vercel settings

---

## Troubleshooting

### Build fails?
- Check that `package.json` has all dependencies
- Ensure `vite.config.js` exists
- Check Vercel build logs for errors

### API not working?
- Verify `VITE_OPENAI_API_KEY` is set in Vercel environment variables
- Make sure you selected all environments (Production, Preview, Development)
- Redeploy after adding environment variables

### Need to update?
- Push changes to GitHub (if using Git)
- Vercel auto-deploys on push
- Or redeploy manually in Vercel dashboard

---

## Quick Checklist

Before deploying:
- [ ] All files are in the project folder
- [ ] `package.json` exists
- [ ] `vercel.json` exists
- [ ] `index.html` exists
- [ ] You have an OpenAI API key ready

After deployment:
- [ ] Environment variable `VITE_OPENAI_API_KEY` is set
- [ ] Test the website at your Vercel URL
- [ ] Click "Analyze Patterns" to verify AI works

---

**Need help?** Check Vercel docs: [vercel.com/docs](https://vercel.com/docs)

