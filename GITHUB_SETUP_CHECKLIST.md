# GitHub Private Repo Deployment - Setup Checklist

Complete this checklist to ensure your private repository is properly configured for automated deployment.

## Step 1: Repository Settings

- [ ] Repository is set to **Private** (if it's not already)
  - Go to **Settings** → **General** → **Visibility**
  - Select **Private**
  - Click **Change visibility**

- [ ] GitHub Actions is **enabled**
  - Go to **Settings** → **Actions** → **General**
  - Ensure "All actions and reusable workflows" is selected
  - Under "Fork pull request workflows from outside collaborators", select preferred setting

## Step 2: GitHub Pages Configuration

- [ ] Go to **Settings** → **Pages**

- [ ] Under "Build and deployment":
  - [ ] Select **Source**: "GitHub Actions" (recommended) OR "Deploy from a branch"
  - [ ] If using "Deploy from a branch": Select `gh-pages` branch
  - [ ] Click **Save**

- [ ] Note your GitHub Pages URL (usually shows under the Pages settings)
  - Format: `https://<username>.github.io/<repo-name>/`

## Step 3: Workflow Configuration

- [ ] Verify `.github/workflows/deploy.yml` exists and contains the updated workflow
  - [ ] Check that it uses the `actions/upload-pages-artifact@v3` action
  - [ ] Check that it uses the `actions/deploy-pages@v4` action
  - [ ] Verify the `concurrency` group is set to "pages"

- [ ] Permissions in the workflow should include:
  ```yaml
  permissions:
    contents: read
    pages: write
    id-token: write
  ```

## Step 4: Project Configuration

- [ ] `package.json` has correct homepage:
  ```json
  "homepage": "./"
  ```

- [ ] `vite.config.ts` uses relative base URL:
  ```typescript
  const base = process.env.VITE_BASE || '/';
  ```

- [ ] Environment variables are set up (optional):
  - [ ] `.env` exists with production settings
  - [ ] `.env.development` exists with development settings
  - [ ] Sensitive secrets are NOT committed to git

## Step 5: Build Verification

- [ ] Run local build and verify it succeeds:
  ```bash
  bun run build
  ```
  ✓ Build completes without errors
  ✓ No warnings about missing files
  ✓ `dist/` folder is created with content

- [ ] Preview the build locally:
  ```bash
  bun run preview
  ```
  ✓ App is accessible at http://localhost:4173
  ✓ All pages load correctly
  ✓ Assets and images load without errors

## Step 6: First Deployment

- [ ] Make sure all changes are committed:
  ```bash
  git status  # Verify clean working directory
  ```

- [ ] Push to main branch:
  ```bash
  git push origin main
  ```

- [ ] Go to **Actions** tab and monitor the build:
  - [ ] **Build** job should start and complete
  - [ ] **Deploy** job should start and complete
  - [ ] No errors in the logs

- [ ] Once complete, visit your GitHub Pages URL:
  - [ ] App loads successfully
  - [ ] All assets load (images, CSS, JavaScript)
  - [ ] Navigation works correctly
  - [ ] API calls work (if applicable)

## Step 7: Access Control (Private Repos)

- [ ] Verify GitHub Pages is only accessible to collaborators:
  - [ ] Go to **Settings** → **Collaborators**
  - [ ] Only intended users have access to the repository
  - [ ] The GitHub Pages site reflects the same access control

- [ ] Test access with a collaborator account:
  - [ ] Ask someone with repository access to visit your GitHub Pages URL
  - [ ] They should be able to access it
  - [ ] Try accessing with an account without repository access
  - [ ] They should get a 404 or be prompted to sign in

## Step 8: Continuous Deployment

- [ ] Push a test commit to verify automatic deployment:
  ```bash
  # Make a small change
  echo "# Updated" >> README.md
  git add README.md
  git commit -m "test: verify deployment automation"
  git push origin main
  ```

- [ ] Monitor the Actions tab:
  - [ ] New workflow run starts automatically
  - [ ] Build completes successfully
  - [ ] Pages deployment completes
  - [ ] Changes are live on your GitHub Pages URL within 1-2 minutes

## Step 9: Monitoring & Maintenance

- [ ] Set up GitHub Actions notifications:
  - [ ] Go to **Settings** → **Notifications**
  - [ ] Configure alerts for workflow failures

- [ ] Review workflow runs occasionally:
  - [ ] Go to **Actions** tab
  - [ ] Check for any failed runs
  - [ ] Investigate and fix any failures

- [ ] Keep dependencies updated:
  - [ ] Periodically run `bun update`
  - [ ] Review and test updates
  - [ ] Commit lock file updates

## Step 10: Documentation

- [ ] Share deployment guide with team members:
  - [ ] Point them to `GITHUB_DEPLOYMENT.md`
  - [ ] Explain how to work with the repository
  - [ ] Share GitHub Pages URL (only accessible to collaborators)

- [ ] Document any environment-specific setup:
  - [ ] Create `.env.local` for local development (don't commit)
  - [ ] Document required environment variables in a template file
  - [ ] Example: `.env.example` with placeholder values

## Troubleshooting

### Build Failed
- [ ] Check Actions tab for error messages
- [ ] Verify all dependencies are installed: `bun install`
- [ ] Run build locally: `bun run build`
- [ ] Check for TypeScript errors: `tsc --noEmit`

### Pages Not Deploying
- [ ] Verify Pages settings are configured correctly
- [ ] Check `gh-pages` branch exists in repository
- [ ] Verify workflow permissions include `pages: write`
- [ ] Check workflow artifact upload/download steps

### Assets Not Loading
- [ ] Verify `homepage` in package.json is `./`
- [ ] Check `base` URL in vite.config.ts
- [ ] Verify dist folder contains assets
- [ ] Check browser console for 404 errors

### Access Denied
- [ ] Verify user has access to the repository
- [ ] Confirm GitHub Pages settings are correct
- [ ] Try accessing in an incognito/private browser window
- [ ] Verify GitHub authentication is working

## Quick Commands Reference

```bash
# Development
bun run dev              # Start dev server

# Build & Preview
bun run build            # Build for production
bun run preview          # Preview production build locally

# Type Checking
bun run type-check       # Check TypeScript errors only

# Dependencies
bun install              # Install dependencies
bun update               # Update dependencies
bun upgrade              # Upgrade Bun itself

# Git
git status               # Check changes
git add .                # Stage all changes
git commit -m "msg"      # Commit changes
git push origin main     # Push to GitHub
```

## Success Indicators

You'll know everything is set up correctly when:

✅ Pushing to `main` automatically triggers the Build and Deploy workflow
✅ The workflow completes without errors
✅ Your app is live on GitHub Pages within 1-2 minutes of pushing
✅ All team members can access the deployed app (and only authorized users)
✅ Breaking changes are caught before deployment (if using branch protection)

---

**Next Steps:** Review the `GITHUB_DEPLOYMENT.md` file for detailed information about the deployment process and troubleshooting.
