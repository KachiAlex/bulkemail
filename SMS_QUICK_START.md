# SMS Quick Start Guide

## What You Need to Make SMS Work

### ✅ Already Done:
1. ✅ SMS sending function added to Firebase Functions (`sendCampaignSMS`)
2. ✅ Twilio package installed
3. ✅ SMS setup guide created (`SMS_SETUP.md`)

### 🔧 What You Need to Do:

#### 1. Get Twilio Credentials (5 minutes)
   - Sign up at https://www.twilio.com (free trial available)
   - Get your Account SID and Auth Token from Twilio Console
   - Note your Twilio phone number (trial number is fine for testing)

#### 2. Configure Firebase Functions (2 minutes)
```bash
# Set Twilio credentials using Firebase config (deprecated but works until March 2026)
firebase functions:config:set \
  twilio.account_sid="YOUR_ACCOUNT_SID_HERE" \
  twilio.auth_token="YOUR_AUTH_TOKEN_HERE" \
  twilio.phone_number="+1234567890"

# Deploy the functions
cd ..
firebase deploy --only functions
```

#### 3. Test SMS Sending
   - Go to Campaigns → Create Campaign
   - Select "SMS" as campaign type
   - Send a test SMS!

---

## Quick Configuration Commands

### Using functions.config() (Works Now - Deprecated in 2026)
```bash
firebase functions:config:set twilio.account_sid="ACxxxxx"
firebase functions:config:set twilio.auth_token="your_token"
firebase functions:config:set twilio.phone_number="+1234567890"
firebase deploy --only functions
```

### Using Firebase Secrets (Recommended for Future)
```bash
firebase functions:secrets:set TWILIO_ACCOUNT_SID
firebase functions:secrets:set TWILIO_AUTH_TOKEN  
firebase functions:secrets:set TWILIO_PHONE_NUMBER
firebase deploy --only functions
```

**Note**: If using secrets, you'll need to update `functions/index.ts` to access secrets instead of config.

---

## Cost

- **Free Trial**: $15.50 free credits (enough for ~2,000 SMS)
- **Pay-as-you-go**: ~$0.0075 per SMS in US/Canada
- **Check Pricing**: https://www.twilio.com/pricing

---

## Troubleshooting

### "Twilio is not configured" error
→ Run the `firebase functions:config:set` commands above

### "Invalid phone number format" error  
→ Use E.164 format: `+1234567890` (include country code, no spaces)

### "Number is unverified" error
→ Trial accounts can only send to verified numbers. Verify numbers in Twilio Console.

---

## Full Documentation

See `SMS_SETUP.md` for complete instructions and troubleshooting.

