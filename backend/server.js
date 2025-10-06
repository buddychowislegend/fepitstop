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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    const staticAllowed = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'https://fepitstop.onrender.com',
      'https://frontendpitstop.vercel.app'
    ];

    if (!origin) return callback(null, true); // allow non-browser tools / same-origin
    if (staticAllowed.includes(origin)) return callback(null, true);

    try {
      const { hostname } = new URL(origin);
      // Allow Vercel preview deployments of your frontend (e.g., https://frontendpitstop-<hash>-vercel.app)
      if (hostname.endsWith('.vercel.app')) return callback(null, true);
    } catch (_) {}

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

app.listen(PORT, () => {
  console.log(`✓ Backend server running on http://localhost:${PORT}`);
});

