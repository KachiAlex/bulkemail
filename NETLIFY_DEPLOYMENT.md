# Netlify Deployment Guide

This repository contains both the frontend (React + Vite) and backend (NestJS) projects. Netlify can only host the static frontend bundle, so you must deploy the backend separately (e.g., Render, Railway, Fly.io, AWS, etc.) and expose its base URL through the frontend environment variable `VITE_API_URL`.

## Prerequisites
1. Netlify account and CLI (optional but recommended).
2. Backend deployed and reachable over HTTPS.
3. `VITE_API_URL` set to the backend's public URL.
4. Access to repository on Git provider for continuous deployment.

## Netlify Build Settings
- **Base directory:** `frontend`
- **Build command:** `npm install && npm run build`
- **Publish directory:** `frontend/dist`
- **Node version:** `18` (enforced via `netlify.toml`)
- **Environment variables:**
  - `VITE_API_URL=https://your-backend.example.com`
  - Any additional frontend-only envs (feature flags, analytics keys, etc.)

These values are codified in `netlify.toml`, so Netlify will automatically detect them when you connect the repo.

## Deployment Options
### 1. Netlify UI (recommended)
1. Create a new Netlify site from Git.
2. Select this repository and default branch.
3. Netlify will auto-detect settings from `netlify.toml`.
4. Add required environment variables under *Site Settings → Build & Deploy → Environment*.
5. Click **Deploy**.

### 2. Netlify CLI (manual deploy)
```bash
# Install and authenticate
npm install -g netlify-cli
netlify login

# From repo root
tl init           # or `ntl link` if site already exists
tl deploy --build # preview deploy
tl deploy --prod  # production deploy
```

## Backend Coordination
- Ensure CORS on the backend allows requests from your Netlify domain.
- Update any webhook URLs (Twilio, SendGrid) if they reference frontend URLs.
- If you use Firebase functions for LinkedIn lead extraction, keep those deployments separate; Netlify hosts only the UI.

## Post-Deployment Checks
1. Dashboard loads and calls backend successfully (network tab should point to `VITE_API_URL`).
2. Authentication redirects work with Netlify’s SPA redirect (configured via `_redirects` rule in `netlify.toml`).
3. Environment variables injected at build time show correct backend endpoints.
4. Any third-party scripts (analytics, chat widgets) use production keys.

## Next Enhancements
- Add Netlify deploy badge/status to `README.md`.
- Automate backend deployment (GitHub Actions) to keep UI/API versions in sync.
- Consider Netlify Functions only for lightweight proxying; main API should stay on dedicated infrastructure.
