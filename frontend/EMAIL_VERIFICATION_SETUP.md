# Email Verification API Setup Guide

This guide explains how to set up real-time email verification using third-party APIs.

## Available APIs

### 1. Cloudmersive (Recommended - Free Tier: 800/month) ✅
- **Best for**: Production use, high volume
- **Free Tier**: **800 API calls/month** (confirmed free tier)
- **Accuracy**: Very high (90%+)
- **Features**: Disposable email detection, role-based email detection, SMTP validation
- **Website**: https://www.cloudmersive.com/

**Setup:**
1. Visit: https://portal.cloudmersive.com/signup
2. Sign up for a **free account** (no credit card required)
3. Access your dashboard and copy your API key
4. Add to your `.env` file: `VITE_CLOUDMERSIVE_API_KEY=your_api_key_here`

### 2. Abstract API (Free Tier: Up to 3,000/month) ✅
- **Best for**: Development, medium volume
- **Free Tier**: **3,000 requests/month** (confirmed free tier)
- **Accuracy**: High (85%+)
- **Features**: Disposable email detection, role detection, autocorrect suggestions
- **Website**: https://www.abstractapi.com/

**Setup:**
1. Visit: https://www.abstractapi.com/api/email-validation
2. Sign up for a **free account** (no credit card required)
3. Navigate to the Email Validation API section
4. Copy your API key from the dashboard
5. Add to your `.env` file: `VITE_ABSTRACT_API_KEY=your_api_key_here`

**Note**: The limit shows as 3,000 for their email API - this may vary, check their dashboard for exact limits.

### 3. Emailable (Paid)
- **Best for**: Professional use
- **Starting Price**: $10/month for 2,000 verifications
- **Accuracy**: Very high (95%+)
- **Features**: Real-time verification, risk scoring, mailbox full detection

**Setup:**
1. Visit: https://emailable.com/
2. Sign up and subscribe to a plan
3. Get your API key from settings
4. Use in code by passing `apiKey` and `provider: 'emailable'`

### 4. Email Verifier API (Paid)
- **Best for**: Enterprise use
- **Accuracy**: Excellent (98%+)
- **Features**: Batch verification, detailed reports

**Setup:**
1. Visit: https://www.emailverifierapi.com/
2. Sign up and subscribe
3. Get your API key
4. Use in code by passing `apiKey` and `provider: 'emailverifier'`

## How It Works

1. **Basic Validation First**: Every email is first checked for basic format (syntax, length, common typos)
2. **API Verification**: If an API key is configured, the email is then verified with the API
3. **Fallback**: If the API fails or returns unclear results, the system falls back to basic validation

## Configuration

### Environment Variables

Add to your `.env` file in the frontend directory:

```env
# Recommended: Cloudmersive (800 free verifications/month)
VITE_CLOUDMERSIVE_API_KEY=your_cloudmersive_api_key_here

# Or use Abstract API (100 free verifications/month)
VITE_ABSTRACT_API_KEY=your_abstract_api_key_here
```

### Priority Order

The system uses APIs in this order:
1. Cloudmersive (if `VITE_CLOUDMERSIVE_API_KEY` is set)
2. Abstract API (if `VITE_ABSTRACT_API_KEY` is set)
3. Basic validation (always available as fallback)

## Usage

### Automatic (Default Behavior)

The email validator automatically uses the configured API when creating or updating contacts:

```typescript
// In crm-api.ts - Already implemented
const validation = await validateContactEmail(email, { showToast: true });
```

### Manual Usage

You can also use the validator manually in your code:

```typescript
import { validateContactEmail } from '../utils/emailValidator';

// Basic usage
const result = await validateContactEmail('user@example.com');

// With options
const result = await validateContactEmail('user@example.com', {
  showToast: true,
  useAPI: true,
  allowInvalid: false
});

if (result.shouldProceed) {
  // Email is valid, proceed with saving
  console.log(`Email verified with score: ${result.validation.score}`);
  console.log(`Provider: ${result.validation.provider}`);
} else {
  // Email is invalid
  console.log(`Validation failed: ${result.validation.reason}`);
}
```

### Bulk Validation

Validate multiple emails at once:

```typescript
import { bulkValidateEmails, getEmailValidationStats } from '../utils/emailValidator';

const emails = ['user1@example.com', 'user2@example.com', 'invalid-email'];
const results = await bulkValidateEmails(emails);

// Get statistics
const stats = await getEmailValidationStats(emails);
console.log(stats);
// Output:
// {
//   total: 3,
//   valid: 2,
//   invalid: 1,
//   validityRate: '66.7%',
//   averageScore: '70.0',
//   invalidEmails: [{ email: 'invalid-email', reason: 'Invalid format' }]
// }
```

## What Gets Stored

When an email is validated, the following information is stored in the contact record:

- `emailValidated`: Boolean indicating if email is valid
- `emailValidationScore`: Score from 0-100 indicating confidence
- `emailValidationReason`: Reason for validation result
- Additional details stored in validation object:
  - `isDisposable`: Whether email is from a disposable email service
  - `isRole`: Whether email is role-based (info@, support@, etc.)
  - `isDeliverable`: Whether SMTP server accepts the email

## Testing

To test the email validation:

1. Create a new contact with a valid email
2. Create a contact with an invalid email (e.g., "test@test")
3. Create a contact with a disposable email (e.g., "test@tempmail.com")
4. Check the console logs to see the validation results

## API Limits

### Free Tiers ✅ Confirmed
- **Cloudmersive**: **800 API calls/month** (confirmed)
- **Abstract API**: **Up to 3,000 requests/month** (confirmed, exact limit may vary)

### Important Notes
1. **No credit card required** for free tiers on either service
2. **Automatic fallback** to basic validation when limits are reached
3. Free tier limits reset monthly
4. You can monitor usage in each service's dashboard

### Exceeding Limits

When API limits are exceeded:
1. The API will return an error (often HTTP 429 - Too Many Requests)
2. The system **automatically falls back** to basic validation
3. Basic validation still provides:
   - Format checking
   - Common typo detection (gmial.com → gmail.com)
   - Suspicious pattern detection
   - Length validation
4. Your application continues to work normally

## Production Recommendations

For production use with **free tiers**:
1. **Start with Cloudmersive** - Best choice for most users
   - 800 free verifications/month
   - High accuracy
   - Professional-grade validation
   
2. **Use Abstract API as backup** - If you need more capacity
   - Up to 3,000 requests/month
   - Good for bulk imports
   
3. **Monitor usage** through each service's dashboard
   - Set up usage alerts
   - Track monthly consumption
   
4. **Consider caching** validation results
   - Save API calls by not re-validating the same email
   - Cache for 30 days for valid emails
   
5. **Upgrade to paid plans** only if you exceed free limits
   - Cloudmersive: Plans start at reasonable rates
   - Most small/medium businesses stay within free tier limits

## Troubleshooting

### API not working
- Check that your API key is correctly set in `.env`
- Verify the API key is active in the provider's dashboard
- Check browser console for error messages
- System will automatically fall back to basic validation

### False positives/negatives
- All email verification APIs have some margin of error
- Disposable email services are constantly changing
- Use the confidence score to make decisions
- Consider manual review for critical contacts

## Security Notes

- Never commit `.env` file with API keys to version control
- API keys should be kept secure and rotated regularly
- All API calls are made from the client (browser)
- Consider rate limiting for production use

## Support

For issues with:
- **Cloudmersive**: https://www.cloudmersive.com/support
- **Abstract API**: https://www.abstractapi.com/support
- **Integration**: Check the console logs for detailed error messages

