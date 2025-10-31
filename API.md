# AI-Powered CRM - API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your_access_token>
```

---

## Authentication Endpoints

### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "sales_rep"
  }
}
```

### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

### Logout

```http
POST /auth/logout
Authorization: Bearer <token>
```

### Get Current User

```http
GET /auth/me
Authorization: Bearer <token>
```

---

## Contacts Endpoints

### Get All Contacts

```http
GET /contacts?status=qualified&search=john
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional): Filter by contact status
- `search` (optional): Search by name, email, or company
- `tags` (optional): Filter by tags
- `ownerId` (optional): Filter by owner

**Response:**
```json
[
  {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "company": "Acme Corp",
    "jobTitle": "CEO",
    "status": "qualified",
    "leadScore": 85,
    "tags": ["vip", "enterprise"],
    "owner": {
      "id": "uuid",
      "firstName": "Jane",
      "lastName": "Smith"
    },
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### Create Contact

```http
POST /contacts
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "company": "Acme Corp",
  "jobTitle": "CEO",
  "status": "new",
  "tags": ["vip"],
  "source": "Website Form"
}
```

### Get Contact by ID

```http
GET /contacts/:id
Authorization: Bearer <token>
```

### Update Contact

```http
PATCH /contacts/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "qualified",
  "notes": "Very interested in enterprise plan"
}
```

### Delete Contact

```http
DELETE /contacts/:id
Authorization: Bearer <token>
```

### Bulk Delete Contacts

```http
POST /contacts/bulk-delete
Authorization: Bearer <token>
Content-Type: application/json

{
  "ids": ["uuid1", "uuid2", "uuid3"]
}
```

### Import Contacts (CSV)

```http
POST /contacts/import
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <csv_file>
```

**Response:**
```json
{
  "imported": 150,
  "errors": [
    {
      "record": { "email": "invalid@" },
      "error": "Invalid email format"
    }
  ]
}
```

### Export Contacts (CSV)

```http
GET /contacts/export
Authorization: Bearer <token>
```

Returns CSV file download.

### Update Lead Score

```http
PATCH /contacts/:id/lead-score
Authorization: Bearer <token>
Content-Type: application/json

{
  "score": 90
}
```

### Add Tags

```http
POST /contacts/:id/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tags": ["hot-lead", "decision-maker"]
}
```

### Remove Tags

```http
DELETE /contacts/:id/tags
Authorization: Bearer <token>
Content-Type: application/json

{
  "tags": ["cold-lead"]
}
```

---

## Segments Endpoints

### Get All Segments

```http
GET /contacts/segments/all
Authorization: Bearer <token>
```

### Create Segment

```http
POST /contacts/segments
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "High-value Leads",
  "description": "Contacts with lead score > 80",
  "rules": {
    "conditions": [
      {
        "field": "leadScore",
        "operator": "greaterThan",
        "value": 80
      },
      {
        "field": "status",
        "operator": "in",
        "value": ["qualified", "negotiating"]
      }
    ],
    "logic": "AND"
  }
}
```

### Get Segment Contacts

```http
GET /contacts/segments/:id/contacts
Authorization: Bearer <token>
```

---

## Campaigns Endpoints

### Get All Campaigns

```http
GET /campaigns
Authorization: Bearer <token>
```

### Create Campaign

```http
POST /campaigns
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Summer Sale 2024",
  "description": "Promotional campaign",
  "type": "email",
  "subject": "50% Off Summer Sale!",
  "content": "Hi {{firstName}}, check out our amazing deals!",
  "htmlContent": "<html>...</html>",
  "segmentId": "uuid",
  "scheduledAt": "2024-06-01T10:00:00Z"
}
```

**Campaign Types:**
- `email`: Email campaign
- `sms`: SMS campaign

**Available Variables:**
- `{{firstName}}`, `{{lastName}}`, `{{fullName}}`
- `{{email}}`, `{{company}}`, `{{jobTitle}}`

### Send Campaign

```http
POST /campaigns/:id/send
Authorization: Bearer <token>
```

### Pause Campaign

```http
POST /campaigns/:id/pause
Authorization: Bearer <token>
```

### Get Campaign Stats

```http
GET /campaigns/:id/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalRecipients": 1000,
  "sent": 950,
  "delivered": 920,
  "failed": 30,
  "opened": 450,
  "clicked": 120,
  "unsubscribed": 5,
  "openRate": 47.4,
  "clickRate": 12.6,
  "deliveryRate": 96.8
}
```

---

## Telephony Endpoints

### Get All Calls

```http
GET /telephony/calls
Authorization: Bearer <token>
```

### Initiate Call

```http
POST /telephony/calls
Authorization: Bearer <token>
Content-Type: application/json

{
  "toNumber": "+1234567890",
  "contactId": "uuid",
  "direction": "outbound"
}
```

### Update Call

```http
PATCH /telephony/calls/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "disposition": "interested",
  "notes": "Follow up next week",
  "duration": 300
}
```

**Disposition Options:**
- `interested`, `not-interested`, `callback-requested`
- `left-voicemail`, `wrong-number`, `do-not-call`
- `follow-up-needed`, `deal-closed`

### Get Call Stats

```http
GET /telephony/calls/stats
Authorization: Bearer <token>
```

---

## AI Endpoints

### Calculate Lead Score

```http
POST /ai/lead-score/:contactId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "contactId": "uuid",
  "score": 85
}
```

### Generate Email Content

```http
POST /ai/generate-email
Authorization: Bearer <token>
Content-Type: application/json

{
  "purpose": "Follow up after demo",
  "tone": "professional",
  "contactName": "John Doe",
  "companyName": "Acme Corp",
  "context": "They showed interest in enterprise features"
}
```

**Response:**
```json
{
  "subject": "Following Up on Your Acme Corp Demo",
  "body": "Hi John,\n\nThank you for taking the time..."
}
```

### Generate SMS Content

```http
POST /ai/generate-sms
Authorization: Bearer <token>
Content-Type: application/json

{
  "purpose": "Reminder for meeting",
  "contactName": "John",
  "maxLength": 160
}
```

### Summarize Call

```http
POST /ai/summarize-call/:callId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "summary": "Customer expressed interest in enterprise plan. Discussed pricing and implementation timeline.",
  "keyPoints": [
    "Interested in enterprise features",
    "Budget approved for Q2",
    "Needs integration with Salesforce"
  ],
  "sentiment": {
    "score": 85,
    "label": "positive"
  },
  "actionItems": [
    "Send enterprise pricing proposal",
    "Schedule technical demo"
  ],
  "nextSteps": [
    "Follow up with proposal by Friday",
    "Connect with technical team"
  ]
}
```

### Analyze Sentiment

```http
POST /ai/analyze-sentiment
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "I'm really impressed with your product..."
}
```

### Get Follow-up Recommendations

```http
GET /ai/follow-up-recommendations/:contactId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "recommendations": [
    "Send personalized follow-up email within 24 hours",
    "Share case study relevant to their industry",
    "Schedule product demo"
  ],
  "priority": "high",
  "bestContactTime": "morning"
}
```

### Generate Content Variations

```http
POST /ai/generate-variations
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Don't miss our 50% off sale!",
  "numVariations": 3
}
```

---

## Analytics Endpoints

### Get Dashboard Stats

```http
GET /analytics/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "contacts": {
    "total": 5000,
    "newThisMonth": 250,
    "avgLeadScore": 65,
    "byStatus": [
      { "status": "new", "count": 1200 },
      { "status": "qualified", "count": 800 }
    ]
  },
  "campaigns": {
    "total": 50,
    "totalSent": 45000,
    "openRate": 32.5,
    "clickThroughRate": 8.2
  },
  "calls": {
    "total": 1500,
    "completed": 1200,
    "avgDuration": 245
  }
}
```

### Get Contact Trends

```http
GET /analytics/contact-trends?days=30
Authorization: Bearer <token>
```

### Get Campaign Performance

```http
GET /analytics/campaign-performance?campaignId=uuid
Authorization: Bearer <token>
```

### Get Lead Sources

```http
GET /analytics/lead-sources
Authorization: Bearer <token>
```

### Get User Performance

```http
GET /analytics/user-performance
Authorization: Bearer <token>
```

### Get Conversion Funnel

```http
GET /analytics/conversion-funnel
Authorization: Bearer <token>
```

---

## Error Responses

All errors follow this format:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "error": "Bad Request"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

---

## Rate Limiting

- **Default**: 100 requests per minute per IP
- **Authenticated**: 1000 requests per hour per user

Headers included in rate-limited responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
```

---

## Webhooks

### Twilio Call Status Webhook

```http
POST /telephony/callback/:callId
Content-Type: application/x-www-form-urlencoded

CallStatus=completed&CallDuration=300
```

### Twilio Recording Webhook

```http
POST /telephony/recording/:callId
Content-Type: application/x-www-form-urlencoded

RecordingSid=RExxxx&RecordingUrl=https://...
```

---

## Interactive API Documentation

For interactive API testing, visit:

```
http://localhost:3000/api/docs
```

This Swagger UI allows you to:
- Browse all endpoints
- Test API calls directly
- View request/response schemas
- Generate code samples

---

## SDK & Client Libraries

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const client = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

// Get contacts
const contacts = await client.get('/contacts');

// Create contact
const newContact = await client.post('/contacts', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com'
});
```

### Python

```python
import requests

BASE_URL = 'http://localhost:3000/api'
headers = {'Authorization': f'Bearer {access_token}'}

# Get contacts
response = requests.get(f'{BASE_URL}/contacts', headers=headers)
contacts = response.json()

# Create contact
new_contact = requests.post(
    f'{BASE_URL}/contacts',
    headers=headers,
    json={
        'firstName': 'John',
        'lastName': 'Doe',
        'email': 'john@example.com'
    }
)
```

---

## Best Practices

1. **Always use HTTPS** in production
2. **Store tokens securely** - never in localStorage for sensitive apps
3. **Implement token refresh** before expiration
4. **Handle rate limits** gracefully with exponential backoff
5. **Validate input** on client side before API calls
6. **Use pagination** for large datasets
7. **Cache responses** where appropriate
8. **Monitor API usage** and set up alerts

---

## Support

For API issues or questions:
- GitHub: [Repository Issues](https://github.com/your-repo/issues)
- Email: api-support@aicrm.com
- Slack: [Join Community](https://slack.aicrm.com)

