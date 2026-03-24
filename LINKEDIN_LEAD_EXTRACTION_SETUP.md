# LinkedIn Lead Extraction Setup Guide

This guide will help you set up LinkedIn lead extraction similar to Lusha, using legitimate data provider APIs.

## Overview

The lead extraction feature allows you to:
- Extract contact information from LinkedIn profile URLs
- Support multiple data providers (Lusha, Apollo.io, Hunter.io)
- Bulk extract leads from multiple LinkedIn profiles
- Auto-import extracted leads into your CRM contacts
- Enrich existing contacts with additional data

## Supported Providers

### 1. Lusha (Recommended)
- **Website**: https://www.lusha.com
- **API Documentation**: https://www.lusha.com/api-docs/
- **Best for**: Direct LinkedIn profile extraction, email and phone finding
- **Pricing**: Free tier available, paid plans start at $49/month

### 2. Apollo.io
- **Website**: https://www.apollo.io
- **API Documentation**: https://apolloio.github.io/apollo-api-docs/
- **Best for**: B2B contact database, company and job title enrichment
- **Pricing**: Free tier available, paid plans start at $39/month

### 3. Hunter.io
- **Website**: https://hunter.io
- **API Documentation**: https://hunter.io/api-documentation
- **Best for**: Email finding and verification
- **Pricing**: Free tier available (25 requests/month), paid plans start at $49/month

## Setup Instructions

### Step 1: Get API Key from Provider

#### For Lusha:
1. Sign up at https://www.lusha.com
2. Go to your account settings
3. Navigate to API section
4. Copy your API key

#### For Apollo.io:
1. Sign up at https://www.apollo.io
2. Go to Settings → Integrations → API
3. Copy your API key

#### For Hunter.io:
1. Sign up at https://hunter.io
2. Go to Dashboard → API
3. Copy your API key

### Step 2: Configure Firebase Functions

You need to set the API key as a Firebase Function secret. Here's how:

#### Using Firebase Secrets Manager (Recommended):

```bash
# Set the secret for Lusha
firebase functions:secrets:set LUSHA_API_KEY
# When prompted, paste your Lusha API key

# Set the secret for Apollo
firebase functions:secrets:set APOLLO_API_KEY
# When prompted, paste your Apollo API key

# Set the secret for Hunter
firebase functions:secrets:set HUNTER_API_KEY
# When prompted, paste your Hunter API key
```

#### Using Firebase Functions Config (Legacy - Deprecated):

```bash
# Set Lusha API key
firebase functions:config:set lusha.api_key="YOUR_LUSHA_API_KEY"

# Set Apollo API key
firebase functions:config:set apollo.api_key="YOUR_APOLLO_API_KEY"

# Set Hunter API key
firebase functions:config:set hunter.api_key="YOUR_HUNTER_API_KEY"
```

### Step 3: Update Firebase Functions Code

The functions code needs to access secrets. Update `functions/index.ts` to use secrets:

```typescript
// For Lusha (example in extractLeadFromLinkedIn function)
const providerConfig = functions.config()[provider?.toLowerCase() || 'lusha'];

// Or using secrets (recommended approach):
const { defineSecret } = require('firebase-functions/params');
const lushaApiKey = defineSecret('LUSHA_API_KEY');

// Then in your function:
export const extractLeadFromLinkedIn = functions
  .runWith({ secrets: [lushaApiKey] })
  .https.onCall(async (data, context) => {
    const apiKey = lushaApiKey.value();
    // Use apiKey in your API calls
  });
```

**Note**: The current implementation uses `functions.config()`. For production, migrate to Firebase Secrets Manager.

### Step 4: Deploy Functions

After configuring the API keys, deploy the functions:

```bash
cd functions
npm install  # Install any missing dependencies
cd ..
firebase deploy --only functions
```

### Step 5: Test the Integration

1. Go to the Contacts page in your application
2. Click the "Extract from LinkedIn" button
3. Enter a LinkedIn profile URL (e.g., `https://www.linkedin.com/in/username`)
4. Select your preferred provider
5. Click "Extract Lead"
6. Review the extracted data and import to contacts if desired

## Usage Guide

### Single Lead Extraction

1. Navigate to **Contacts** page
2. Click **"Extract from LinkedIn"** button
3. Select extraction mode: **Single Profile**
4. Choose data provider (Lusha, Apollo, or Hunter)
5. Enter LinkedIn profile URL
6. Click **"Extract Lead"**
7. Review extracted information
8. Click **"Import to Contacts"** to add to CRM

### Bulk Lead Extraction

1. Navigate to **Contacts** page
2. Click **"Extract from LinkedIn"** button
3. Select extraction mode: **Bulk Extraction**
4. Choose data provider
5. Add multiple LinkedIn URLs (one per line or click "Add" after each)
6. Click **"Extract [X] Lead(s)"**
7. Wait for extraction to complete (may take several minutes)
8. Select leads to import using checkboxes
9. Click **"Import Selected"** to add selected leads to CRM

### Enrich Existing Contacts

The enrichment feature allows you to enhance existing contacts with additional data:

- **By Email**: Find additional information using an email address
- **By Name + Company**: Find contact information using first name, last name, and company

**Note**: Contact enrichment UI is coming in a future update. Currently available via Firebase Functions.

## API Rate Limits

Each provider has different rate limits:

- **Lusha**: Varies by plan (typically 200-2000 requests/month)
- **Apollo.io**: 50-500 requests/day depending on plan
- **Hunter.io**: 25 requests/month (free), 500-10,000/month (paid)

The bulk extraction feature includes rate limiting (2-second delay between batches of 5) to respect API limits.

## Troubleshooting

### "API key is not configured" Error

**Solution**: Ensure you've set the API key in Firebase Functions config:
```bash
firebase functions:config:get
```

If the config is empty, set it:
```bash
firebase functions:config:set lusha.api_key="YOUR_KEY"
firebase deploy --only functions
```

### "Failed to extract lead" Error

**Possible causes**:
1. Invalid LinkedIn URL format
2. API key is incorrect or expired
3. Rate limit exceeded
4. Profile doesn't exist or is private

**Solutions**:
- Verify LinkedIn URL format: `https://www.linkedin.com/in/username`
- Check API key is correct
- Check your API usage limits
- Try a different provider

### "Invalid LinkedIn URL format" Error

**Solution**: Ensure the URL follows this format:
- Correct: `https://www.linkedin.com/in/username`
- Correct: `https://linkedin.com/in/username`
- Incorrect: `linkedin.com/in/username` (missing https://)
- Incorrect: `https://linkedin.com/profile/view?id=123` (unsupported format)

### No Data Extracted

**Possible causes**:
1. Profile has no public contact information
2. Provider doesn't have data for this person
3. Profile is private or restricted

**Solutions**:
- Try a different provider
- Verify the profile is public
- Some contacts may not have extractable data (emails/phones) available

## Cost Considerations

- **Free tiers**: All providers offer free tiers with limited requests
- **Paid plans**: Consider your extraction volume when choosing a plan
- **Bulk extraction**: Use bulk extraction judiciously to avoid exceeding limits
- **Cost tracking**: Monitor your API usage through provider dashboards

## Best Practices

1. **Start with free tiers** to test functionality
2. **Use bulk extraction sparingly** to avoid rate limits
3. **Verify extracted data** before importing to contacts
4. **Choose provider based on needs**:
   - Lusha: Best for direct LinkedIn extraction
   - Apollo: Best for B2B database enrichment
   - Hunter: Best for email finding and verification
5. **Monitor API usage** to stay within limits
6. **Respect data privacy** and use extracted data responsibly

## Data Privacy & Compliance

- **GDPR Compliance**: Ensure you have permission to store and use extracted contact data
- **CAN-SPAM Act**: Only send emails to contacts who have opted in
- **Provider Terms**: Review and comply with each provider's terms of service
- **Data Retention**: Consider implementing data retention policies for extracted leads

## Future Enhancements

Planned features:
- Contact enrichment UI
- Extraction history and analytics
- Automatic lead scoring based on extraction data
- Integration with more providers (ZoomInfo, Clearbit, etc.)
- CSV export of extracted leads
- Scheduled bulk extractions

## Support

For issues or questions:
1. Check this documentation
2. Review provider API documentation
3. Check Firebase Functions logs: `firebase functions:log`
4. Verify API keys are configured correctly

## Example LinkedIn URLs

Valid LinkedIn profile URLs:
- `https://www.linkedin.com/in/john-doe`
- `https://www.linkedin.com/in/johndoe123`
- `https://linkedin.com/in/jane-smith`
- `https://www.linkedin.com/in/david-jones-abc123/`

Invalid URLs (will fail):
- `linkedin.com/in/username` (missing protocol)
- `https://www.linkedin.com/profile/view?id=123` (not a profile URL)
- `https://www.linkedin.com/company/companyname` (company page, not person)

---

**Note**: This feature uses legitimate APIs from data providers. Scraping LinkedIn directly is against LinkedIn's Terms of Service and is not implemented in this feature.

