# AI-Powered CRM Platform

A comprehensive AI-driven CRM system that integrates contact management, bulk messaging (email/SMS), telephony, and intelligent automation.

## 🎯 Features

- **Contact Management**: Full CRUD operations, import/export, segmentation
- **Bulk Campaigns**: Email and SMS campaigns with personalization
- **Telephony**: Click-to-call, call logging, recording, and disposition notes
- **AI Intelligence**: Lead scoring, follow-up recommendations, conversation summarization
- **Analytics**: Campaign performance, contact engagement, conversion tracking
- **Security**: GDPR-compliant, encrypted storage, role-based access control

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **UI Library**: Material-UI / Tailwind CSS
- **State Management**: Redux Toolkit + RTK Query
- **Charts**: Recharts / Chart.js

### Backend
- **Framework**: NestJS (Node.js + TypeScript)
- **Database**: PostgreSQL + TypeORM
- **Cache**: Redis
- **Authentication**: JWT + Passport

### Integrations
- **Email**: SendGrid / AWS SES
- **SMS/Voice**: Twilio
- **AI**: OpenAI API / Anthropic Claude
- **Storage**: AWS S3 (recordings, attachments)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- npm or yarn

### Installation

```bash
# Install dependencies for all workspaces
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Run database migrations
cd backend && npm run migration:run

# Start development servers
npm run dev
```

### Environment Variables

#### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/aicrm
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
SENDGRID_API_KEY=your-sendgrid-key
OPENAI_API_KEY=your-openai-key
```

#### Frontend (.env)
```
VITE_API_URL=http://localhost:3000
```

## 📁 Project Structure

```
ai-crm-platform/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Page components
│   │   ├── features/        # Feature-based modules
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API services
│   │   ├── store/           # Redux store
│   │   └── utils/           # Utility functions
│   └── package.json
├── backend/                 # NestJS application
│   ├── src/
│   │   ├── contacts/        # Contacts module
│   │   ├── campaigns/       # Campaigns module
│   │   ├── telephony/       # Telephony module
│   │   ├── ai/              # AI services module
│   │   ├── auth/            # Authentication module
│   │   ├── users/           # Users module
│   │   └── common/          # Shared utilities
│   └── package.json
└── package.json             # Root package.json

```

## 🗄️ Database Schema

### Core Tables
- `users` - User accounts with RBAC
- `contacts` - Contact information and metadata
- `segments` - Contact segmentation rules
- `campaigns` - Email/SMS campaign definitions
- `messages` - Individual messages sent
- `calls` - Call logs and recordings
- `call_dispositions` - Call outcome notes
- `lead_scores` - AI-generated lead scores
- `activities` - Activity timeline
- `tags` - Flexible tagging system

## 🤖 AI Capabilities

1. **Lead Scoring**: ML-based scoring using engagement history
2. **Message Generation**: LLM-powered email/SMS templates
3. **Call Summarization**: Speech-to-text + summarization
4. **Sentiment Analysis**: Real-time sentiment tracking
5. **Smart Follow-ups**: AI-recommended next actions

## 📊 Success Metrics

- 25% faster follow-ups using AI prompts
- 10–20% uplift in lead conversion
- 99.9% uptime for communication workflows

## 🔒 Security & Compliance

- GDPR-compliant data handling
- AES-256 encryption for sensitive data
- Role-based access control (RBAC)
- Audit logging for all actions
- Regular security audits

## 📈 Development Roadmap

- [x] Month 1-2: Core CRM (contacts, auth, imports)
- [ ] Month 3: Campaign module (email/SMS)
- [ ] Month 4: Telephony integration & call logging
- [ ] Month 5: AI layer (lead scoring, summarization)

## 🧪 Testing

```bash
# Backend tests
cd backend && npm run test

# Frontend tests
cd frontend && npm run test

# E2E tests
npm run test:e2e
```

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please read CONTRIBUTING.md for guidelines.

## 📞 Support

For support, email support@aicrm.com or open an issue on GitHub.

