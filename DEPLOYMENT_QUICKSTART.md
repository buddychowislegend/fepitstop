# 🚀 Quick Deployment Guide

## Deploy Frontend Pitstop in 10 minutes

### 🎯 Easiest Path: Render.com (Free)

#### Backend Deployment:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com) → Sign up
   - Click **"New +" → "Web Service"**
   - Connect GitHub → Select your repo
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - Click **"Create Web Service"**

3. **Add Environment Variables:**
   In Render dashboard → Environment:
   ```
   JWT_SECRET = your_random_secret_key_here_make_it_long_and_random
   NODE_ENV = production
   ```

4. **Wait for deploy** (~2 min)

5. **Get your backend URL:** 
   ```
   https://frontendpitstop-backend-xxxx.onrender.com
   ```

#### Frontend Deployment:

1. **Update API URL:**
   Create `.env.local` in root:
   ```
   NEXT_PUBLIC_API_URL=https://frontendpitstop-backend-xxxx.onrender.com/api
   ```

2. **Deploy on Vercel:**
   ```bash
   npm install -g vercel
   vercel
   ```
   
   Or via Vercel dashboard:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo
   - Add environment variable:
     ```
     NEXT_PUBLIC_API_URL = https://your-backend-url.onrender.com/api
     ```
   - Deploy!

3. **Your live site:**
   ```
   https://frontendpitstop.vercel.app
   ```

---

## 🔥 Alternative: Railway.app (Even Easier!)

### Both Frontend + Backend:

1. **Go to** [railway.app](https://railway.app)

2. **Create Project** → Deploy from GitHub

3. **Railway auto-detects** Next.js frontend and Express backend

4. **Add environment variables** in dashboard

5. **Done!** Railway handles everything.

---

## 📝 Before Deploying:

### Backend Checklist:
- [ ] Run `npm run seed` locally first
- [ ] Commit `database/data.json` (or use MongoDB Atlas for production)
- [ ] Update `.env` with production values
- [ ] Test all endpoints work locally

### Frontend Checklist:
- [ ] Update `NEXT_PUBLIC_API_URL` to production backend URL
- [ ] Test signup/signin flow
- [ ] Verify all pages load data from backend

---

## 🗄️ Production Database (Recommended)

### MongoDB Atlas (Free Tier):

1. **Sign up:** [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)

2. **Create cluster** (Free M0 tier)

3. **Get connection string:**
   ```
   mongodb+srv://username:password@cluster.mongodb.net/frontendpitstop
   ```

4. **Add to Render environment variables:**
   ```
   MONGODB_URI = mongodb+srv://...
   ```

5. **Update backend** `server.js` to use MongoDB:
   ```javascript
   const connectDB = require('./config/database');
   connectDB(); // Uses MONGODB_URI if available
   ```

6. **Run seed script** once:
   ```bash
   npm run seed
   ```

---

## 🌐 CORS Configuration

The backend already has CORS enabled for all origins (development).

For production, update `server.js`:

```javascript
app.use(cors({
  origin: [
    'https://frontendpitstop.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
}));
```

---

## 📊 Monitor Your App

### Render:
- **Logs:** Dashboard → Logs tab (real-time)
- **Metrics:** Shows CPU, memory usage
- **Alerts:** Email notifications for failures

### Railway:
- **Logs:** Dashboard → Deployments
- **Metrics:** Resource usage graphs
- **Webhooks:** Custom notifications

---

## 🔧 Troubleshooting

### Backend won't start:
1. Check environment variables are set
2. View logs in platform dashboard
3. Verify `npm start` works locally

### Frontend can't connect:
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check CORS settings
3. Test API endpoints directly (Postman/curl)

### Database issues:
1. File-based DB: Ensure `database/` directory is committed
2. MongoDB: Verify connection string and network access

---

## 💰 Cost Estimates

### Free Tier (Good for MVP):
- **Render:** Free (750 hrs/month, spins down after 15 min inactivity)
- **Vercel:** Free (hobby projects)
- **MongoDB Atlas:** Free (512MB storage)
- **Total:** $0/month

### Paid (For Production):
- **Render:** $7/month (always on)
- **Vercel Pro:** $20/month
- **MongoDB Atlas:** $9/month (2GB)
- **Total:** ~$36/month

---

## 🚀 Quick Deploy Script

I've created a helper script for you!

```bash
cd backend
chmod +x deploy.sh
./deploy.sh
```

This will guide you through deployment step-by-step.

