# AI-Powered CRM - Architecture Documentation

## System Overview

The AI-Powered CRM is built as a modern, scalable web application using a microservices-inspired architecture with clear separation between frontend and backend.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │ Contacts │  │Campaigns │  │   Calls  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                    Redux Store + Material-UI                 │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API / WebSocket
┌────────────────────────┴────────────────────────────────────┐
│                     Backend (NestJS)                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Auth   │  │ Contacts │  │Campaigns │  │Telephony │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│  ┌──────────┐  ┌──────────┐                                 │
│  │    AI    │  │Analytics │                                 │
│  └──────────┘  └──────────┘                                 │
└─────────┬──────────────┬──────────────┬────────────────────┘
          │              │              │
┌─────────┴─────┐ ┌─────┴──────┐ ┌────┴─────────┐
│  PostgreSQL   │ │   Redis    │ │  Bull Queue  │
└───────────────┘ └────────────┘ └──────────────┘
          │              │
┌─────────┴──────────────┴──────────────┐
│        External Services               │
│  ┌──────────┐  ┌──────────┐          │
│  │  Twilio  │  │ SendGrid │          │
│  └──────────┘  └──────────┘          │
│  ┌──────────┐  ┌──────────┐          │
│  │  OpenAI  │  │  AWS S3  │          │
│  └──────────┘  └──────────┘          │
└───────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Library**: Material-UI (MUI) v5
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Build Tool**: Vite

### Backend

- **Framework**: NestJS (Node.js + TypeScript)
- **ORM**: TypeORM
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+
- **Queue**: Bull (Redis-based)
- **Authentication**: JWT + Passport
- **API Documentation**: Swagger/OpenAPI
- **Validation**: class-validator

### External Services

- **Email**: SendGrid / AWS SES
- **SMS/Voice**: Twilio
- **AI**: OpenAI GPT-4 / Anthropic Claude
- **Storage**: AWS S3 (for recordings/attachments)
- **Monitoring**: (To be added)

## Backend Architecture

### Module Structure

```
backend/src/
├── auth/                 # Authentication & authorization
│   ├── guards/          # JWT and role guards
│   ├── strategies/      # Passport strategies
│   └── decorators/      # Custom decorators
├── users/               # User management
│   ├── entities/        # User entity
│   ├── dto/             # Data transfer objects
│   └── users.service.ts
├── contacts/            # Contact management
│   ├── entities/        # Contact & Segment entities
│   ├── dto/
│   └── contacts.service.ts
├── campaigns/           # Campaign management
│   ├── entities/        # Campaign & Message entities
│   ├── services/        # Email & SMS services
│   ├── processors/      # Bull queue processors
│   └── campaigns.service.ts
├── telephony/           # Call management
│   ├── entities/        # Call entity
│   └── telephony.service.ts
├── ai/                  # AI services
│   └── ai.service.ts    # OpenAI integration
├── analytics/           # Analytics & reporting
│   └── analytics.service.ts
└── common/              # Shared utilities
    ├── services/        # Encryption, file handling
    └── filters/         # Exception filters
```

### Database Schema

#### Core Tables

**users**
- id (UUID, PK)
- email (unique)
- password (hashed)
- firstName, lastName
- role (enum: admin, manager, sales_rep, support, viewer)
- status (enum: active, inactive, suspended)
- permissions (jsonb)
- lastLoginAt, createdAt, updatedAt

**contacts**
- id (UUID, PK)
- firstName, lastName, email, phone
- company, jobTitle, website
- address, city, state, country, zipCode
- status (enum: new, contacted, qualified, negotiating, converted, lost)
- leadScore (decimal)
- customFields (jsonb)
- tags (array)
- ownerId (FK to users)
- engagement metrics (emailsOpened, linksClicked, callsReceived)
- timestamps

**segments**
- id (UUID, PK)
- name, description
- rules (jsonb) - segmentation conditions
- isActive (boolean)
- createdById (FK to users)
- contactCount
- timestamps

**campaigns**
- id (UUID, PK)
- name, description
- type (enum: email, sms)
- status (enum: draft, scheduled, sending, sent, paused, cancelled)
- subject, content, htmlContent
- recipientContactIds (jsonb)
- segmentId (FK to segments)
- scheduledAt, sentAt
- metrics (sentCount, openedCount, clickedCount, deliveredCount)
- createdById (FK to users)
- timestamps

**messages**
- id (UUID, PK)
- campaignId (FK to campaigns)
- contactId (FK to contacts)
- recipientEmail, recipientPhone
- subject, content
- status (enum: pending, sent, delivered, failed, opened, clicked)
- externalId (Twilio SID / SendGrid ID)
- sentAt, deliveredAt, openedAt
- timestamps

**calls**
- id (UUID, PK)
- direction (enum: inbound, outbound)
- status (enum: initiated, ringing, in-progress, completed, failed)
- contactId (FK to contacts)
- userId (FK to users)
- fromNumber, toNumber
- externalCallSid (Twilio SID)
- duration (seconds)
- startedAt, endedAt
- disposition (enum: interested, not-interested, callback, etc.)
- notes, recordingUrl, transcription, aiSummary
- sentiment (jsonb)
- timestamps

### API Endpoints

#### Authentication
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- GET /api/auth/me

#### Contacts
- GET /api/contacts
- POST /api/contacts
- GET /api/contacts/:id
- PATCH /api/contacts/:id
- DELETE /api/contacts/:id
- POST /api/contacts/import
- GET /api/contacts/export
- POST /api/contacts/bulk-delete
- POST /api/contacts/:id/tags
- DELETE /api/contacts/:id/tags

#### Segments
- GET /api/contacts/segments/all
- POST /api/contacts/segments
- GET /api/contacts/segments/:id
- GET /api/contacts/segments/:id/contacts
- DELETE /api/contacts/segments/:id

#### Campaigns
- GET /api/campaigns
- POST /api/campaigns
- GET /api/campaigns/:id
- POST /api/campaigns/:id/send
- POST /api/campaigns/:id/pause
- POST /api/campaigns/:id/cancel
- GET /api/campaigns/:id/stats
- DELETE /api/campaigns/:id

#### Telephony
- GET /api/telephony/calls
- POST /api/telephony/calls
- GET /api/telephony/calls/:id
- PATCH /api/telephony/calls/:id
- GET /api/telephony/calls/stats
- POST /api/telephony/callback/:callId (webhook)
- POST /api/telephony/recording/:callId (webhook)

#### AI
- POST /api/ai/lead-score/:contactId
- POST /api/ai/generate-email
- POST /api/ai/generate-sms
- POST /api/ai/summarize-call/:callId
- POST /api/ai/analyze-sentiment
- GET /api/ai/follow-up-recommendations/:contactId
- POST /api/ai/generate-variations

#### Analytics
- GET /api/analytics/dashboard
- GET /api/analytics/contact-trends
- GET /api/analytics/campaign-performance
- GET /api/analytics/lead-sources
- GET /api/analytics/user-performance
- GET /api/analytics/conversion-funnel

## Frontend Architecture

### Component Structure

```
frontend/src/
├── components/          # Reusable components
│   ├── Layout.tsx       # Main layout with sidebar
│   ├── forms/           # Form components
│   ├── tables/          # Table components
│   └── charts/          # Chart components
├── pages/               # Page components
│   ├── Auth/           # Login, Register
│   ├── Dashboard/      # Main dashboard
│   ├── Contacts/       # Contact management
│   ├── Campaigns/      # Campaign management
│   ├── Calls/          # Call management
│   ├── Analytics/      # Analytics & reports
│   └── Settings/       # Settings
├── store/              # Redux store
│   ├── index.ts        # Store configuration
│   └── slices/         # Redux slices
├── services/           # API services
│   └── api.ts          # Axios instance & API calls
└── theme.ts            # MUI theme configuration
```

### State Management

Redux Toolkit is used for global state management with the following slices:

- **auth**: Authentication state (user, tokens)
- **contacts**: Contact list and selected contact
- **campaigns**: Campaign list and selected campaign
- **calls**: Call history and active calls
- **analytics**: Dashboard statistics

### Routing

React Router v6 is used with protected routes. Unauthenticated users are redirected to `/login`.

## Security Architecture

### Authentication & Authorization

- **JWT Tokens**: Access token (7 days) + Refresh token (30 days)
- **Password Hashing**: bcrypt with salt rounds
- **Role-Based Access Control (RBAC)**: 5 roles with granular permissions
- **API Security**: All endpoints protected with JWT guards

### Data Protection

- **Encryption**: AES-256-GCM for sensitive data
- **HTTPS Only**: TLS 1.2+ in production
- **CORS**: Configured for allowed origins
- **Rate Limiting**: Prevents brute force attacks
- **Input Validation**: class-validator on all DTOs
- **SQL Injection Prevention**: TypeORM parameterized queries

### GDPR Compliance

- Data encryption at rest and in transit
- Right to be forgotten (contact deletion)
- Data export functionality
- Audit logging
- Consent management for marketing
- Do-not-contact lists

## Scalability Considerations

### Horizontal Scaling

- Stateless API servers
- Redis for shared sessions
- Bull queues for async processing
- Database connection pooling

### Performance Optimization

- Redis caching for frequently accessed data
- Database indexing on foreign keys and search fields
- Pagination on all list endpoints
- Lazy loading in frontend
- CDN for static assets

### Queue Processing

Bull queues handle:
- Campaign sending (batch processing)
- Email/SMS delivery
- AI processing (transcription, summarization)
- Data imports/exports
- Scheduled tasks

## Monitoring & Logging

(To be implemented)

- Application logs (Winston/Pino)
- Error tracking (Sentry)
- Performance monitoring (New Relic / DataDog)
- Uptime monitoring
- Database query performance

## Future Enhancements

1. **Real-time Features**: WebSocket for live updates
2. **Mobile Apps**: React Native applications
3. **Advanced AI**: Custom ML models for lead scoring
4. **Integrations**: Zapier, Salesforce, HubSpot
5. **Multi-tenancy**: SaaS version with org isolation
6. **Workflow Automation**: Visual workflow builder
7. **Advanced Reporting**: Custom report builder
8. **Video Calling**: WebRTC integration

