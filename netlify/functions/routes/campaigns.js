"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin = __importStar(require("firebase-admin"));
const Bull = require('bull');
const router = (0, express_1.Router)();
const db = admin.firestore();
// Configure Bull to use Upstash redis via REDIS_URL env
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_URL || '';
let campaignsQueue = null;
if (redisUrl) {
    campaignsQueue = new Bull('campaigns', { redis: { url: redisUrl } });
}
function requireAuth(req, res, next) {
    if (!req.user || !req.user.uid)
        return res.status(401).json({ error: 'unauthenticated' });
    next();
}
// List campaigns for current user
router.get('/', requireAuth, async (req, res) => {
    try {
        const snapshot = await db.collection('campaigns').where('createdById', '==', req.user.uid).orderBy('createdAt', 'desc').get();
        const campaigns = snapshot.docs.map((d) => ({ id: d.id, ...(d.data ? d.data() : {}) }));
        res.json(campaigns);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Create campaign
router.post('/', requireAuth, async (req, res) => {
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
            payload.recipientContactIds.forEach((cid) => {
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
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Get campaign by id (with messages)
router.get('/:id', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const doc = await db.collection('campaigns').doc(id).get();
        if (!doc.exists)
            return res.status(404).json({ error: 'not found' });
        const campaign = { id: doc.id, ...doc.data() };
        const msgsSnap = await db.collection('messages').where('campaignId', '==', id).get();
        campaign.messages = msgsSnap.docs.map((d) => ({ id: d.id, ...(d.data ? d.data() : {}) }));
        res.json(campaign);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Send campaign: enqueue job
router.post('/:id/send', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        const docRef = db.collection('campaigns').doc(id);
        const doc = await docRef.get();
        if (!doc.exists)
            return res.status(404).json({ error: 'not found' });
        await docRef.update({ status: 'sending', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        if (!campaignsQueue)
            return res.status(500).json({ error: 'queue not configured' });
        const job = await campaignsQueue.add('send-campaign', { campaignId: id });
        res.json({ id: job.id });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// Debug: process campaign inline (not recommended for production)
router.post('/:id/debug/process', requireAuth, async (req, res) => {
    try {
        const id = req.params.id;
        // Simple inline processing: fetch messages and mark sent (no external email provider here)
        const msgsSnap = await db.collection('messages').where('campaignId', '==', id).where('status', '==', 'pending').get();
        const batch = db.batch();
        msgsSnap.docs.forEach((doc) => {
            const ref = db.collection('messages').doc(doc.id);
            batch.update(ref, { status: 'sent', sentAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        });
        await batch.commit();
        await db.collection('campaigns').doc(id).update({ status: 'sent', sentAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        res.json({ success: true, processed: msgsSnap.size });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.default = router;
//# sourceMappingURL=campaigns.js.map