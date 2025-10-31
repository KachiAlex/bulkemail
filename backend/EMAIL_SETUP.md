# Email Sending Configuration Guide

## Overview
The PANDI CRM supports multiple email service providers for sending campaign emails. You can use **SendGrid**, **AWS SES**, or **SMTP** (Gmail, Outlook, etc.). This guide explains how to configure and set up email sending functionality.

## Quick Start - Choose Your Provider

### 🚀 Recommended: AWS SES (62,000 emails/month free)
Best for production. See [AWS SES Setup](#option-2-aws-ses-recommended) below.

### 📧 Easy Option: SMTP (Gmail/Outlook)
Best for testing. See [SMTP Setup](#option-3-smtp-easy) below.

### 🔧 Alternative: SendGrid (100 emails/day free)
Good for development. See [SendGrid Setup](#option-1-sendgrid) below.

---

## Email Provider Options

---

## Option 1: SendGrid

### Prerequisites
1. A SendGrid account (sign up at https://sendgrid.com)
2. Access to your SendGrid API key
3. A verified sender email address

### Step 1: Create a SendGrid Account
1. Go to https://sendgrid.com and sign up for an account
2. Complete the account verification process
3. Verify your email address and complete the onboarding

## Step 2: Create an API Key
1. Log in to your SendGrid dashboard
2. Navigate to **Settings** → **API Keys**
3. Click **Create API Key**
4. Name your API key (e.g., "PANDI CRM API Key")
5. Select **Full Access** or customize permissions (at minimum, enable Mail Send permissions)
6. Click **Create & View**
7. **IMPORTANT**: Copy the API key immediately (you won't be able to see it again)
8. Store the API key securely

## Step 3: Verify Your Sender Email
1. In SendGrid dashboard, go to **Settings** → **Sender Authentication**
2. Choose one of the following:

### Option A: Single Sender Verification (Recommended for Development)
1. Click **Verify a Single Sender**
2. Fill in your sender information:
   - From Name: Your name or company name
   - From Email: Your verified email address (e.g., noreply@yourdomain.com)
   - Reply To: Same email or different
   - Company Address: Your business address
3. Click **Create**
4. Check your email inbox and click the verification link

### Option B: Domain Authentication (Recommended for Production)
1. Click **Authenticate Your Domain**
2. Select your domain provider
3. Add the DNS records provided by SendGrid to your domain
4. Wait for verification (can take up to 48 hours)

## Step 4: Configure Environment Variables

Create or update the `backend/.env` file with the following variables:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=PANDI CRM

# Enable email feature
ENABLE_EMAIL=true
```

**Important Notes:**
- Replace `your_sendgrid_api_key_here` with your actual SendGrid API key
- Replace `noreply@yourdomain.com` with your verified sender email
- Replace `PANDI CRM` with your desired sender name

## Step 5: Update Campaign Sender Details

When creating a campaign in the application:

1. Go to **Campaigns** → **Create Campaign**
2. Fill in the campaign details
3. In the **Content** step, you'll see:
   - **Sender Name**: Enter your name or company name
   - **Sender Email**: Enter a verified email address from SendGrid
4. These values will be used as the "From" field in emails

## Step 6: Test Email Sending

### Test with a Single Contact
1. Create a test contact in your CRM
2. Create a test email campaign
3. Send the campaign to your test contact
4. Check if the email is received

### Verify in SendGrid Dashboard
1. Go to **Activity** in SendGrid dashboard
2. You should see email sending activity
3. Check for any errors or issues

## Troubleshooting

### Emails Not Sending
1. **Check API Key**: Verify your SendGrid API key is correct
2. **Check Sender Email**: Ensure the sender email is verified in SendGrid
3. **Check Campaign Configuration**: Verify sender details in campaign
4. **Check Environment Variables**: Ensure all environment variables are set correctly
5. **Check Backend Logs**: Look for error messages in the backend console

### Common Error Messages

#### "Invalid API Key"
- Solution: Double-check your SENDGRID_API_KEY in the .env file

#### "The from address does not match a verified Sender Identity"
- Solution: Verify your sender email in SendGrid dashboard

#### "Email sending is disabled"
- Solution: Set `ENABLE_EMAIL=true` in your .env file

### Email Limits

SendGrid has different tiers:
- **Free Tier**: 100 emails/day
- **Essentials**: 40,000 emails/month (starting at $15/month)
- **Pro**: 100,000 emails/month (starting at $89/month)

Monitor your usage in the SendGrid dashboard.

## Alternative Email Providers

To use a different email provider:

1. **AWS SES (Simple Email Service)**
   - Update `email.service.ts` to use AWS SES SDK
   - Configure AWS credentials in `.env`

2. **Mailgun**
   - Update `email.service.ts` to use Mailgun SDK
   - Configure Mailgun API key in `.env`

3. **SMTP Server**
   - Configure custom SMTP settings
   - Update the email service to use nodemailer

## Security Best Practices

1. **Never Commit API Keys**: Keep `.env` file in `.gitignore`
2. **Use Environment Variables**: Never hardcode credentials
3. **Rotate API Keys**: Regularly rotate your SendGrid API key
4. **Monitor Usage**: Set up alerts for unusual activity
5. **Verify Sender Emails**: Always verify sender emails before sending

## Support

- SendGrid Documentation: https://docs.sendgrid.com
- SendGrid Support: https://support.sendgrid.com
- GitHub Issues: Create an issue in the repository

---

## Option 2: AWS SES (Recommended for Production)

### Why AWS SES?
- **62,000 emails/month free**
- **$0.10 per 1,000 emails** after free tier
- High deliverability
- Reliable infrastructure

### Quick Setup:

1. **Create AWS Account** (if you don't have one)
   - Go to https://aws.amazon.com and sign up

2. **Go to SES Console**
   - Search for "SES" in AWS Console
   - Click "Verified identities" → "Create identity"
   - Enter your email and verify it

3. **Create IAM User**
   - Go to IAM → Users → Add user
   - Attach "AmazonSESFullAccess" policy
   - Save Access Key ID and Secret Access Key

4. **Update `.env`**:
```env
# AWS SES Configuration
AWS_SES_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
FROM_EMAIL=your-verified-email@example.com
FROM_NAME=PANDI CRM
ENABLE_EMAIL=true
```

**Full AWS SES Guide**: See `EMAIL_SETUP_ALTERNATIVES.md` for detailed instructions.

---

## Option 3: SMTP (Easy for Testing)

### Using Gmail SMTP:

1. **Enable App Password** in your Google Account
   - Go to Security → App passwords
   - Generate a password for "Mail"

2. **Update `.env`**:
```env
# Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password
FROM_EMAIL=your-email@gmail.com
FROM_NAME=PANDI CRM
ENABLE_EMAIL=true
```

### Using Outlook SMTP:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Using Custom SMTP:
```env
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASS=your-password
```

**Note**: Remove SendGrid API key if using SMTP.

---

## How to Switch Providers

The system auto-detects your provider based on `.env` variables:

1. **SendGrid**: If `SENDGRID_API_KEY` is set
2. **AWS SES**: If `AWS_SES_REGION` is set  
3. **SMTP**: If `SMTP_HOST` is set

**Priority**: SendGrid → SES → SMTP

Just update your `.env` file and restart the backend!

---

## Next Steps

After configuring email sending:
1. Start backend: `npm run start:dev`
2. Check logs: Look for "Email service initialized with provider: [provider]"
3. Create a test campaign
4. Send to a test contact
5. Verify delivery
6. Monitor campaign analytics

## Need Help?

See `EMAIL_SETUP_ALTERNATIVES.md` for detailed guides on AWS SES and SMTP setup.
