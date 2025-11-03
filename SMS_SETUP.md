# SMS Setup Guide

This guide explains how to integrate SMS functionality using **Twilio**, the recommended SMS provider for this application.

## Overview

The SMS functionality uses **Twilio** as the SMS provider. You'll need:
1. A Twilio account
2. Twilio Account SID and Auth Token
3. A Twilio phone number (or trial number for testing)
4. Configure Firebase Functions environment variables

---

## Step 1: Create a Twilio Account

1. Go to https://www.twilio.com and sign up for a free account
2. Verify your email address and phone number
3. Complete the onboarding process

**Note**: Twilio offers a free trial with $15.50 in credits for testing.

---

## Step 2: Get Your Twilio Credentials

1. Log in to your Twilio Console: https://console.twilio.com/
2. On the dashboard, you'll see:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click the eye icon to reveal)
3. Copy both values - you'll need them for configuration

---

## Step 3: Get a Twilio Phone Number

### Option A: Use Trial Number (Free - For Testing)

When you sign up, Twilio automatically assigns you a trial phone number. You can:
- Send SMS to verified numbers only
- See this number in your Twilio Console → Phone Numbers → Manage → Active Numbers

### Option B: Buy a Phone Number (For Production)

1. In Twilio Console, go to **Phone Numbers** → **Buy a number**
2. Select:
   - **Country**: Your country
   - **Capabilities**: Check "SMS" and "Voice" (optional)
3. Click **Search** and choose a number
4. Complete the purchase (prices vary by country)

---

## Step 4: Configure Firebase Functions

### ⚠️ Important: functions.config() is Deprecated

The `functions.config()` API is deprecated and will be shut down in March 2026. Use Firebase Secrets Manager instead.

### Option 1: Firebase Secrets Manager (Recommended - Production)

**This is the recommended approach for production deployments.**

```bash
# Set secrets interactively (you'll be prompted to enter values)
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN
firebase functions:secrets:set TWILIO_PHONE_NUMBER

# Deploy functions (secrets are automatically accessed)
firebase deploy --only functions
```

**Note**: You need to update `functions/index.ts` to access secrets instead of config. See code update below.

### Option 2: Using functions.config() (Legacy - Will Stop Working March 2026)

```bash
# Set Twilio credentials (DEPRECATED - use secrets instead)
firebase functions:config:set \
  twilio.account_sid="YOUR_ACCOUNT_SID" \
  twilio.auth_token="YOUR_AUTH_TOKEN" \
  twilio.phone_number="+1234567890"

# Deploy functions
firebase deploy --only functions
```

### Option 3: Using .env File (Development Only)

**Note**: `.env` files are for local development only. They are NOT deployed to Firebase.

1. Create a `.env` file in the `functions` directory:

```env
TWILIO_ACCOUNT_SID=YOUR_ACCOUNT_SID
TWILIO_AUTH_TOKEN=YOUR_AUTH_TOKEN
TWILIO_PHONE_NUMBER=+1234567890
```

2. Use Firebase Functions emulator for testing:
```bash
cd functions
npm run serve
```

---

## Step 5: Install Twilio Package

The Twilio package is already included in `functions/package.json`. If you need to install manually:

```bash
cd functions
npm install twilio
```

---

## Step 6: Test SMS Functionality

Once deployed, you can test SMS sending:

1. Go to your application's **Campaigns** page
2. Click **Create Campaign**
3. Select **SMS** as the campaign type
4. Create and send a test SMS to a verified number (if using trial account)

---

## Pricing

### Twilio Pricing:
- **Trial Account**: $15.50 free credits
- **Pay-as-you-go**: 
  - US/Canada: ~$0.0075 per SMS
  - International: Varies by country
  - Check pricing: https://www.twilio.com/pricing

### Usage Tips:
- Start with trial account for testing
- Monitor usage in Twilio Console → Usage
- Set billing alerts in Twilio Console → Alerts

---

## Troubleshooting

### Error: "Twilio client not configured"
- Ensure environment variables are set correctly
- Verify values in Firebase Functions config
- Check that functions were deployed successfully

### Error: "The number +1234567890 is unverified"
- **Trial Account**: Only verified numbers can receive SMS
- **Solution**: Verify numbers in Twilio Console → Phone Numbers → Verified Caller IDs

### Error: "Permission denied"
- Check your Twilio Account SID and Auth Token
- Ensure you have sufficient credits/balance
- Verify phone number format (must include country code, e.g., +1234567890)

### SMS Not Sending
1. Check Twilio Console → Logs → Debugger for errors
2. Verify phone number format: `+[country code][number]`
   - ✅ Correct: `+14155551234`
   - ❌ Wrong: `4155551234` or `+1 (415) 555-1234`
3. Check account balance/credits
4. For trial accounts, ensure recipient is verified

---

## Alternative SMS Providers

If you prefer not to use Twilio, you can integrate:

### AWS SNS (Simple Notification Service)
- **Pros**: Integrated with AWS ecosystem
- **Cons**: More complex setup
- **Pricing**: Similar to Twilio

### Vonage (formerly Nexmo)
- **Pros**: Competitive pricing
- **Cons**: Less popular, fewer resources

### MessageBird
- **Pros**: Global coverage
- **Cons**: Higher prices in some regions

**Note**: The current implementation uses Twilio. To switch providers, modify `functions/index.ts` to use a different SDK.

---

## Next Steps

1. ✅ Set up Twilio account
2. ✅ Configure Firebase Functions with credentials
3. ✅ Deploy functions
4. ✅ Test SMS sending
5. ⚠️ Verify phone numbers (trial accounts)
6. ⚠️ Monitor usage and costs
7. ✅ Start sending SMS campaigns!

---

## Support

- **Twilio Documentation**: https://www.twilio.com/docs/sms
- **Twilio Support**: https://support.twilio.com/
- **Firebase Functions Docs**: https://firebase.google.com/docs/functions

