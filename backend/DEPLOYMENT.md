# Backend Deployment Guide

Multiple options to deploy the Frontend Pitstop backend API.

## Option 1: Render.com (Recommended - Free Tier)

### Steps:

1. **Create account** at [render.com](https://render.com)

2. **Push code to GitHub** (if not already):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

3. **Create Web Service** on Render:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** `frontendpitstop-backend`
     - **Region:** Choose closest to you
     - **Branch:** `main`
     - **Root Directory:** `backend`
     - **Runtime:** `Node`
     - **Build Command:** `npm install`
     - **Start Command:** `npm start`
     - **Instance Type:** `Free`

4. **Add Environment Variables** in Render dashboard:
   ```
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_in_production_frontendpitstop_2025
   NODE_ENV=production
   ```

5. **Deploy!** Render will auto-deploy.

6. **Your API URL:** `https://frontendpitstop-backend.onrender.com`

### Update Frontend:
In `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://frontendpitstop-backend.onrender.com/api
```

---

## Option 2: Railway.app (Easy + Free Tier)

### Steps:

1. **Create account** at [railway.app](https://railway.app)

2. **Install Railway CLI** (optional):
   ```bash
   npm install -g @railway/cli
   railway login
   ```

3. **Deploy via Dashboard**:
   - Click "New Project"
   - Choose "Deploy from GitHub repo"
   - Select your repo
   - Railway auto-detects Node.js

4. **Add Environment Variables**:
   ```
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_in_production_frontendpitstop_2025
   NODE_ENV=production
   ```

5. **Set Root Directory**:
   - In Settings → Service → Root Directory: `backend`

6. **Deploy!**

7. **Your API URL:** Railway provides a URL like `https://xxx.railway.app`

---

## Option 3: Heroku

### Steps:

1. **Install Heroku CLI**:
   ```bash
   brew tap heroku/brew && brew install heroku
   ```

2. **Login**:
   ```bash
   heroku login
   ```

3. **Create app**:
   ```bash
   cd backend
   heroku create frontendpitstop-backend
   ```

4. **Set environment variables**:
   ```bash
   heroku config:set JWT_SECRET=your_super_secret_jwt_key
   heroku config:set NODE_ENV=production
   ```

5. **Create Procfile** (already created below)

6. **Deploy**:
   ```bash
   git push heroku main
   ```

7. **Your API URL:** `https://frontendpitstop-backend.herokuapp.com`

---

## Option 4: Vercel (Serverless)

### Steps:

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd backend
   vercel
   ```

3. **Configure** when prompted:
   - Project name: `frontendpitstop-backend`
   - Build command: Leave empty
   - Output directory: Leave empty

4. **Set Environment Variables** in Vercel dashboard

5. **Your API URL:** `https://frontendpitstop-backend.vercel.app`

**Note:** Serverless has limitations with file-based database. Use MongoDB Atlas for production.

---

## Option 5: DigitalOcean App Platform

### Steps:

1. **Create account** at [digitalocean.com](https://digitalocean.com)

2. **Create App**:
   - Click "Create" → "Apps"
   - Connect GitHub repo
   - Select `backend` directory

3. **Configure**:
   - **Run Command:** `npm start`
   - **HTTP Port:** `5000`

4. **Add Environment Variables**

5. **Deploy!**

---

## Pre-Deployment Checklist

- [ ] Update `JWT_SECRET` to a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Add `.gitignore` for `database/` directory
- [ ] Test all API endpoints locally
- [ ] Update frontend `NEXT_PUBLIC_API_URL`

---

## Database Considerations

### Current Setup (File-based):
- ✅ Works great for development
- ✅ Simple, no external dependencies
- ⚠️ Not ideal for production (single file)

### For Production:
**Recommended:** Use MongoDB Atlas (free tier)

1. **Create cluster** at [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. **Get connection string**
3. **Update backend** to use Mongoose (models already created)
4. **Set** `MONGODB_URI` environment variable
5. **Run** `npm run seed` once

---

## Quick Deploy Commands

### Render:
```bash
# Already configured via dashboard
```

### Railway:
```bash
railway login
railway init
railway up
railway variables set JWT_SECRET=your_secret
```

### Heroku:
```bash
heroku create frontendpitstop-backend
git push heroku main
heroku config:set JWT_SECRET=your_secret
```

---

## Monitoring & Logs

### View Logs:
- **Render:** Dashboard → Logs tab
- **Railway:** Dashboard → Deployments
- **Heroku:** `heroku logs --tail`

---

## Cost Comparison

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Render** | ✅ 750 hrs/month | Spins down after inactivity |
| **Railway** | ✅ $5 credit/month | Good for small apps |
| **Heroku** | ❌ (Paid only) | Reliable, starts at $7/month |
| **Vercel** | ✅ Generous | Best for serverless |
| **DigitalOcean** | ❌ Starts at $5/month | Full control |

**Recommendation:** Start with **Render.com** (free tier is great!)

