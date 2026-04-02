import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as admin from 'firebase-admin';
import { verifyIdToken } from './utils/auth';
import campaignsRouter from './routes/campaigns';

export function createApp() {
  if (!admin.apps.length) {
    admin.initializeApp();
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
