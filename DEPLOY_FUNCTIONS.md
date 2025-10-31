# Deploy Firebase Functions - Step by Step

## ⚠️ Important: Use Environment Variables (Not functions.config)

Firebase is deprecating `functions.config()`. We'll use environment variables instead.

## Quick Deployment Steps

### Step 1: Set Your Email Provider Configuration

Run these commands from the **root directory** (`C:\bulkemail`):

**For SendGrid:**
```bash
firebase functions:secrets:set SENDGRID_API_KEY
# When prompted, paste your SendGrid API key

firebase functions:secrets:set SENDGRID_FROM_EMAIL
# When prompted, paste your verified sender email

firebase functions:secrets:set SENDGRID_FROM_NAME
# When prompted, enter: PANDI CRM
```

**For Gmail SMTP:**
```bash
firebase functions:secrets:set SMTP_HOST
# When prompted, enter: smtp.gmail.com

firebase functions:secrets:set SMTP_PORT
# When prompted, enter: 587

firebase functions:secrets:set SMTP_SECURE
# When prompted, enter: false

firebase functions:secrets:set SMTP_USER
# When prompted, enter: your-email@gmail.com

firebase functions:secrets:set SMTP_PASS
# When prompted, paste your Gmail App Password

firebase functions:secrets:set FROM_EMAIL
# When prompted, enter: your-email@gmail.com

firebase functions:secrets:set FROM_NAME
# When prompted, enter: PANDI CRM
```

### Step 2: Update Function Code to Use Secrets

The function code already supports `process.env`, which works with secrets. We just need to update it to use the secrets properly.

### Step 3: Build and Deploy

```bash
cd functions
npm run build
cd ../frontend
firebase deploy --only functions
```

## Alternative: Using .env file (For Local Testing)

Create a `.env` file in the `functions` directory (for local testing only):

```env
SENDGRID_API_KEY=your_key_here
SENDGRID_FROM_EMAIL=your@email.com
SENDGRID_FROM_NAME=PANDI CRM
```

**Note:** `.env` files are for local testing. For production, use `firebase functions:secrets`.

## Verify Deployment

1. **Check deployed functions:**
   ```bash
   firebase functions:list
   ```

2. **View logs:**
   ```bash
   firebase functions:log
   ```

3. **Test by sending a campaign from your app!**

## Troubleshooting

### Secret not found
- Make sure you've set the secrets using `firebase functions:secrets:set`
- Secrets are project-specific and require appropriate permissions

### Function build errors
```bash
cd functions
rm -rf lib node_modules
npm install
npm run build
```

### Function not found after deployment
- Wait 2-3 minutes after deployment
- Check: `firebase functions:list`
- Verify the function name matches in `functions/index.ts`

