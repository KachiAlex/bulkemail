# 🚀 Quick Start - Get Backend Running in 2 Minutes

## ✅ Frontend is Already Running!
- **Frontend:** http://localhost:5173/ ✅ WORKING

## 🔧 Start Backend (Simple Way)

### Step 1: Create `.env` file

Navigate to `C:\bulkemail\backend\` and create a file named `.env` with this content:

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=quick-dev-secret-12345
CORS_ORIGIN=http://localhost:5173
ENCRYPTION_KEY=dev-encryption-key-32-char-min
```

### Step 2: Start Backend

Open a **NEW PowerShell window** and run:

```powershell
cd C:\bulkemail\backend
npm run start:dev
```

**Wait for this message:**
```
Application is running on: http://localhost:3000
API Documentation: http://localhost:3000/api/docs
```

### Step 3: Register Your Account

1. Go back to http://localhost:5173/
2. Click **"Sign up"** link
3. Fill in:
   - First Name: John
   - Last Name: Doe  
   - Email: admin@demo.com
   - Password: Admin123!
4. Click **"Sign Up"**

You're now logged in! 🎉

---

## ⚠️ If Backend Won't Start

### Error: "Cannot connect to PostgreSQL"

**Solution:** The backend is configured for PostgreSQL by default. You have 2 options:

#### Option A: Use Docker (If you have Docker)
```powershell
cd C:\bulkemail
docker-compose up postgres redis -d
```

#### Option B: Install PostgreSQL & Redis

**PostgreSQL:**
1. Download: https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the password you set

**Redis:**
1. Download: https://github.com/microsoftarchive/redis/releases
2. Or use Memurai: https://www.memurai.com/get-memurai (Redis for Windows)

Then update your `.env`:
```env
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=aicrm

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 🎯 What You Can Do After Login

Once both frontend and backend are running:

✅ **Contacts Page**
- Add contacts manually
- Import CSV files
- View contact details
- Calculate lead scores with AI

✅ **Campaigns Page**
- Create email/SMS campaigns
- Use AI to generate content
- Schedule campaigns
- View performance stats

✅ **Dashboard**
- See your metrics
- Contact statistics
- Campaign performance

✅ **Profile**
- Update your information
- Change settings

---

## 🔍 Troubleshooting

### Backend won't start?
**Check if port 3000 is already in use:**
```powershell
netstat -ano | findstr :3000
```

If something is using it, either:
- Kill that process
- Or change PORT in `.env` to 3001

### Frontend can't connect to backend?
Make sure:
1. Backend is running (check http://localhost:3000/api)
2. CORS is configured correctly in backend `.env`

### Can't login?
1. Make sure backend console shows no errors
2. Check browser console (F12) for error messages
3. Try registering a new account first

---

## 📊 Current Status

| Component | Status | URL |
|-----------|--------|-----|
| **Frontend** | ✅ Running | http://localhost:5173 |
| **Backend** | ⏳ Not Started | http://localhost:3000 |
| **Database** | ⏳ Needed | PostgreSQL or SQLite |
| **Redis** | ⚠️ Optional | For caching only |

---

## 💡 Simplest Path Forward

1. ✅ Frontend is working
2. ⏳ Create `backend/.env` file (copy content above)
3. ⏳ Run `cd backend && npm run start:dev`
4. ✅ Go to http://localhost:5173/ and register

**That's it!** The backend will auto-create the database if using PostgreSQL.

---

## 🆘 Still Stuck?

Tell me:
1. What error message you see when starting backend?
2. Do you have PostgreSQL installed? (Yes/No)
3. Do you have Docker installed? (Yes/No)

I'll give you the exact solution for your situation!

