import * as functions from 'firebase-functions';
import { createApp } from './server';

const app = createApp();

export const api = functions.https.onRequest(app as any);

// Export existing callable functions from previous index if present
// (keep compatibility) - nothing else for now
