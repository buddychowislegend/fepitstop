#!/bin/bash

echo "🚀 Frontend Pitstop Backend Deployment Helper"
echo "=============================================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
  echo "⚠️  Git not initialized. Initializing..."
  git init
  echo "✓ Git initialized"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found!"
  echo "Creating .env template..."
  cat > .env << 'EOF'
PORT=5000
JWT_SECRET=CHANGE_THIS_TO_RANDOM_SECRET_KEY
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/frontendpitstop
EOF
  echo "✓ Created .env template. Please update JWT_SECRET!"
  exit 1
fi

echo "Select deployment platform:"
echo "1) Render.com (Recommended - Free tier)"
echo "2) Railway.app (Easy setup)"
echo "3) Heroku (Reliable, paid)"
echo "4) Manual instructions"
echo ""
read -p "Enter choice (1-4): " choice

case $choice in
  1)
    echo ""
    echo "📦 Render.com Deployment Steps:"
    echo "================================"
    echo ""
    echo "1. Commit your code:"
    echo "   git add ."
    echo "   git commit -m 'Ready for deployment'"
    echo "   git push origin main"
    echo ""
    echo "2. Go to: https://render.com"
    echo "   - Click 'New +' → 'Web Service'"
    echo "   - Connect your GitHub repository"
    echo ""
    echo "3. Configure:"
    echo "   - Root Directory: backend"
    echo "   - Build Command: npm install"
    echo "   - Start Command: npm start"
    echo ""
    echo "4. Add Environment Variables:"
    echo "   JWT_SECRET = $(openssl rand -base64 32)"
    echo "   NODE_ENV = production"
    echo ""
    echo "5. Click 'Create Web Service'"
    echo ""
    echo "✅ Your backend will be live at: https://YOUR_APP.onrender.com"
    ;;
    
  2)
    echo ""
    echo "🚂 Railway.app Deployment Steps:"
    echo "==============================="
    echo ""
    echo "1. Install Railway CLI:"
    echo "   npm install -g @railway/cli"
    echo ""
    echo "2. Login and deploy:"
    echo "   railway login"
    echo "   railway init"
    echo "   railway up"
    echo ""
    echo "3. Set environment variables:"
    echo "   railway variables set JWT_SECRET=$(openssl rand -base64 32)"
    echo "   railway variables set NODE_ENV=production"
    echo ""
    echo "✅ Your backend will be live at: https://YOUR_APP.railway.app"
    ;;
    
  3)
    echo ""
    echo "🔺 Heroku Deployment Steps:"
    echo "=========================="
    echo ""
    echo "1. Install Heroku CLI:"
    echo "   brew tap heroku/brew && brew install heroku"
    echo ""
    echo "2. Login and create app:"
    echo "   heroku login"
    echo "   heroku create frontendpitstop-backend"
    echo ""
    echo "3. Set environment variables:"
    echo "   heroku config:set JWT_SECRET=$(openssl rand -base64 32)"
    echo "   heroku config:set NODE_ENV=production"
    echo ""
    echo "4. Deploy:"
    echo "   git push heroku main"
    echo ""
    echo "✅ Your backend will be live at: https://frontendpitstop-backend.herokuapp.com"
    ;;
    
  4)
    echo ""
    echo "📖 Manual Deployment Instructions:"
    echo "=================================="
    echo ""
    echo "See DEPLOYMENT.md for detailed guides on:"
    echo "  • Render.com"
    echo "  • Railway.app"
    echo "  • Heroku"
    echo "  • Vercel"
    echo "  • DigitalOcean"
    echo ""
    echo "Each platform has step-by-step instructions."
    ;;
    
  *)
    echo "Invalid choice. Exiting."
    exit 1
    ;;
esac

echo ""
echo "🔐 Security Reminder:"
echo "===================="
echo "Don't forget to:"
echo "  1. Use a strong JWT_SECRET (random 32+ characters)"
echo "  2. Set NODE_ENV=production"
echo "  3. Update frontend NEXT_PUBLIC_API_URL"
echo ""
echo "📝 After deployment, update frontend/.env.local:"
echo "   NEXT_PUBLIC_API_URL=https://YOUR_BACKEND_URL/api"
echo ""

