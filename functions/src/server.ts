import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as admin from 'firebase-admin';
import { verifyIdToken } from './utils/auth';
import campaignsRouter from './routes/campaigns';

export function createApp() {
  if (!admin.apps.length) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_B64 || '';
    if (raw) {
      let sa: any = null;
      try {
        sa = JSON.parse(raw);
      } catch (_) {
        // try base64 decode fallback
        try {
          const decoded = Buffer.from(raw, 'base64').toString('utf8');
          sa = JSON.parse(decoded);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT (raw and base64) - falling back to default admin.initializeApp()', err);
        }
      }

      if (sa) {
        const appOptions: any = { credential: admin.credential.cert(sa) };
        if (process.env.FIREBASE_DATABASE_URL) appOptions.databaseURL = process.env.FIREBASE_DATABASE_URL;
        if (process.env.FIREBASE_STORAGE_BUCKET) appOptions.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
        admin.initializeApp(appOptions);
      } else {
        admin.initializeApp();
      }
    } else {
      admin.initializeApp();
    }
  }

  const app = express();
  app.use(cors({ origin: true }));
  app.use(bodyParser.json({ limit: '1mb' }));

  // Auth middleware attaches uid to req.user.uid
  app.use(async (req: any, res: any, next: any): Promise<void> => {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization;
      if (authHeader && String(authHeader).startsWith('Bearer ')) {
        const token = String(authHeader).split('Bearer ')[1];
        const decoded = await verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email };
      }
    } catch (err) {
      // ignore - endpoints can reject if unauthenticated
    }
    next();
  });

  app.use('/api/campaigns', campaignsRouter);

  // Basic health
  app.get('/health', (req: any, res: any): void => { res.json({ status: 'ok' }); });

  return app;
}
