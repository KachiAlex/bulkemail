# 🚀 Deploy Firebase Functions - Quick Guide

## ✅ Step-by-Step Deployment

### Step 1: Set Up Secrets (Choose Your Provider)

**Option A: SendGrid (Recommended for Production)**

Run these commands from the **root directory** (`C:\bulkemail`):

```bash
firebase functions:secrets:set SENDGRID_API_KEY
# When prompted, paste your SendGrid API key and press Enter

firebase functions:secrets:set SENDGRID_FROM_EMAIL  
# When prompted, paste your verified sender email and press Enter

firebase functions:secrets:set SENDGRID_FROM_NAME
# When prompted, enter: PANDI CRM and press Enter
```

**Option B: Gmail SMTP (For Testing)**

First, get a Gmail App Password:
1. Go to https://myaccount.google.com/security
2. Enable 2-Factor Authentication (if not enabled)
3. Go to **Security** → **2-Step Verification** → **App passwords**
4. Generate app password for "Mail" → "Other (PANDI CRM)"
5. Copy the 16-character password

Then run:
```bash
firebase functions:secrets:set SMTP_HOST
# Enter: smtp.gmail.com

firebase functions:secrets:set SMTP_PORT
# Enter: 587

firebase functions:secrets:set SMTP_SECURE
# Enter: false

firebase functions:secrets:set SMTP_USER
# Enter: your-email@gmail.com

firebase functions:secrets:set SMTP_PASS
# Paste your Gmail App Password (16 characters)

firebase functions:secrets:set FROM_EMAIL
# Enter: your-email@gmail.com

firebase functions:secrets:set FROM_NAME
# Enter: PANDI CRM
```

**You can set BOTH SendGrid and Gmail** - the function will use SendGrid if available, otherwise Gmail.

### Step 2: Verify Secrets Are Set

```bash
firebase functions:secrets:access SENDGRID_API_KEY
# Should show your API key (or empty if not set)
```

### Step 3: Build the Functions

```bash
cd functions
npm run build
```

Expected output: `✓ Built successfully` (no errors)

### Step 4: Deploy the Function

```bash
cd ../frontend
firebase deploy --only functions
```

This will:
- Build the function
- Deploy to Firebase
- Make it available as `sendCampaignEmail`

### Step 5: Verify Deployment

```bash
firebase functions:list
```

You should see:
```
sendCampaignEmail (us-central1)
```

### Step 6: Test It!

1. Open your app: https://bulkemail-crm.web.app
2. Create a test campaign
3. Add your email as a contact
4. Send the campaign
5. Check your inbox! 📧

## 🐛 Troubleshooting

### "No email provider configured"
**Solution:** Make sure you've set at least one provider's secrets using `firebase functions:secrets:set`

### "Function not found"
**Solution:** 
- Wait 2-3 minutes after deployment
- Check: `firebase functions:list`
- Verify deployment succeeded (no errors)

### Build Errors
**Solution:**
```bash
cd functions
rm -rf lib node_modules
npm install
npm run build
```

### View Logs
```bash
firebase functions:log --only sendCampaignEmail
```

## 📝 Notes

- Secrets are secure and encrypted by Firebase
- You can update secrets anytime: `firebase functions:secrets:set SECRET_NAME`
- To remove a secret: `firebase functions:secrets:destroy SECRET_NAME`
- Both SendGrid and Gmail can be configured - SendGrid takes priority

## ✅ What Happens Next?

Once deployed, when you send a campaign:
1. Frontend calls the `sendCampaignEmail` Cloud Function
2. Function detects your configured provider (SendGrid or Gmail)
3. Emails are sent in batches
4. Campaign status updates in real-time
5. Recipients receive the emails! 🎉

Your email sending is now fully automated!

