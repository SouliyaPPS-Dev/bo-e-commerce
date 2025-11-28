# Quick Start: GitHub Pages Deployment

Get your private project deployed in 5 minutes!

## Prerequisites

✓ Private GitHub repository (or create one)
✓ This code pushed to your repository
✓ Admin access to the repository

## Step 1: Configure GitHub Pages (2 minutes)

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Build and deployment":
   - Select **Source**: "GitHub Actions"
4. Click **Save**

That's it! The workflow will automatically deploy to GitHub Pages.

## Step 2: Push to Main (30 seconds)

Make sure your code is on the `main` branch:

```bash
git push origin main
```

## Step 3: Watch the Deployment (2-3 minutes)

1. Go to the **Actions** tab on GitHub
2. You'll see a workflow run called "Build and Deploy"
3. Watch it complete:
   - **Build** job runs first (installs deps, builds project)
   - **Deploy** job runs second (deploys to GitHub Pages)

Both should show ✅ when complete.

## Step 4: Visit Your Deployed App (30 seconds)

Your app is now live! Find the URL:

1. Go to **Settings** → **Pages**
2. Look for the message: "Your site is live at https://..."
3. Click the link to view your deployed app

**Note:** For private repos, only collaborators with read access can view the deployed site.

---

## That's It! 🎉

Your private project is now automatically deployed to GitHub Pages!

### What Happens Next:

- **Every push to `main`** automatically triggers a new build and deployment
- Changes are live within **1-2 minutes** of pushing
- All builds are logged in the **Actions** tab

### Useful Commands:

```bash
# Start development server
bun run dev

# Build for production
bun run build

# Preview the production build
bun run preview
```

## Troubleshooting

**Pages URL shows 404?**
- Make sure Pages is configured to use "GitHub Actions" as the source
- Wait 1-2 minutes for the first deployment to complete

**Build fails?**
- Check the **Actions** tab for error messages
- Try running `bun run build` locally to debug

**Need more help?**
- Read `GITHUB_DEPLOYMENT.md` for detailed information
- Use `GITHUB_SETUP_CHECKLIST.md` to verify everything is set up correctly

---

**Enjoy your deployed application!** 🚀
