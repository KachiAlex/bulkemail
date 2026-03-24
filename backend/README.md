# PANDI CRM Backend

## 🚀 Deployment to Render

### Prerequisites
- GitHub account
- Render.com account (free tier)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Initial backend deployment"
git branch -M main
git remote add origin https://github.com/yourusername/pandi-crm-backend.git
git push -u origin main
```

### Step 2: Deploy to Render
1. Go to [Render.com](https://render.com)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select the `pandi-crm-backend` repo
5. Configure:
   - **Name**: pandi-crm-backend
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: Free

### Step 3: Add Environment Variables
In Render Dashboard → Service → Environment:
```
NODE_ENV=production
PORT=3000
API_PREFIX=/api
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=7d
REFRESH_TOKEN_EXPIRATION=30d
ENCRYPTION_KEY=your-32-char-encryption-key
CORS_ORIGIN=https://bulkemail-crm.web.app
ENABLE_AI_FEATURES=false
ENABLE_CALL_RECORDING=false
ENABLE_SMS=false
ENABLE_EMAIL=false
```

### Step 4: Create PostgreSQL Database
1. In Render, click "New" → "PostgreSQL"
2. **Name**: pandi-crm-db
3. **Plan**: Free
4. Connect it to your web service

### Step 5: Seed Admin User
After deployment, run the seed script:
```bash
# In Render Shell or locally with DATABASE_URL
npm run seed:prod
```

### Admin Credentials
- **Email**: admin@pandicrm.com
- **Password**: admin123

## 📚 API Documentation
Once deployed, visit: `https://your-service-url.onrender.com/api/docs`

## 🔧 Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm test
```

## 📝 Environment Variables
See `env-setup.txt` for local development configuration.
