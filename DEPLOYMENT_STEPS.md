# 🚀 Backend Deployment to Render

## Quick Setup Guide

### 1. Create GitHub Repository
1. Go to [GitHub](https://github.com) and create a new repository
2. Name it: `pandi-crm-backend`
3. Make it Public (easier for free Render tier)
4. Don't initialize with README (we have one)

### 2. Push Code to GitHub
```bash
# Add all files
git add .

# Commit changes
git commit -m "Ready for Render deployment"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/pandi-crm-backend.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Deploy to Render
1. Go to [Render.com](https://render.com) and sign up
2. Click **"New"** → **"Web Service"**
3. **Connect GitHub**: Authorize Render to access your repos
4. **Select Repository**: Choose `pandi-crm-backend`
5. **Configure Service**:
   - **Name**: `pandi-crm-backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`
   - **Instance Type**: `Free`
   - **Plan**: `Free`

6. Click **"Advanced Settings"** and add:
   - **Health Check Path**: `/api/health`

7. Click **"Create Web Service"**

### 4. Add PostgreSQL Database
1. In Render Dashboard, click **"New"** → **"PostgreSQL"**
2. **Name**: `pandi-crm-db`
3. **Plan**: `Free`
4. Click **"Create Database"**

### 5. Connect Database to Backend
1. Go back to your web service
2. Click **"Environment"**
3. Add the database connection variables (Render auto-adds these):
   - `DATABASE_URL` (auto-added by Render)
   - Add other env vars from README.md

### 6. Create Admin User
After deployment succeeds:
1. Go to your service → **"Shell"**
2. Run: `npm run seed:prod`

### 7. Test the Backend
Your backend will be available at: `https://pandi-crm-backend.onrender.com`

Test health endpoint: `https://pandi-crm-backend.onrender.com/api/health`

### 8. Update Frontend (if needed)
The frontend is already configured to call `https://pandicrm.onrender.com`
If your Render URL is different, update `frontend/src/config/env.ts`

## 🎯 Success Checklist
- [ ] Backend deployed to Render
- [ ] PostgreSQL database connected
- [ ] Admin user created
- [ ] Health endpoint working
- [ ] Frontend can login with admin@pandicrm.com / admin123

## 🔍 Troubleshooting
- **Build fails**: Check Render logs for missing dependencies
- **Database connection failed**: Ensure DATABASE_URL is set correctly
- **404 errors**: Check API_PREFIX and routing
- **CORS errors**: Verify CORS_ORIGIN includes your frontend URL

## 📞 Support
- Render docs: https://render.com/docs
- GitHub issues: Create issue in your repo
