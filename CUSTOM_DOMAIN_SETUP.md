# Custom Domain Setup Guide

## Issue: APIs Returning 500/404 on Custom Domain

When you deploy your frontend to a custom domain (e.g., `frontendpitstop.com`), the API calls fail because the frontend and backend are hosted separately.

## Architecture

```
Frontend (frontendpitstop.com)
    ↓ calls /api/problems
    ↓ Next.js rewrites to →
Backend (fepit.vercel.app/api)
    ↓ responds
Frontend receives data ✅
```

## Solution Implemented

### 1. Next.js Rewrites (Recommended)

The frontend now uses Next.js rewrites to proxy API calls to the backend. This works automatically without any additional configuration.

**How it works:**
- Frontend makes calls to `/api/problems` (relative path)
- Next.js rewrites to `https://fepit.vercel.app/api/problems`
- Backend responds
- No CORS issues

**Files Updated:**
- `next.config.ts` - Enables rewrites in production
- `src/lib/config.ts` - Uses relative `/api` paths

### 2. Vercel Environment Variables (Optional)

If you want to use a different backend URL, set this environment variable in Vercel:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com/api
```

**How to set:**
1. Go to Vercel Dashboard
2. Select your frontend project (frontendpitstop.com)
3. Go to Settings → Environment Variables
4. Add: `NEXT_PUBLIC_API_URL` = `https://fepit.vercel.app/api`
5. Redeploy

## Current Setup

### Frontend (frontendpitstop.com)
- Hosted on Vercel
- Custom domain configured
- Uses Next.js rewrites to proxy API calls
- No CORS issues

### Backend (fepit.vercel.app)
- Hosted on Vercel
- Separate project
- MongoDB Atlas database
- CORS enabled for all origins

## Deployment Steps

### Deploy Frontend to Custom Domain

1. **Push your changes:**
   ```bash
   git push origin main
   ```

2. **Vercel auto-deploys** to frontendpitstop.com

3. **Verify APIs work:**
   ```bash
   curl https://frontendpitstop.com/api/problems
   ```

### If APIs Still Don't Work

**Check 1: Verify Backend is Running**
```bash
curl https://fepit.vercel.app/api/problems
```
Should return JSON with problems.

**Check 2: Check Vercel Logs**
1. Go to Vercel Dashboard
2. Select frontendpitstop.com project
3. Go to Deployments → Latest
4. Check Function Logs for errors

**Check 3: Verify Environment Variables**
```bash
# In Vercel Dashboard for frontend project
NEXT_PUBLIC_API_URL=https://fepit.vercel.app/api
```

**Check 4: Verify Backend Environment Variables**
```bash
# In Vercel Dashboard for backend project
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
ADMIN_KEY=your-admin-key
EMAIL_USER=your-email@gmail.com (optional)
EMAIL_PASSWORD=your-app-password (optional)
```

## Testing

### Test API Proxying Locally

```bash
# Start frontend
npm run dev

# In another terminal, test API
curl http://localhost:3000/api/problems
```

Should return problems from backend.

### Test on Production

```bash
# Test custom domain
curl https://frontendpitstop.com/api/problems

# Should return same data as
curl https://fepit.vercel.app/api/problems
```

## Troubleshooting

### Error: 404 on /api/*

**Cause:** Next.js rewrites not working

**Fix:**
1. Check `next.config.ts` has rewrites enabled
2. Verify `NEXT_PUBLIC_API_URL` is set correctly
3. Redeploy frontend

### Error: 500 Internal Server Error

**Cause:** Backend error or environment variables missing

**Fix:**
1. Check backend Vercel logs
2. Verify all environment variables are set
3. Check MongoDB connection
4. Verify JWT_SECRET is set

### Error: CORS Issues

**Cause:** Backend CORS not configured

**Fix:**
1. Backend already has CORS enabled for all origins
2. Using Next.js rewrites bypasses CORS
3. No additional configuration needed

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│  Custom Domain: frontendpitstop.com     │
│  ┌───────────────────────────────────┐  │
│  │  Next.js Frontend                 │  │
│  │  - React pages                    │  │
│  │  - API calls to /api/*            │  │
│  └───────────────────────────────────┘  │
│              ↓ Next.js Rewrites          │
└──────────────┼──────────────────────────┘
               ↓
┌──────────────┼──────────────────────────┐
│  Backend: fepit.vercel.app/api          │
│  ┌───────────────────────────────────┐  │
│  │  Express.js API                   │  │
│  │  - /api/problems                  │  │
│  │  - /api/auth                      │  │
│  │  - /api/quiz                      │  │
│  │  - /api/submissions               │  │
│  └───────────────────────────────────┘  │
│              ↓                           │
│  ┌───────────────────────────────────┐  │
│  │  MongoDB Atlas                    │  │
│  │  - Users, Problems, Submissions   │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Summary

✅ **Frontend:** frontendpitstop.com (with Next.js rewrites)
✅ **Backend:** fepit.vercel.app/api (Express + MongoDB)
✅ **API Calls:** Proxied through Next.js rewrites
✅ **CORS:** No issues with this setup
✅ **Database:** MongoDB Atlas (permanent storage)

Your setup is now configured to work seamlessly with your custom domain!
