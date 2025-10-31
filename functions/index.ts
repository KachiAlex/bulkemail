import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Lazy-load heavy deps to avoid cold-start/discovery timeouts
// Force redeploy to pick up runtime config
let sgMail: any;
let AWS: any;
let nodemailer: any;

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for Gen 2 functions
setGlobalOptions({ region: 'us-central1' });

// Helper to get config values from either runtime config or env vars
function getConfig(key: string): string | undefined {
  // Try environment variables first
  if (process.env[key]) {
    return process.env[key];
  }
  // Fall back to runtime config (deprecated but works until March 2026)
  try {
    const config = functions.config();
    const [namespace, configKey] = key.split('_', 2);
    // Handle namespace (case-insensitive) and key (lowercase)
    const namespaceLower = namespace.toLowerCase();
    const configKeyLower = configKey.toLowerCase();
    if (config[namespaceLower] && config[namespaceLower][configKeyLower]) {
      return config[namespaceLower][configKeyLower];
    }
  } catch (e) {
    // Ignore config errors
  }
  return undefined;
}

// Email service configuration
type EmailProvider = 'sendgrid' | 'ses' | 'smtp';

function getEmailProvider(): EmailProvider {
  // Check environment variables or runtime config
  if (getConfig('SENDGRID_API_KEY')) {
    return 'sendgrid';
  } else if (getConfig('AWS_SES_REGION')) {
    return 'ses';
  } else if (getConfig('SMTP_HOST')) {
    return 'smtp';
  }
  throw new Error('No email provider configured. Please set environment variables: SENDGRID_API_KEY, AWS_SES_REGION, or SMTP_HOST.');
}

function initializeSendGrid() {
  if (!sgMail) {
    sgMail = require('@sendgrid/mail');
  }
  const apiKey = getConfig('SENDGRID_API_KEY');
  
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY not configured. Set using: firebase functions:secrets:set SENDGRID_API_KEY');
  }
  sgMail.setApiKey(apiKey);
  console.log('SendGrid initialized');
}

function getSESClient(): any | null {
  if (!AWS) {
    try { AWS = require('aws-sdk'); } catch { return null; }
  }
  const region = getConfig('AWS_SES_REGION');
  
  if (!region) {
    return null;
  }
  
  return new AWS.SES({
    region: region,
    accessKeyId: getConfig('AWS_ACCESS_KEY_ID'),
    secretAccessKey: getConfig('AWS_SECRET_ACCESS_KEY'),
  });
}

function getSMTPTransporter(): any | null {
  if (!nodemailer) {
    try { nodemailer = require('nodemailer'); } catch { return null; }
  }
  const host = getConfig('SMTP_HOST');
  
  if (!host) {
    return null;
  }
  
  return nodemailer.createTransport({
    host: host,
    port: parseInt(getConfig('SMTP_PORT') || '587'),
    secure: (getConfig('SMTP_SECURE') || 'false') === 'true',
    auth: {
      user: getConfig('SMTP_USER'),
      pass: getConfig('SMTP_PASS'),
    },
  });
}

function getFromEmail(): string {
  // Check runtime config for FROM_EMAIL specifically
  try {
    const config = functions.config();
    if (config.from && config.from.email) {
      return config.from.email;
    }
  } catch (e) {
    // Ignore config errors
  }
  
  return (
    getConfig('FROM_EMAIL') ||
    getConfig('SENDGRID_FROM_EMAIL') ||
    getConfig('SMTP_USER') ||
    'noreply@example.com'
  );
}

function getFromName(): string {
  // Check runtime config for FROM_NAME specifically
  try {
    const config = functions.config();
    if (config.from && config.from.name) {
      return config.from.name;
    }
  } catch (e) {
    // Ignore config errors
  }
  
  return (
    getConfig('FROM_NAME') ||
    getConfig('SENDGRID_FROM_NAME') ||
    'PANDI CRM'
  );
}

async function sendEmailViaSendGrid(
  to: string,
  subject: string,
  html: string,
  fromEmail?: string,
  fromName?: string
): Promise<void> {
  const from = fromEmail || getFromEmail();
  const name = fromName || getFromName();

  const msg = {
    to,
    from: { email: from, name: name },
    subject,
    html,
    text: html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
  };

  await sgMail.send(msg);
}

async function sendEmailViaSES(
  to: string,
  subject: string,
  html: string,
  fromEmail?: string,
  fromName?: string
): Promise<void> {
  const ses = getSESClient();
  if (!ses) {
    throw new Error('AWS SES client not initialized');
  }

  const from = fromEmail || getFromEmail();
  const name = fromName || getFromName();

  const params: any = {
    Source: `${name} <${from}>`,
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Subject: {
        Data: subject,
        Charset: 'UTF-8',
      },
      Body: {
        Html: {
          Data: html,
          Charset: 'UTF-8',
        },
        Text: {
          Data: html.replace(/<[^>]*>/g, ''),
          Charset: 'UTF-8',
        },
      },
    },
  };

  await ses.sendEmail(params).promise();
}

async function sendEmailViaSMTP(
  to: string,
  subject: string,
  html: string,
  fromEmail?: string,
  fromName?: string
): Promise<void> {
  const transporter = getSMTPTransporter();
  if (!transporter) {
    throw new Error('SMTP transporter not initialized');
  }

  const from = fromEmail || getFromEmail();
  const name = fromName || getFromName();

  console.log(`SMTP Sending email from ${from} (${name}) to ${to}`);

  const mailOptions = {
    from: `${name} <${from}>`,
    to,
    subject,
    html,
    text: html.replace(/<[^>]*>/g, ''),
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('SMTP Email sent successfully:', info.messageId);
  } catch (error: any) {
    console.error('SMTP Error details:', error);
    throw error;
  }
}

// Cloud Function: sendCampaignEmail
export const sendCampaignEmail = onCall(async (request) => {
  // Debug logging
  console.log('sendCampaignEmail called. Auth:', request.auth);
  
  // Verify authentication
  if (!request.auth) {
    console.error('Authentication failed - request.auth is missing');
    throw new HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails'
    );
  }

  const { to, subject, html, from, fromName } = request.data;

  if (!to || !subject || !html) {
    throw new HttpsError(
      'invalid-argument',
      'Missing required fields: to, subject, html'
    );
  }

  try {
    console.log('Email request received:', { to, subject, from, fromName });
    const provider = getEmailProvider();
    console.log(`Sending email via ${provider} to ${to}`);

    switch (provider) {
      case 'sendgrid':
        initializeSendGrid();
        await sendEmailViaSendGrid(to, subject, html, from, fromName);
        break;
      case 'ses':
        await sendEmailViaSES(to, subject, html, from, fromName);
        break;
      case 'smtp':
        await sendEmailViaSMTP(to, subject, html, from, fromName);
        break;
      default:
        throw new Error(`Unsupported email provider: ${provider}`);
    }

    console.log(`Email sent successfully to ${to}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error: any) {
    console.error('Error sending email:', error);
    console.error('Error stack:', error.stack);
    throw new HttpsError(
      'internal',
      `Failed to send email: ${error.message}`
    );
  }
});

// Cloud Function: adminCreateUser
// Creates a Firebase Auth user and Firestore users doc with role. Allows bootstrap when no users exist.
export const adminCreateUser = onCall(async (request) => {
  const { email, password, firstName = '', lastName = '', role = 'user' } = request.data || {};
  if (!email || !password) {
    throw new HttpsError('invalid-argument', 'email and password are required');
  }

  // Check if caller is admin OR no users exist (bootstrap)
  let isBootstrap = false;
  try {
    const usersSnap = await admin.firestore().collection('users').limit(1).get();
    isBootstrap = usersSnap.empty; // allow first user creation
  } catch (_) {}

  if (!isBootstrap) {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    const callerUid = request.auth.uid;
    const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
    const callerRole = callerDoc.exists ? (callerDoc.data() as any).role : undefined;
    if (callerRole !== 'admin') {
      throw new HttpsError('permission-denied', 'Admin privileges required');
    }
  }

  try {
    // Create Auth user
    const userRecord = await admin.auth().createUser({ email, password, displayName: [firstName, lastName].filter(Boolean).join(' ') });
    const now = admin.firestore.FieldValue.serverTimestamp();
    // Create Firestore profile
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email,
      firstName,
      lastName,
      role,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    }, { merge: true });

    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error('adminCreateUser error:', error);
    throw new HttpsError('internal', error.message || 'Failed to create user');
  }
});

