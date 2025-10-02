# Deploy Backend to Render.com

## Step-by-Step Guide

### Step 1: Push Code to GitHub

First, authenticate with GitHub and push your code:

```bash
cd /Users/sagar/Documents/FePitStop/frontendpitstop

# Option A: Using GitHub CLI (Easiest)
brew install gh
gh auth login
git push -u origin main

# Option B: Using Personal Access Token
# 1. Go to: https://github.com/settings/tokens/new
# 2. Create token with 'repo' scope
# 3. Run: git push -u origin main
# 4. Username: buddychowislegend
# 5. Password: YOUR_TOKEN
```

### Step 2: Deploy on Render.com

#### 2.1 Sign Up
1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (easiest)

#### 2.2 Create Web Service
1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Click **"Connect account"** if GitHub not connected
4. Find your repository: **`buddychowislegend/fepitstop`**
5. Click **"Connect"**

#### 2.3 Configure Service

Fill in the form:

**Basic Settings:**
```
Name:              frontendpitstop-backend
Region:            Oregon (US West) or closest to you
Branch:            main
Root Directory:    backend
Runtime:           Node
Build Command:     npm install
Start Command:     npm start
```

**Instance Type:**
```
Select: Free
```

**Advanced Settings (scroll down):**

Click **"Advanced"** and add:

**Auto-Deploy:**
```
✅ Yes (auto-deploy on push)
```

#### 2.4 Add Environment Variables

Click **"Add Environment Variable"** for each:

```
Key: PORT
Value: 5000

Key: JWT_SECRET
Value: frontend_pitstop_super_secret_jwt_key_production_2025_change_this

Key: NODE_ENV
Value: production
```

**Important:** Change `JWT_SECRET` to a random string. Generate one:
```bash
openssl rand -base64 32
```

#### 2.5 Deploy!

1. Click **"Create Web Service"**
2. Wait 2-3 minutes for deployment
3. Watch the logs in real-time

### Step 3: Get Your Backend URL

Once deployed, you'll see:
```
✓ Live at: https://frontendpitstop-backend.onrender.com
```

Copy this URL!

### Step 4: Update Frontend

Update your frontend to use the production backend:

```bash
cd /Users/sagar/Documents/FePitStop/frontendpitstop

# Create production env file
echo "NEXT_PUBLIC_API_URL=https://frontendpitstop-backend.onrender.com/api" > .env.production
```

### Step 5: Seed Database

After first deployment, seed the database:

**Option A: Via Render Shell**
1. Go to Render dashboard → Your service
2. Click **"Shell"** tab
3. Run: `npm run seed`

**Option B: Via API (easier)**
Just visit these URLs in your browser to verify:
- https://frontendpitstop-backend.onrender.com/api/health
- https://frontendpitstop-backend.onrender.com/api/problems

The database file will be created automatically!

### Step 6: Test Backend

Test your endpoints:

```bash
# Health check
curl https://frontendpitstop-backend.onrender.com/api/health

# Get problems
curl https://frontendpitstop-backend.onrender.com/api/problems

# Signup test
curl -X POST https://frontendpitstop-backend.onrender.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

---

## 🎯 Quick Reference

### Your Render Settings:
```
Repository:     buddychowislegend/fepitstop
Root Directory: backend
Build:          npm install
Start:          npm start
Port:           5000
```

### Environment Variables:
```
PORT          = 5000
JWT_SECRET    = (random 32-char string)
NODE_ENV      = production
```

### Your Backend URL:
```
https://frontendpitstop-backend.onrender.com
```

---

## 🔧 Troubleshooting

### Deploy Fails:
1. Check logs in Render dashboard
2. Verify `package.json` has `"start": "node server.js"`
3. Ensure Root Directory is set to `backend`

### Can't Connect:
1. Check CORS settings in `server.js`
2. Verify environment variables are set
3. Check service is running (not sleeping)

### 500 Errors:
1. Check JWT_SECRET is set
2. View logs in Render dashboard
3. Ensure all dependencies installed

---

## ⚙️ Render Free Tier Limits

- ✅ 750 hours/month (enough for one service)
- ✅ Auto-deploys on git push
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start takes ~30 seconds

**Upgrade to Paid ($7/month) for:**
- Always on (no cold starts)
- More CPU/RAM
- Custom domains

---

## 🔄 Auto-Deploy Setup

Once connected, every `git push` to main branch will:
1. Trigger automatic deployment
2. Run `npm install`
3. Restart service
4. Show logs in dashboard

---

## 📊 Monitoring

### View Logs:
- Dashboard → Your Service → **Logs** tab

### Metrics:
- Dashboard → Your Service → **Metrics** tab
- See CPU, Memory, Request stats

### Alerts:
- Dashboard → Settings → **Notifications**
- Get email alerts for failures

---

## 🎓 Next Steps After Backend Deploy:

1. ✅ Test all API endpoints
2. ✅ Run `npm run seed` via Render shell
3. ✅ Update frontend `.env.production`
4. ✅ Deploy frontend to Vercel
5. ✅ Test full app end-to-end

---

## 💡 Pro Tips:

1. **Keep free tier awake:** Use a service like UptimeRobot to ping your backend every 10 minutes

2. **Environment variables:** Never commit `.env` - use Render dashboard

3. **Database:** For production, migrate to MongoDB Atlas (also has free tier)

4. **Logs:** Check logs regularly for errors

5. **Custom domain:** Add your domain in Render settings (paid plan)

---

Need help with any step? Check the logs or let me know! 🚀

