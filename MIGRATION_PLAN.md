Migration plan: Remove Firebase (client + admin) → Netlify backend + Postgres + Cloudinary
=====================================================================================

Overview
- Goal: Remove Firebase usage across the codebase and replace with backend JWT auth, Postgres-backed data access (TypeORM), and Cloudinary for storage.
- Deliverables: per-file checklist + exact edit patches (provided below as patch snippets) so you can review and apply changes incrementally.

Notes
- The patches below are suggestions in unified-diff-like form. They are not applied by this file; apply them incrementally and run the app/tests after each change.

1) Frontend: `frontend/firebase-config.ts`
Purpose: initialize Firebase client SDK and export `auth`, `db`, `storage`, `functions`.
Status: already updated to export safe shims if Vite envs missing. Final step: remove file and all imports once migration complete.

Suggested action: delete the file when client Firebase is fully removed.

Patch (delete file):
```text
PATCH: delete file frontend/firebase-config.ts
```

2) Frontend: `frontend/src/services/firebase-auth.js`
Purpose: Firebase Auth wrapper used by frontend.
Action: Replace with backend JWT `authApi` usage. New file will call `authApi.login/register/logout`.

Patch (replacement):
```text
PATCH FOR: frontend/src/services/firebase-auth.js
--- (original contents removed)
+++ (new contents)
import { authApi } from './authApi';

// Auth service replaced by backend JWT API
export const authService = {
  async register(email, password, userData) {
    const res = await authApi.register({ email, password, ...userData });
    return res;
  },

  async login(email, password) {
    const res = await authApi.login({ email, password });
    return res;
  },

  async logout() {
    await authApi.logout();
  },

  getCurrentUser() {
    // Frontend state should store user from JWT login flow
    return null;
  },

  onAuthStateChanged(/*callback*/) {
    // Not applicable for backend JWT flow; keep a no-op for now
    return () => {};
  }
};
```

3) Frontend: `frontend/src/services/firebase-db.js`
Purpose: Firestore CRUD operations for contacts, campaigns, calls, analytics.
Action: Replace with `contactsApi`, `campaignsApi`, etc. using `httpClient` / backend endpoints.

Patch (replacement):
```text
PATCH FOR: frontend/src/services/firebase-db.js
--- (original contents removed)
+++ (new contents)
import httpClient from './httpClient';

export const dbService = {
  async getContacts() {
    const { data } = await httpClient.get('/contacts');
    return data;
  },

  async getContact(contactId) {
    const { data } = await httpClient.get(`/contacts/${contactId}`);
    return data;
  },

  async createContact(contactData) {
    const { data } = await httpClient.post('/contacts', contactData);
    return data;
  },

  async updateContact(contactId, updateData) {
    await httpClient.put(`/contacts/${contactId}`, updateData);
  },

  async deleteContact(contactId) {
    await httpClient.delete(`/contacts/${contactId}`);
  },

  async getCampaigns() {
    const { data } = await httpClient.get('/campaigns');
    return data;
  },

  async createCampaign(campaignData) {
    const { data } = await httpClient.post('/campaigns', campaignData);
    return data;
  },

  async updateCampaign(campaignId, updateData) {
    await httpClient.put(`/campaigns/${campaignId}`, updateData);
  },

  async getDashboardStats() {
    const { data } = await httpClient.get('/analytics/dashboard');
    return data;
  }
};
```

4) Frontend pages: `frontend/src/pages/Auth/Login.tsx` and `Register.tsx`
Purpose: currently call Firebase Auth after backend login/registration. Remove Firebase calls and rely on backend JWT flow.

Patch (Login.tsx example):
```text
PATCH FOR: frontend/src/pages/Auth/Login.tsx
--- remove firebase auth imports and firebase sign-in calls
+++ use backend `authApi` only and remove all firebase try/catch blocks
Example change: remove any `signInWithEmailAndPassword` or `createUserWithEmailAndPassword` usage and the `import { auth } from '../../../firebase-config'` import.
```

Apply similar edits to `Register.tsx` to remove Firebase-specific calls.

5) Frontend imports across project
Action: search and replace all imports of `../firebase-config` and usages of `auth`, `db`, `functions` to use backend APIs. Manual review required.

6) Frontend `package.json` (remove `firebase` dependency)
Patch example:
```text
PATCH FOR: frontend/package.json
- remove scripts: "firebase:deploy", "firebase:serve"
- remove dependency: "firebase"
```

7) Backend / Netlify functions (`functions/lib/*`)
Action: replace `firebase-admin` Firestore usage with Postgres (TypeORM) or re-route to internal API endpoints. Prefer editing TypeScript source in `functions/src` if available, then recompile.

Example snippet to replace Firestore write with internal API call (conceptual):
```text
// before: use admin.firestore()
// after: call internal /api/campaigns or use TypeORM to insert into Postgres
```

8) Backend seeds: `src/seeds/admin.seed.ts`
Action: remove Firebase Identity provisioning; rely on local DB account creation.

Patch example:
```text
PATCH FOR: src/seeds/admin.seed.ts
- remove ensureFirebaseAuthUser invocation
- delete ensureFirebaseAuthUser method
```

9) `.env.example` and docs
Action: Remove or mark as deprecated the `FIREBASE_SERVICE_ACCOUNT_B64` and `VITE_FIREBASE_*` entries.

Patch example:
```text
PATCH FOR: .env.example
- remove FIREBASE_SERVICE_ACCOUNT_B64 and VITE_FIREBASE_* entries
```

10) CI / Netlify notes
- Ensure `frontend/dist` and `dist/` are ignored (already added to `.gitignore`).
- Confirm Netlify envs: `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, and `CLOUDINARY_*` are set.

Recommended execution order
1. Implement backend endpoints (contacts, campaigns, analytics) in `src/` and/or Netlify functions using TypeORM.
2. Patch frontend services (`firebase-db.js`, `firebase-auth.js`) to call new endpoints.
3. Remove Firebase usage from pages/components and update imports.
4. Remove `firebase` dependency and `firebase-config.ts` once everything routes to backend.
5. Remove `firebase-admin` from server/functions and delete related envs.

If you'd like, reply with `apply-first` and I will apply the first batch of edits (frontend service replacements + auth page edits) and run a local build to verify.

End of migration plan file.
