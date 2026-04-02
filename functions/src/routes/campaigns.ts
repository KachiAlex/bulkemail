import { Router } from 'express';
import * as admin from 'firebase-admin';
const Bull = require('bull');
import type { Queue } from 'bull';

const router = Router();
const db = admin.firestore();

// Configure Bull to use Upstash redis via REDIS_URL env
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || '';
let campaignsQueue: Queue | null = null;
if (redisUrl) {
  campaignsQueue = new Bull('campaigns', { redis: { url: redisUrl } as any });
}

function requireAuth(req: any, res: any, next: any) {
  if (!req.user || !req.user.uid) return res.status(401).json({ error: 'unauthenticated' });
  next();
}

// List campaigns for current user
router.get('/', requireAuth, async (req: any, res: any) => {
  try {
      const snapshot = await db.collection('campaigns').where('createdById', '==', req.user.uid).orderBy('createdAt', 'desc').get();
      const campaigns = snapshot.docs.map((d: any) => ({ id: d.id, ...(d.data ? d.data() : {}) }));
    res.json(campaigns);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Create campaign
router.post('/', requireAuth, async (req: any, res: any): Promise<void> => {
  try {
    const payload = req.body;
    const now = admin.firestore.FieldValue.serverTimestamp();
    const docRef = await db.collection('campaigns').add({
      ...payload,
      createdById: req.user.uid,
      totalRecipients: payload.recipientContactIds ? payload.recipientContactIds.length : 0,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      openedCount: 0,
      clickedCount: 0,
      unsubscribedCount: 0,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
    });

    // Create message docs
    if (payload.recipientContactIds && payload.recipientContactIds.length > 0) {
      const batch = db.batch();
      payload.recipientContactIds.forEach((cid: string) => {
        const msgRef = db.collection('messages').doc();
        batch.set(msgRef, {
          campaignId: docRef.id,
          contactId: cid,
          recipientEmail: null,
          recipientPhone: null,
          subject: payload.subject || '',
          content: payload.content || '',
          status: 'pending',
          createdAt: now,
          updatedAt: now,
        });
      });
      await batch.commit();
    }

    const doc = await docRef.get();
    res.json({ id: doc.id, ...(doc.data ? doc.data() : {}) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get campaign by id (with messages)
router.get('/:id', requireAuth, async (req: any, res: any): Promise<void> => {
  try {
    const id = req.params.id;
    const doc = await db.collection('campaigns').doc(id).get();
    if (!doc.exists) return res.status(404).json({ error: 'not found' });
    const campaign = { id: doc.id, ...doc.data() } as any;
    const msgsSnap = await db.collection('messages').where('campaignId', '==', id).get();
    campaign.messages = msgsSnap.docs.map((d: any) => ({ id: d.id, ...(d.data ? d.data() : {}) }));
    res.json(campaign);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Send campaign: enqueue job
router.post('/:id/send', requireAuth, async (req: any, res: any): Promise<void> => {
  try {
    const id = req.params.id;
    const docRef = db.collection('campaigns').doc(id);
    const doc = await docRef.get();
    if (!doc.exists) return res.status(404).json({ error: 'not found' });

    await docRef.update({ status: 'sending', updatedAt: admin.firestore.FieldValue.serverTimestamp() });

    if (!campaignsQueue) return res.status(500).json({ error: 'queue not configured' });
    const job = await campaignsQueue.add('send-campaign', { campaignId: id });
    res.json({ id: job.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Debug: process campaign inline (not recommended for production)
router.post('/:id/debug/process', requireAuth, async (req: any, res: any): Promise<void> => {
  try {
    const id = req.params.id;
    // Simple inline processing: fetch messages and mark sent (no external email provider here)
    const msgsSnap = await db.collection('messages').where('campaignId', '==', id).where('status', '==', 'pending').get();
    const batch = db.batch();
    msgsSnap.docs.forEach((doc: any) => {
      const ref = db.collection('messages').doc(doc.id);
      batch.update(ref, { status: 'sent', sentAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    });
    await batch.commit();
    await db.collection('campaigns').doc(id).update({ status: 'sent', sentAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    res.json({ success: true, processed: msgsSnap.size });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
