# How to Push This Project to GitHub

Follow these steps to upload your code to GitHub:

## Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `bp-ai-portal` (or your preferred name)
   - **Description**: "Blood Pressure & Glucose Monitoring with AI Analysis"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have one)
4. Click **"Create repository"**

## Step 2: Initialize Git in Your Project

Open your terminal in the project folder and run:

```bash
# Navigate to your project folder
cd "/Users/ayushdixit12/untitled folder"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: BP AI Portal with meal/activity context"
```

## Step 3: Connect to GitHub and Push

After creating the repository on GitHub, you'll see a page with instructions. Copy the repository URL (it looks like `https://github.com/yourusername/bp-ai-portal.git`).

Then run these commands:

```bash
# Add GitHub as remote (replace with your actual URL)
git remote add origin https://github.com/yourusername/bp-ai-portal.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

If prompted, enter your GitHub username and password (or use a Personal Access Token).

## Step 4: Verify

1. Go to your GitHub repository page
2. Refresh the page
3. You should see all your files!

## Alternative: Using GitHub Desktop (Easier)

If you prefer a GUI:

1. **Download GitHub Desktop**: [desktop.github.com](https://desktop.github.com)
2. **Install and sign in** with your GitHub account
3. **File → Add Local Repository**
4. **Browse** to your project folder: `/Users/ayushdixit12/untitled folder`
5. **Click "Publish repository"** in GitHub Desktop
6. **Choose visibility** and click **"Publish"**

## Important Notes

### Before Pushing:

✅ **DO commit**:
- All source code files
- `package.json`, `vite.config.js`, `vercel.json`
- Documentation files (`.md`)
- `index.html`

❌ **DO NOT commit** (already in `.gitignore`):
- `node_modules/` folder
- `.env` or `.env.local` files (contains your API key!)
- `dist/` build folder
- `.DS_Store` and other system files

### Security Reminder

**NEVER commit your `.env` or `.env.local` file to GitHub!** It contains your OpenAI API key.

The `.gitignore` file is already set up to exclude these files automatically.

## Updating Your Repository

After making changes, update GitHub:

```bash
# Add changed files
git add .

# Commit changes
git commit -m "Description of your changes"

# Push to GitHub
git push
```

## Troubleshooting

### "Repository not found"
- Check that you copied the correct repository URL
- Verify you have access to the repository

### "Permission denied"
- Make sure you're authenticated (use Personal Access Token instead of password)
- Check GitHub Settings → Developer settings → Personal access tokens

### "Large files" error
- Make sure `node_modules` is in `.gitignore` (it already is)
- If you accidentally committed `node_modules`, remove it:
  ```bash
  git rm -r --cached node_modules
  git commit -m "Remove node_modules"
  git push
  ```

### "Nothing to commit"
- Make sure you're in the correct directory
- Check if files are already committed: `git status`

## Next Steps After Pushing

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add `VITE_OPENAI_API_KEY` in environment variables
   - Deploy!

2. **Share your repository**:
   - Share the GitHub URL with collaborators
   - Add collaborators in repository settings

3. **Set up GitHub Actions** (optional):
   - For automated testing and deployment
   - See Vercel documentation for CI/CD setup

## Need Help?

- GitHub Docs: [docs.github.com](https://docs.github.com)
- Git Basics: [git-scm.com/doc](https://git-scm.com/doc)
- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)

