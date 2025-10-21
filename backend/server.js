const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const problemsRoutes = require('./routes/problems');
const prepPlansRoutes = require('./routes/prepPlans');
const quizRoutes = require('./routes/quiz');
const communityRoutes = require('./routes/community');
const systemDesignRoutes = require('./routes/systemDesign');
const submissionsRoutes = require('./routes/submissions');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const companyRoutes = require('./routes/company-simple');
// const paymentRoutes = require('./routes/payment'); // Temporarily disabled - causing mongoose conflicts

// AI Interview - Temporarily disabled to fix server crash
// const aiInterviewRoutes = require('./routes/ai-interview');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize serverless data if needed
const db = require('./config/db');

// Initialize MongoDB data (async, but don't block server startup)
(async () => {
  try {
    await db.initializeServerlessData();
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('⚠️ Database initialization error:', error.message);
  }
})();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Force-open CORS to unblock production requests
    const allowAll = true;
    const staticAllowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://fepitstop.onrender.com',
      'https://fepit.vercel.app',
      'https://hireog.vercel.app',
      'https://hireog.com',
      'https://www.hireog.com'
    ];

    if (allowAll) return callback(null, true);
    if (!origin) return callback(null, true); // same-origin/non-browser tools
    if (staticAllowed.includes(origin)) return callback(null, true);

    try {
      const { hostname, protocol } = new URL(origin);
      // Allow any vercel.app subdomain
      if (hostname.endsWith('.vercel.app')) return callback(null, true);
      // Allow any *.hireog.com subdomain
      if (hostname === 'hireog.com' || hostname.endsWith('.hireog.com')) return callback(null, true);
      // Allow localhost any port
      if ((hostname === 'localhost' || hostname === '127.0.0.1') && (protocol === 'http:' || protocol === 'https:')) return callback(null, true);
    } catch (e) {
      console.warn('CORS origin parse failed:', e?.message);
    }

    console.warn('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'authorization', 'Accept', 'Origin', 'X-Requested-With', 'X-Admin-Key', 'x-admin-key', 'X-Company-ID', 'X-Company-Password', 'x-company-id', 'x-company-password']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemsRoutes);
app.use('/api/prep-plans', prepPlansRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/system-design', systemDesignRoutes);
app.use('/api/submissions', submissionsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
// Handle CORS preflight for company routes
app.options('/api/company/*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Company-ID, X-Company-Password');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

app.use('/api/company', companyRoutes);
// app.use('/api/payment', paymentRoutes); // Temporarily disabled - causing mongoose conflicts

// AI Interview
try {
  const aiInterviewRoutes = require('./routes/ai-interview');
  app.use('/api/ai-interview', aiInterviewRoutes);
  console.log('✅ AI Interview routes enabled');
} catch (e) {
  console.warn('⚠️ Failed to enable AI Interview routes:', e?.message);
}

app.get('/api/health', async (req, res) => {
  try {
    const db = require('./config/db');
    const dbData = await db.read();
    
    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentUsers = (dbData.users || [])
      .filter(u => new Date(u.createdAt) > sevenDaysAgo)
      .map(u => ({
        name: u.name,
        email: u.email,
        createdAt: u.createdAt,
        solvedCount: u.completedProblems?.length || 0
      }));
    
    res.json({ 
      status: 'ok', 
      message: 'Backend is running',
      database: {
        type: db.isServerless ? 'MongoDB Atlas (permanent)' : 'file-system',
        path: db.filePath,
        problems: dbData.problems?.length || 0,
        users: dbData.users?.length || 0,
        submissions: dbData.submissions?.length || 0,
        recentUsers: recentUsers.length,
        recentUsersList: recentUsers
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
});

