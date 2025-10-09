const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Simple admin authentication (you should enhance this with proper admin roles)
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_KEY || 'admin_key_frontendpitstop_secure_2025';
  
  if (adminKey !== expectedKey) {
    console.log('Admin auth failed:', { 
      provided: adminKey ? 'key provided' : 'no key', 
      expected: expectedKey ? 'key configured' : 'no key configured',
      providedKey: adminKey ? adminKey.substring(0, 10) + '...' : 'none',
      expectedKey: expectedKey ? expectedKey.substring(0, 10) + '...' : 'none'
    });
    return res.status(403).json({ 
      error: 'Unauthorized',
      hint: 'Provide X-Admin-Key header',
      debug: process.env.NODE_ENV === 'development' ? {
        providedLength: adminKey?.length || 0,
        expectedLength: expectedKey?.length || 0
      } : undefined
    });
  }
  next();
};

// Check admin key configuration (for debugging)
router.get('/check-key', (req, res) => {
  const expectedKey = process.env.ADMIN_KEY || 'admin_key_frontendpitstop_secure_2025';
  res.json({
    keyConfigured: !!process.env.ADMIN_KEY,
    keySource: process.env.ADMIN_KEY ? 'environment variable' : 'default fallback',
    keyPrefix: expectedKey.substring(0, 15) + '...',
    keyLength: expectedKey.length,
    hint: 'Use this key with X-Admin-Key header'
  });
});

// Get all users (admin only)
router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await db.getUsers();
    
    // Remove sensitive data
    const sanitizedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      totalSolved: user.completedProblems?.length || 0,
      streak: user.streak || 0,
      rank: user.rank || 0,
      lastActive: user.lastActive || user.createdAt
    }));
    
    res.json({ 
      users: sanitizedUsers,
      total: sanitizedUsers.length,
      storage: {
        type: db.isServerless ? 'serverless-ephemeral' : 'persistent',
        path: db.filePath
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get database stats (admin only)
router.get('/stats', adminAuth, async (req, res) => {
  try {
    const dbData = await db.read();
    
    const stats = {
      users: {
        total: dbData.users?.length || 0,
        recentSignups: (dbData.users || [])
          .filter(u => {
            const createdDate = new Date(u.createdAt);
            const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
            return createdDate > fiveDaysAgo;
          })
          .length
      },
      problems: dbData.problems?.length || 0,
      submissions: dbData.submissions?.length || 0,
      quizQuestions: dbData.quizQuestions?.length || 0,
      prepPlans: dbData.prepPlans?.length || 0,
      storage: {
        type: process.env.MONGODB_URI ? 'MongoDB Atlas (permanent)' : 'File-based',
        path: db.filePath,
        status: process.env.MONGODB_URI ? '✅ Permanent storage' : '⚠️ Development only'
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get recent users (admin only)
router.get('/users/recent', adminAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 5;
    const users = await db.getUsers();
    
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentUsers = users
      .filter(u => new Date(u.createdAt) > cutoffDate)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
        totalSolved: user.completedProblems?.length || 0
      }));
    
    res.json({ 
      users: recentUsers,
      count: recentUsers.length,
      period: `Last ${days} days`
    });
  } catch (error) {
    console.error('Recent users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Seed database (admin only) - For MongoDB initialization
router.post('/seed', adminAuth, async (req, res) => {
  try {
    const problemsArray = require('../data/comprehensive-problems');
    const { prepPlans } = require('../data/prepPlans');
    const { quizQuestions } = require('../data/quizQuestions');
    const { communitySolutions } = require('../data/communitySolutions');
    const { systemDesignScenarios } = require('../data/systemDesignScenarios');
    
    await db.seed({
      problems: problemsArray,
      prepPlans,
      quizQuestions,
      communitySolutions,
      systemDesignScenarios
    });
    
    res.json({ 
      success: true,
      message: 'Database seeded successfully',
      seeded: {
        problems: problemsArray.length,
        prepPlans: prepPlans.length,
        quizQuestions: quizQuestions.length,
        communitySolutions: communitySolutions.length,
        systemDesignScenarios: systemDesignScenarios.length
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ error: 'Failed to seed database', details: error.message });
  }
});

module.exports = router;
