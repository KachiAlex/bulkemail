# Firebase Cloud Functions - Email Sending

This directory contains Firebase Cloud Functions for sending campaign emails.

## Prerequisites

1. Firebase CLI installed and logged in
2. Node.js 18+ installed
3. Email provider credentials (SendGrid, AWS SES, or SMTP)

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Configure Email Provider

Choose **ONE** of the following email providers and set the corresponding environment variables:

#### Option A: SendGrid (Recommended for Development)

```bash
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set sendgrid.from_email="noreply@yourdomain.com"
firebase functions:config:set sendgrid.from_name="PANDI CRM"
```

#### Option B: AWS SES (Recommended for Production)

```bash
firebase functions:config:set aws.ses_region="us-east-1"
firebase functions:config:set aws.access_key_id="YOUR_AWS_ACCESS_KEY_ID"
firebase functions:config:set aws.secret_access_key="YOUR_AWS_SECRET_ACCESS_KEY"
firebase functions:config:set from.email="noreply@yourdomain.com"
firebase functions:config:set from.name="PANDI CRM"
```

#### Option C: SMTP (Gmail/Outlook/etc.)

```bash
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.secure="false"
firebase functions:config:set smtp.user="your-email@gmail.com"
firebase functions:config:set smtp.pass="your-app-password"
firebase functions:config:set from.email="your-email@gmail.com"
firebase functions:config:set from.name="PANDI CRM"
```

**Note:** For Gmail, you need to:
1. Enable 2-Factor Authentication
2. Create an App Password (not your regular password)
3. Use the App Password in the config

### 3. Update the Function Code

The function automatically reads from `functions.config()`. Update `index.ts` to use the config:

**Current code reads from `process.env`**, but Firebase Functions v1 uses `functions.config()`.

You can either:
- Use `firebase functions:config:set` (shown above) and update code to read from `functions.config()`
- Use environment-specific `.env` files and update code accordingly

## Deployment

### Build

```bash
cd functions
npm run build
```

### Deploy

From the root directory:

```bash
firebase deploy --only functions
```

Or from the frontend directory:

```bash
cd frontend
firebase deploy --only functions
```

### Deploy All (Hosting + Functions)

```bash
cd frontend
firebase deploy
```

## Testing

### Local Testing

1. Start the emulator:
```bash
cd functions
npm run serve
```

2. Test the function using the Firebase Emulator UI or from your frontend with:
```javascript
const sendEmail = httpsCallable(functions, 'sendCampaignEmail');
const result = await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<h1>Test</h1>'
});
```

### View Logs

```bash
firebase functions:log
```

## Troubleshooting

### Function not found
- Ensure the function is deployed: `firebase deploy --only functions`
- Check the function name matches: `sendCampaignEmail`

### Authentication errors
- Ensure users are authenticated before calling the function
- Check Firebase Authentication is enabled

### Email sending fails
- Verify environment variables are set correctly
- Check email provider credentials
- Review logs: `firebase functions:log --only sendCampaignEmail`

### Build errors
- Ensure TypeScript is installed: `npm install --save-dev typescript @types/node`
- Check Node version (should be 18+)
- Clear and rebuild: `rm -rf lib && npm run build`

## Environment Variables Reference

| Variable | Provider | Description |
|----------|----------|-------------|
| `SENDGRID_API_KEY` | SendGrid | Your SendGrid API key |
| `SENDGRID_FROM_EMAIL` | SendGrid | Verified sender email |
| `SENDGRID_FROM_NAME` | SendGrid | Sender display name |
| `AWS_SES_REGION` | AWS SES | AWS region (e.g., us-east-1) |
| `AWS_ACCESS_KEY_ID` | AWS SES | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | AWS SES | AWS secret key |
| `SMTP_HOST` | SMTP | SMTP server hostname |
| `SMTP_PORT` | SMTP | SMTP port (usually 587) |
| `SMTP_SECURE` | SMTP | Use TLS/SSL (true/false) |
| `SMTP_USER` | SMTP | SMTP username |
| `SMTP_PASS` | SMTP | SMTP password |
| `FROM_EMAIL` | All | Default sender email |
| `FROM_NAME` | All | Default sender name |

## Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference)
- [AWS SES Documentation](https://docs.aws.amazon.com/ses/)
- [Nodemailer Documentation](https://nodemailer.com/about/)

