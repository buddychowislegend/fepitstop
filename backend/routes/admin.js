const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Simple admin authentication (you should enhance this with proper admin roles)
const adminAuth = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

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
    const dbData = db.read();
    
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
        isServerless: db.isServerless,
        path: db.filePath,
        warning: db.isServerless ? 'Data resets on each deployment (ephemeral storage)' : 'Persistent storage'
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

module.exports = router;
