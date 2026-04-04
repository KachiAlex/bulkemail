Postgres provisioning and migration checklist

1) Provision a managed Postgres (recommended: Supabase or Neon)

- Create a project and copy the connection string (a full `DATABASE_URL`).

2) Set Netlify environment variable

- In Netlify UI: Site settings → Build & deploy → Environment → add `DATABASE_URL`.
- Or via Netlify CLI: `npx netlify env:set DATABASE_URL "<value>" --site <site-id>`

3) Run migrations locally (example)

```bash
npm ci
npm run db:migrate
```

If your CI runs migrations during deploy, ensure `DATABASE_URL` is set in Netlify.

4) Seed admin user

- If you have a seed script (e.g. `npm run seed:admin`), run it after migrations.

5) Post-migration checks

- Verify the `users` table exists and admin account is created.
- Point the backend to the new DB and run basic smoke tests.

Notes

- The project already contains `data-source.ts` and `scripts/run-migrations.ts`.
- If you want, I can run `npm run db:migrate` here once you provide a `DATABASE_URL`.
