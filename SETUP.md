# AI-Powered CRM - Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm
- **PostgreSQL** 14+
- **Redis** 7+
- **Git**

## Step 1: Clone and Install Dependencies

```bash
# Clone the repository (or if you're already in the directory)
cd bulkemail

# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
```

## Step 2: Database Setup

### PostgreSQL

1. Create a new PostgreSQL database:

```bash
createdb aicrm
```

2. Or using psql:

```sql
CREATE DATABASE aicrm;
```

### Redis

Make sure Redis is running:

```bash
# On macOS (using Homebrew)
brew services start redis

# On Linux
sudo systemctl start redis

# On Windows (using WSL or native)
redis-server
```

## Step 3: Environment Configuration

### Backend Environment

1. Copy the example environment file:

```bash
cd backend
cp .env.example .env
```

2. Edit `backend/.env` and configure the following:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=your_postgres_username
DATABASE_PASSWORD=your_postgres_password
DATABASE_NAME=aicrm

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-very-secure-random-secret-key-here

# Twilio (for SMS/Voice)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# SendGrid (for Email)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourcompany.com
SENDGRID_FROM_NAME=Your Company Name

# OpenAI (for AI Features)
OPENAI_API_KEY=your-openai-api-key

# Encryption
ENCRYPTION_KEY=your-encryption-key-32-characters
```

### Frontend Environment

1. Copy the example environment file:

```bash
cd ../frontend
cp .env.example .env
```

2. Edit `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

## Step 4: External Services Setup

### Twilio Setup

1. Sign up at [https://www.twilio.com](https://www.twilio.com)
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number for SMS/Voice
4. Add credentials to backend `.env`

### SendGrid Setup

1. Sign up at [https://sendgrid.com](https://sendgrid.com)
2. Create an API key with full access
3. Verify your sender email
4. Add credentials to backend `.env`

### OpenAI Setup

1. Sign up at [https://platform.openai.com](https://platform.openai.com)
2. Generate an API key
3. Add to backend `.env`

## Step 5: Database Migration

Run the database migrations to create tables:

```bash
cd backend
npm run typeorm migration:run
```

Or if you're in development mode, the app will sync automatically.

## Step 6: Start the Application

### Development Mode

Open two terminal windows/tabs:

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

The backend will start on `http://localhost:3000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Using Root Command (Concurrent)

From the project root:

```bash
npm run dev
```

This will start both frontend and backend concurrently.

## Step 7: Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. Register a new account
3. Log in and start using the CRM

## API Documentation

Once the backend is running, you can access the Swagger API documentation at:

`http://localhost:3000/api/docs`

## Troubleshooting

### Database Connection Issues

- Verify PostgreSQL is running: `pg_isready`
- Check database credentials in `.env`
- Ensure the database exists: `psql -l`

### Redis Connection Issues

- Verify Redis is running: `redis-cli ping` (should return `PONG`)
- Check Redis host and port in `.env`

### Port Already in Use

- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.ts`

### Module Not Found

- Run `npm install` in both backend and frontend directories
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## Production Deployment

For production deployment, see `DEPLOYMENT.md` (to be created) for detailed instructions on:

- Environment configuration
- Database migrations
- Security best practices
- SSL/TLS setup
- Process management (PM2)
- Docker deployment
- Cloud deployment (AWS, Azure, GCP)

## Support

For issues or questions:

- Check the main README.md
- Review API documentation at `/api/docs`
- Open an issue on GitHub
- Contact support@aicrm.com

## Next Steps

After setup:

1. **Import Contacts**: Use the CSV import feature
2. **Create Segments**: Set up contact segmentation rules
3. **Design Campaigns**: Create email/SMS campaigns
4. **Configure AI**: Test AI features like lead scoring
5. **Set Up Telephony**: Configure calling features
6. **Explore Analytics**: Review dashboard and reports

