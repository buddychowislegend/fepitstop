# MongoDB Quick Start for Company Data

## ✅ MongoDB Package Installed

The MongoDB package has been installed:
- `mongodb` - MongoDB driver for Node.js
- `@types/mongodb` - TypeScript types for MongoDB

## 🔧 Environment Setup

### Option 1: Local MongoDB (Development)
```bash
# Install MongoDB locally
# macOS with Homebrew:
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Add to .env.local
MONGODB_URI=mongodb://localhost:27017/hireog
```

### Option 2: MongoDB Atlas (Production)
```bash
# 1. Create free account at https://www.mongodb.com/atlas
# 2. Create a cluster
# 3. Get connection string
# 4. Add to .env.local
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hireog
```

### Option 3: Docker (Development)
```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Add to .env.local
MONGODB_URI=mongodb://localhost:27017/hireog
```

## 🚀 Testing the Setup

### 1. Test MongoDB Connection
```bash
# Run the test endpoint
curl https://fepit.vercel.app/api/company/test
```

### 2. Add a Candidate
1. Go to `/hiring/dashboard`
2. Click "Add Candidate"
3. Fill in the form
4. Check MongoDB for the new document

### 3. Verify Data Persistence
1. Add candidates
2. Restart the server
3. Check dashboard - candidates should still be there

## 📊 MongoDB Collections Created

The following collections will be created automatically:

- `candidates` - Company candidates
- `interviewDrives` - Interview screening drives
- `interviewTokens` - Interview access tokens
- `interviewResponses` - Interview answers and responses

## 🔍 Troubleshooting

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
brew services list | grep mongodb

# Check connection string
echo $MONGODB_URI

# Test connection
mongosh $MONGODB_URI
```

### Environment Variables
```bash
# Check .env.local file
cat .env.local | grep MONGODB_URI

# Should show:
# MONGODB_URI=mongodb://localhost:27017/hireog
```

## ✅ Success Indicators

When MongoDB is working correctly, you'll see:
- Console logs: "Connected to MongoDB for company data"
- API responses include debug info with MongoDB source
- Data persists across server restarts
- Candidates appear in dashboard after adding

## 🎯 Next Steps

1. **Set up MongoDB** (local or Atlas)
2. **Add MONGODB_URI** to environment variables
3. **Test the connection** with the company dashboard
4. **Add candidates** and verify they persist
5. **Create interview drives** and test the full flow

All company data will now be stored persistently in MongoDB! 🎉
