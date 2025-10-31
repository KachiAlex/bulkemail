# Email Provider Setup - SendGrid & Gmail

This guide shows you how to configure both SendGrid and Gmail for email sending.

## Quick Setup

### Option 1: SendGrid (Production - Recommended)

Run these commands in your terminal (replace with your actual credentials):

```bash
firebase functions:config:set sendgrid.api_key="YOUR_SENDGRID_API_KEY"
firebase functions:config:set sendgrid.from_email="YOUR_VERIFIED_SENDER_EMAIL"
firebase functions:config:set sendgrid.from_name="PANDI CRM"
```

**To verify your config:**
```bash
firebase functions:config:get
```

### Option 2: Gmail SMTP (Testing - Easy Setup)

**First, create a Gmail App Password:**
1. Go to your Google Account: https://myaccount.google.com
2. Enable 2-Factor Authentication (if not already enabled)
3. Go to **Security** → **2-Step Verification** → **App passwords**
4. Select "Mail" and "Other (Custom name)" → Enter "PANDI CRM"
5. Click "Generate"
6. Copy the 16-character app password (you'll use this instead of your regular password)

**Then set the config:**
```bash
firebase functions:config:set smtp.host="smtp.gmail.com"
firebase functions:config:set smtp.port="587"
firebase functions:config:set smtp.secure="false"
firebase functions:config:set smtp.user="your-email@gmail.com"
firebase functions:config:set smtp.pass="your-16-char-app-password"
firebase functions:config:set from.email="your-email@gmail.com"
firebase functions:config:set from.name="PANDI CRM"
```

## Switching Between Providers

The function automatically detects which provider is configured. To switch:

1. **To use SendGrid:** Set SendGrid config (it takes priority)
2. **To use Gmail:** Remove SendGrid config or unset it, then set SMTP config

**To remove SendGrid config:**
```bash
firebase functions:config:unset sendgrid.api_key sendgrid.from_email sendgrid.from_name
```

**To remove Gmail/SMTP config:**
```bash
firebase functions:config:unset smtp.host smtp.port smtp.secure smtp.user smtp.pass
```

## Priority Order

The function checks in this order:
1. SendGrid (if `sendgrid.api_key` is set)
2. AWS SES (if `aws.ses_region` is set)
3. SMTP (if `smtp.host` is set)

So if you have both SendGrid and Gmail configured, SendGrid will be used.

## Testing Setup

1. **For Testing:** Start with Gmail (easier to set up)
2. **For Production:** Use SendGrid (more reliable, better deliverability)

## After Configuring

1. **Build the functions:**
   ```bash
   cd functions
   npm run build
   ```

2. **Deploy the function:**
   ```bash
   cd ../frontend
   firebase deploy --only functions
   ```

3. **Test by sending a campaign from your app!**

## Verify Your Configuration

View all your config:
```bash
firebase functions:config:get
```

View specific config:
```bash
firebase functions:config:get sendgrid
# or
firebase functions:config:get smtp
```

## Troubleshooting

### Gmail: "Invalid login"
- Make sure you're using an **App Password**, not your regular password
- Verify 2-Factor Authentication is enabled
- Check the app password hasn't expired

### SendGrid: "Unauthorized"
- Verify your API key is correct
- Check the sender email is verified in SendGrid
- Ensure the API key has "Mail Send" permissions

### Function not found
- Make sure you've deployed: `firebase deploy --only functions`
- Wait 2-3 minutes after deployment

## Next Steps

Once configured and deployed:
1. Create a test campaign in your app
2. Add a test contact with your email
3. Send the campaign
4. Check your inbox!

Your emails should now be sent successfully! 🎉

