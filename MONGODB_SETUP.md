# 🍃 MongoDB Atlas Setup Guide

## Step 1: Create Free MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for free (no credit card required)
3. Verify your email

## Step 2: Create a Cluster

1. **Choose deployment option:**
   - Select "M0 Free Tier" (512 MB storage, perfect for your app)
   - Choose a cloud provider (AWS recommended)
   - Select a region close to your users

2. **Cluster Name:**
   - Name it: `frontendpitstop-cluster` (or any name you prefer)

3. **Click "Create Cluster"** (takes 3-5 minutes)

## Step 3: Create Database User

1. In Atlas dashboard, click **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. **Authentication Method:** Password
4. **Username:** `frontendpitstop_user`
5. **Password:** Click "Autogenerate Secure Password" (COPY THIS!)
6. **Database User Privileges:** Choose "Read and write to any database"
7. Click **"Add User"**

## Step 4: Whitelist IP Addresses

1. Click **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - This is needed for Vercel serverless functions
   - Click "Confirm"

## Step 5: Get Connection String

1. Go back to **"Database"** (left sidebar)
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. **Driver:** Node.js
5. **Version:** 6.7 or later
6. **Copy the connection string**, it looks like:
   ```
   mongodb+srv://frontendpitstop_user:<password>@cluster.mongodb.net/?retryWrites=true&w=majority
   ```

7. **IMPORTANT:** Replace `<password>` with the password you copied in Step 3

## Step 6: Add to Vercel

Now let's add the MongoDB connection string to Vercel:

```bash
# Navigate to backend directory
cd backend

# Add MONGODB_URI to Vercel
# When prompted, paste your connection string with the password replaced
vercel env add MONGODB_URI production
```

Example connection string:
```
mongodb+srv://frontendpitstop_user:YOUR_PASSWORD_HERE@cluster.mongodb.net/frontendpitstop?retryWrites=true&w=majority
```

**Note:** Add `/frontendpitstop` before the `?` to specify the database name.

## Step 7: Deploy to Vercel

```bash
# Deploy with new MongoDB configuration
vercel --prod

# Wait for deployment (30-60 seconds)
```

## Step 8: Verify Connection

Test that MongoDB is working:

```bash
curl https://fepit.vercel.app/api/health
```

You should see:
```json
{
  "database": {
    "type": "MongoDB Atlas (permanent)",
    "users": 0,
    "problems": 100
  }
}
```

## Step 9: Seed MongoDB (One-time)

After first deployment with MongoDB:

```bash
# Seed the database with initial problems data
curl -X POST https://fepit.vercel.app/api/admin/seed \
  -H "X-Admin-Key: admin_key_frontendpitstop_secure_2025"
```

## ✅ Done!

Your data will now persist permanently on MongoDB Atlas:
- ✅ Users won't be lost on deployment
- ✅ Submissions are saved permanently  
- ✅ Profile data persists
- ✅ Free tier supports 512MB (thousands of users)

## 🔒 Security Notes

1. **Never commit** MongoDB connection string to git
2. **Use environment variables** only
3. **Enable IP whitelist** once you know your Vercel IPs (optional)
4. **Rotate passwords** periodically

## 📊 Monitor Your Database

- View data in Atlas dashboard: https://cloud.mongodb.com
- Check collections: users, problems, submissions, etc.
- Monitor storage usage (free tier has 512MB limit)

## 🆘 Troubleshooting

**Connection fails:**
- Check password has no special characters that need encoding
- Verify IP whitelist includes 0.0.0.0/0
- Check connection string format

**Still seeing 0 users:**
- Wait 1-2 minutes after deployment
- Verify MONGODB_URI is set in Vercel
- Check Vercel logs: `vercel logs`
