// Adapted for Netlify: export a handler usable by Netlify Functions
import { createApp } from './server';
import serverless from 'serverless-http';

const app = createApp();

module.exports = serverless(app as any);

// Export existing callable functions from previous index if present
// (keep compatibility) - nothing else for now
