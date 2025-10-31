import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
// Lazy-load heavy deps to avoid cold-start/discovery timeouts
// Updated: Email sending configured with Gmail SMTP
let sgMail: any;
let AWS: any;
let nodemailer: any;

// Initialize Firebase Admin
admin.initializeApp();

// Email service configuration
type EmailProvider = 'sendgrid' | 'ses' | 'smtp';

function getEmailProvider(): EmailProvider {
  // Check environment variables first (preferred method - uses Firebase secrets)
  // Fallback to functions.config() for backward compatibility (deprecated)
  const config = functions.config();
  
  if (process.env.SENDGRID_API_KEY || config?.sendgrid?.api_key) {
    return 'sendgrid';
  } else if (process.env.AWS_SES_REGION || config?.aws?.ses_region) {
    return 'ses';
  } else if (process.env.SMTP_HOST || config?.smtp?.host) {
    return 'smtp';
  }
  throw new Error('No email provider configured. Please set environment variables using "firebase functions:secrets:set" or Firebase config for SendGrid, AWS SES, or SMTP.');
}

function initializeSendGrid() {
  if (!sgMail) {
    sgMail = require('@sendgrid/mail');
  }
  const config = functions.config();
  // Prefer environment variable (Firebase secrets), fallback to config
  const apiKey = process.env.SENDGRID_API_KEY || config?.sendgrid?.api_key;
  
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
  const config = functions.config();
  const region = process.env.AWS_SES_REGION || config?.aws?.ses_region;
  
  if (!region) {
    return null;
  }
  
  return new AWS.SES({
    region: region,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || config?.aws?.access_key_id,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || config?.aws?.secret_access_key,
  });
}

function getSMTPTransporter(): any | null {
  if (!nodemailer) {
    try { nodemailer = require('nodemailer'); } catch { return null; }
  }
  const config = functions.config();
  const host = process.env.SMTP_HOST || config?.smtp?.host;
  
  if (!host) {
    return null;
  }
  
  return nodemailer.createTransport({
    host: host,
    port: parseInt(process.env.SMTP_PORT || config?.smtp?.port || '587'),
    secure: (process.env.SMTP_SECURE || config?.smtp?.secure || 'false') === 'true',
    auth: {
      user: process.env.SMTP_USER || config?.smtp?.user,
      pass: process.env.SMTP_PASS || config?.smtp?.pass,
    },
  });
}

function getFromEmail(): string {
  const config = functions.config();
  return (
    process.env.FROM_EMAIL ||
    config?.from?.email ||
    process.env.SENDGRID_FROM_EMAIL ||
    config?.sendgrid?.from_email ||
    process.env.SMTP_USER ||
    config?.smtp?.user ||
    'noreply@example.com'
  );
}

function getFromName(): string {
  const config = functions.config();
  return (
    process.env.FROM_NAME ||
    config?.from?.name ||
    process.env.SENDGRID_FROM_NAME ||
    config?.sendgrid?.from_name ||
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
// Secrets set via "firebase functions:secrets:set" are available as environment variables
export const sendCampaignEmail = functions.https.onCall(async (data: any, context?: any) => {
  // Verify authentication
  if (!context || !context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to send emails'
    );
  }

  const { to, subject, html, from, fromName } = data;

  if (!to || !subject || !html) {
    throw new functions.https.HttpsError(
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
    throw new functions.https.HttpsError(
      'internal',
      `Failed to send email: ${error.message}`
    );
  }
});

// Cloud Function: adminCreateUser
// Creates a Firebase Auth user and Firestore users doc with role. Allows bootstrap when no users exist.
export const adminCreateUser = functions.https.onCall(async (data: any, context?: any) => {
  const { email, password, firstName = '', lastName = '', role = 'user' } = data || {};
  if (!email || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'email and password are required');
  }

  // Check if caller is admin OR no users exist (bootstrap)
  let isBootstrap = false;
  try {
    const usersSnap = await admin.firestore().collection('users').limit(1).get();
    isBootstrap = usersSnap.empty; // allow first user creation
  } catch (_) {}

  if (!isBootstrap) {
    if (!context || !context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const callerUid = context.auth.uid;
    const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
    const callerRole = callerDoc.exists ? (callerDoc.data() as any).role : undefined;
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Admin privileges required');
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
    throw new functions.https.HttpsError('internal', error.message || 'Failed to create user');
  }
});

