# 🚀 Deploy Backend Only to Vercel

## 📋 **Prerequisites**

1. **Vercel CLI installed**:
   ```bash
   npm install -g vercel
   ```

2. **Vercel account** (free tier works fine)

## 🔧 **Step 1: Prepare Backend for Vercel**

### **1.1 Update package.json**
Make sure your `backend/package.json` has the correct start script:

```json
{
  "name": "frontendpitstop-backend",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### **1.2 Environment Variables**
Create a `.env` file in the backend directory:

```bash
# backend/.env
JWT_SECRET=your_jwt_secret_here
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
```

## 🚀 **Step 2: Deploy to Vercel**

### **2.1 Navigate to Backend Directory**
```bash
cd backend
```

### **2.2 Login to Vercel**
```bash
vercel login
```

### **2.3 Deploy Backend**
```bash
vercel --prod
```

### **2.4 Set Environment Variables**
After deployment, set your environment variables in Vercel dashboard:

1. Go to your project in Vercel dashboard
2. Go to Settings → Environment Variables
3. Add these variables:
   - `JWT_SECRET`: Your JWT secret
   - `GEMINI_API_KEY`: Your Gemini API key
   - `PORT`: 3000

## 🔧 **Step 3: Update Frontend API URL**

### **3.1 Update Frontend Environment**
Update your frontend `.env.local`:

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app
```

### **3.2 Update CORS in Backend**
Make sure your backend CORS includes your Vercel URL:

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'https://fepitstop.onrender.com',
    'https://your-frontend-url.vercel.app'  // Add your frontend URL
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));
```

## 📁 **Step 4: Vercel Configuration**

Your `backend/vercel.json` is already configured correctly:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ]
}
```

## 🎯 **Step 5: Deploy Commands**

### **Quick Deploy:**
```bash
cd backend
vercel --prod
```

### **Deploy with Environment Variables:**
```bash
cd backend
vercel env add JWT_SECRET
vercel env add GEMINI_API_KEY
vercel --prod
```

## 🔍 **Step 6: Test Deployment**

### **6.1 Test Health Endpoint**
```bash
curl https://your-backend-url.vercel.app/api/health
```

### **6.2 Test Problems Endpoint**
```bash
curl https://your-backend-url.vercel.app/api/problems
```

### **6.3 Test CORS**
```bash
curl -H "Origin: https://your-frontend-url.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-backend-url.vercel.app/api/problems
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **CORS Errors**:
   - Add your frontend URL to CORS origins
   - Check if credentials are enabled

2. **Environment Variables**:
   - Make sure all env vars are set in Vercel dashboard
   - Redeploy after adding new env vars

3. **Database Issues**:
   - Vercel is serverless, so file-based DB won't persist
   - Consider using a real database (MongoDB Atlas, Supabase)

### **Database Migration for Production:**

For production, replace the file-based database with a real database:

```javascript
// Replace backend/config/db.js with MongoDB/Supabase
const { MongoClient } = require('mongodb');
// or
const { createClient } = require('@supabase/supabase-js');
```

## 📊 **Vercel Dashboard Features**

- **Analytics**: Monitor API usage
- **Logs**: View server logs
- **Environment Variables**: Manage secrets
- **Domains**: Custom domain setup
- **Functions**: Serverless function monitoring

## 🎉 **Deployment Complete!**

Your backend will be available at:
```
https://your-project-name.vercel.app
```

### **API Endpoints:**
- `GET /api/health` - Health check
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/problems` - Get problems
- `POST /api/interview` - AI interview features
- `POST /api/speech-to-text` - Speech transcription
- `POST /api/text-to-speech` - Text to speech

## 🔄 **Redeploy Commands**

```bash
# Redeploy after changes
cd backend
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

Your backend is now deployed and ready to serve your frontend! 🚀
