# Render Deployment Guide (Backend)

This document describes how to deploy the NestJS backend to Render while keeping the React frontend on Netlify/Vercel.

## 1. Prerequisites
- Render account with billing enabled (to use PostgreSQL + Redis if needed).
- GitHub repository access (Render deploys directly from Git).
- PostgreSQL database (Render Managed PostgreSQL or external DB).
- Redis instance (Render Managed Redis or external) if Bull queues are required.
- Environment variable values (see section 3).

## 2. Render Service Setup
1. **Create Web Service**
   - Dashboard → New → Web Service.
   - Connect repository and pick branch.
   - Root directory: `backend`.
   - Environment: `Node`.
   - Build Command: `npm install && npm run build`.
   - Start Command: `npm run start:prod`.
   - Node version: `18` (Render automatically detects, override in Settings if needed).
   - Instance type: at least `Starter` for CPU/RAM (queues + file uploads benefit from more than free tier).

2. **Add PostgreSQL** (optional but recommended)
   - Dashboard → New → PostgreSQL.
   - Note the connection string; set it as `DATABASE_URL` (Render’s connection string already includes username/password/host/port/database).
   - For TypeORM, either parse the URL or set individual variables (host, port, etc.).

3. **Add Redis**
   - Dashboard → New → Redis.
   - Copy the Redis URL (e.g., `rediss://:`). Put it into `REDIS_URL`.

4. **Persistent Storage**
   - If storing call recordings or exports, use S3 or equivalent. Configure relevant env variables (bucket, keys).

## 3. Environment Variables
Create the following environment variables under the Web Service → Settings → Environment.
```
NODE_ENV=production
PORT=10000                      # Render assigns $PORT at runtime; leave this or ${PORT}
API_PREFIX=/api

# Database (choose one style)
DATABASE_URL=postgres://user:pass@host:5432/aicrm
# or
DATABASE_HOST=...
DATABASE_PORT=...
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
DATABASE_NAME=...

# Redis
REDIS_URL=redis://user:pass@host:6379
REDIS_HOST=...
REDIS_PORT=...

JWT_SECRET=your-production-secret
JWT_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION=30d

TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...

SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=...
SENDGRID_FROM_NAME=...

OPENAI_API_KEY=...
ENCRYPTION_KEY=32-char-secret
CORS_ORIGIN=https://your-frontend.example

ENABLE_AI_FEATURES=true
ENABLE_CALL_RECORDING=true
ENABLE_SMS=true
ENABLE_EMAIL=true
```
Render automatically injects `PORT`. Confirm your NestJS app reads `process.env.PORT` or default to 3000; Nest will bind to Render’s provided port.

## 4. Build & Deploy Pipeline
1. Push code to the main branch.
2. Render automatically runs the build command in `backend` folder.
3. Build artifacts stored in `dist/`.
4. Start command runs `node dist/main` via `npm run start:prod`.
5. Monitor logs under *Events* for migrations or runtime errors.

### Database migrations
Render doesn’t run `npm run migration:run` automatically. Options:
- Manually trigger migrations via Render shell: `npx typeorm-ts-node-commonjs migration:run`.
- Add a deploy hook script or GitHub Action to run migrations post-deploy.

## 5. Networking & CORS
- Allow inbound traffic only through HTTPS (Render handles TLS).
- Update `CORS_ORIGIN` with the frontend domain (Netlify/Vercel). For multiple origins, use a comma-separated list or custom logic.
- Update webhooks (Twilio, SendGrid) to point to Render hostname `https://<service-name>.onrender.com`.

## 6. Health Checks
- Render pings `/` by default. Ensure the NestJS app exposes a health endpoint (e.g., `/api/health`). Update Render health check path in service settings.

## 7. Scaling & Background Jobs
- Bull processors run inside the same service. To avoid blocking HTTP requests, consider a second Render service dedicated to queues (same repo, `npm run start:queue`). Both services can share Redis.
- For scheduled jobs, use Render’s Cron Jobs hitting designated endpoints or keep NestJS Scheduler enabled.

## 8. Observability
- Use Render logs for quick diagnostics.
- Add structured logging inside NestJS (e.g., `pino` + `nestjs-pino`).
- Connect external monitoring (Datadog, Sentry) via additional env vars.

## 9. Frontend Coordination
- After backend is live, update frontend `VITE_API_URL` to Render URL.
- Redeploy Netlify/Vercel frontend so the new API base propagates.

## 10. Maintenance Checklist
- Rotate secrets regularly (`JWT_SECRET`, API keys).
- Keep `npm install` cached by pinning dependencies.
- For large builds, enable Render build cache.
- Add GitHub Actions to run tests before Render deploys (optional).

With this setup, the NestJS backend runs entirely on Render while the frontend stays on Netlify/Vercel. Let me know if you’d like automation scripts or Terraform/Render Blueprint YAML for one-click provisioning.
