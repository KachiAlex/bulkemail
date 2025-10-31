# Firebase Cloud Functions Setup Guide

This guide will help you create and deploy the Firebase Cloud Function for sending campaign emails.

## Quick Start

### 1. Install Dependencies (Already Done)

The functions directory has been created with all necessary dependencies.

### 2. Configure Your Email Provider

**Choose ONE of the following options:**

#### Option A: SendGrid (Easiest for Testing)

```bash
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set sendgrid.from_email="noreply@yourdomain.com"
firebase functions:config:set sendgrid.from_name="PANDI CRM"
```

#### Option B: AWS SES (Best for Production)

```bash
firebase functions:config:set aws.ses_region="us-east-1"
firebase functions:config:set aws.access_key_id="YOUR_AWS_ACCESS_KEY_ID"
firebase functions:config:set aws.secret_access_key="YOUR_AWS_SECRET_ACCESS_KEY"
firebase functions:config:set from.email="noreply@yourdomain.com"
firebase functions:config:set from.name="PANDI CRM"
```

#### Option C: SMTP (Gmail/Outlook)

For Gmail, you need an App Password (not your regular password):
1. Enable 2-Factor Authentication on your Google Account
2. Go to Google Account → Security → App Passwords
3. Generate an app password for "Mail"

```bash
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.secure="false"
firebase functions:config:set smtp.user="your-email@gmail.com"
firebase functions:config:set smtp.pass="your-app-password"
firebase functions:config:set from.email="your-email@gmail.com"
firebase functions:config:set from.name="PANDI CRM"
```

### 3. Build and Deploy

From the root directory:

```bash
cd functions
npm run build
cd ..
cd frontend
firebase deploy --only functions
```

Or deploy everything at once:

```bash
cd frontend
firebase deploy
```

### 4. Verify Deployment

```bash
firebase functions:list
```

You should see `sendCampaignEmail` in the list.

### 5. Test the Function

The function will automatically be called when you send a campaign from your app. To test manually, check the browser console when sending a campaign.

## Verification

1. Create a test campaign in your app
2. Click "Send"
3. Check Firebase Functions logs:
   ```bash
   firebase functions:log --only sendCampaignEmail
   ```

## Troubleshooting

### Function Not Found

**Error:** `Function 'sendCampaignEmail' not found`

**Solution:**
- Ensure the function is deployed: `firebase deploy --only functions`
- Wait a few minutes after deployment for the function to become available
- Verify the function name in `functions/index.ts` matches `sendCampaignEmail`

### Authentication Error

**Error:** `User must be authenticated to send emails`

**Solution:**
- Ensure you're logged into the app
- Check Firebase Authentication is enabled
- Verify the user has proper permissions

### Email Provider Not Configured

**Error:** `No email provider configured`

**Solution:**
- Set environment variables using `firebase functions:config:set` (see step 2 above)
- Verify the config is correct: `firebase functions:config:get`

### Build Errors

**Solution:**
```bash
cd functions
rm -rf lib node_modules
npm install
npm run build
```

### View Config

To see your current configuration:
```bash
firebase functions:config:get
```

### Delete Config

To remove a config value:
```bash
firebase functions:config:unset sendgrid.api_key
```

## Need Help?

1. Check the logs: `firebase functions:log`
2. Check the console: [Firebase Console](https://console.firebase.google.com)
3. Review the function code: `functions/index.ts`
4. See detailed setup guide: `functions/README.md`

## Next Steps

After deployment:
1. Send a test campaign from your app
2. Check the recipient's inbox
3. Verify campaign status updates in the app
4. Monitor logs for any errors

Your campaigns should now send emails in real-time! 🎉

