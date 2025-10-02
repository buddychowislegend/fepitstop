#!/bin/bash

echo "🚀 Deploying Backend to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel first:"
    vercel login
fi

# Set environment variables
echo "🔧 Setting up environment variables..."
echo "Please enter your JWT_SECRET:"
read -s JWT_SECRET
echo "Please enter your GEMINI_API_KEY:"
read -s GEMINI_API_KEY

# Add environment variables to Vercel
vercel env add JWT_SECRET
vercel env add GEMINI_API_KEY

# Deploy to production
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Backend deployed successfully!"
echo "🔗 Your backend URL will be shown above"
echo "📝 Don't forget to update your frontend API URL"
