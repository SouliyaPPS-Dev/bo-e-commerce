# GitHub Deployment Guide for Private Repository

This document provides detailed instructions for building and deploying your private GitHub project.

## Overview

This project is configured with GitHub Actions to automatically build and deploy to GitHub Pages when you push to the `main` branch. The workflow is optimized for private repositories and uses Bun as the package manager.

## Prerequisites

- Private GitHub repository
- GitHub Actions enabled (enabled by default)
- Node.js 20+ (required by the workflow)
- Bun package manager (installed automatically by the workflow)

## Automatic Deployment

### How It Works

1. **Push to main branch** - When you push commits to the `main` branch, GitHub Actions automatically triggers
2. **Build process** - The workflow installs dependencies and builds the project using Bun
3. **Upload artifacts** - Built files are uploaded as workflow artifacts
4. **Deploy to GitHub Pages** - The artifacts are deployed to GitHub Pages with restricted access

### Workflow File

The deployment is configured in `.github/workflows/deploy.yml`

**Key Features:**
- Splits build and deploy into separate jobs for better reliability
- Uses artifact upload/download for safer deployments
- Caches Bun dependencies to speed up builds
- Uses frozen lockfile for reproducible builds
- Automatically runs on push to `main` branch
- Manual trigger available via `workflow_dispatch`

## Configuration

### GitHub Pages Settings

1. Go to your repository settings: `Settings` → `Pages`
2. Select **Deploy from a branch** (or **GitHub Actions** if available)
3. For branch deployment: Select `gh-pages` branch and `/root` folder
4. Save the settings

The workflow will automatically create and maintain the `gh-pages` branch.

### Environment Variables

#### Development Environment (`.env.development`)
Used locally during development:
```
export REACT_APP_API_BASE_URL=https://api.soysb.com
```

#### Production Build
Set in the workflow with:
```
NODE_ENV: production
```

### Base URL Configuration

The project uses relative paths for the base URL:
- **Package.json**: `"homepage": "./"`
- **Vite Config**: `base: process.env.VITE_BASE || '/'`

This allows the app to work on GitHub Pages at any subdirectory path.

## Running Builds Locally

### Build for Production

```bash
# Using Bun
bun run build

# Output goes to: ./dist
```

### Preview the Build

```bash
# Preview the production build locally
bun run preview
```

### Development Mode

```bash
# Start development server on port 8000
bun run dev
```

## Troubleshooting

### Build Failures

Check the GitHub Actions logs:
1. Go to your repository
2. Click the **Actions** tab
3. Find the failed workflow run
4. Click on the run to see detailed logs

**Common Issues:**

- **Bun installation fails**: Check internet connectivity, Bun may need to download installation files
- **Dependency conflicts**: Try clearing cache: Remove `.bun/install/cache` and run again
- **Build errors**: Check TypeScript errors with `tsc --noEmit`

### Deployment Issues

- **Not appearing on GitHub Pages**: Verify Pages settings point to `gh-pages` branch
- **404 errors on page navigation**: Check that `homepage` in package.json is set to `./`
- **Assets not loading**: Verify `base` URL in vite.config.ts is correct

### Manual Deployment

If automatic deployment fails, you can manually trigger it:

1. Go to **Actions** tab
2. Find **Build and Deploy** workflow
3. Click **Run workflow**
4. Select the `main` branch
5. Click **Run workflow**

## GitHub Pages Access Control

For private repositories:
- GitHub Pages on private repos is **only accessible to collaborators with read access**
- Access is controlled through GitHub's repository access settings
- The deployment URL will be: `https://<username>.github.io/<repo-name>/`

## Permissions Required

The workflow uses these GitHub permissions:
- `contents: read` - Read repository contents
- `pages: write` - Write to GitHub Pages
- `id-token: write` - Create identity tokens for deployments

These are automatically configured in `.github/workflows/deploy.yml`

## Environment Secrets

The workflow uses:
- `secrets.GITHUB_TOKEN` - Automatically provided by GitHub (no setup needed)

No additional secrets need to be configured for basic GitHub Pages deployment.

## Advanced Configuration

### Custom Domain (Optional)

To use a custom domain with GitHub Pages:

1. Go to **Settings** → **Pages**
2. Under "Custom domain", enter your domain
3. Add DNS records to your domain provider pointing to GitHub Pages

### Branch Protection (Recommended)

For production stability:

1. Go to **Settings** → **Branches**
2. Add rule for `main` branch
3. Enable "Require status checks to pass before merging"
4. Select the **Build and Deploy** workflow as required check

## Performance Optimization

### Cache Strategy

The workflow caches:
- Bun dependencies in `~/.bun/install/cache`
- Cache key includes `bun.lockb` hash for automatic invalidation

### Build Optimization

- Uses frozen lockfile for reproducible builds
- Enables source maps for debugging
- Chunk size warning set to 5000KB

## Monitoring Builds

### View Workflow Runs

1. Go to **Actions** tab
2. Click **Build and Deploy** workflow
3. See all previous runs with status and timing

### Notifications

Enable notifications for:
1. Go to **Settings** → **Notifications**
2. Choose when to be notified about Actions

## Cleanup and Maintenance

### Remove Old Deployments

GitHub automatically maintains only the latest deployment on the `gh-pages` branch.

### Update Dependencies

Keep your dependencies up to date:
```bash
# Update to latest compatible versions
bun update

# Update to latest versions (may break compatibility)
bun upgrade
```

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Bun Documentation](https://bun.sh/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Admin Documentation](https://marmelab.com/react-admin/)

## Support

If you encounter issues:

1. Check the [GitHub Actions Logs](#troubleshooting)
2. Review this guide's troubleshooting section
3. Check the project's GitHub Issues
4. Review Vite and Bun documentation

## Quick Reference

| Action | Command |
|--------|---------|
| Development | `bun run dev` |
| Build | `bun run build` |
| Preview | `bun run preview` |
| Type check | `bun run type-check` |
| Install deps | `bun install` |
| Manual deploy | Push to `main` or use Actions tab |
