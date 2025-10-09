const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin auth middleware
const adminAuth = (req, res, next) => {
  const adminKey = req.header('X-Admin-Key');
  const expectedKey = process.env.ADMIN_KEY || 'admin_key_frontendpitstop_secure_2025';
  
  if (!adminKey) {
    return res.status(401).json({ error: 'Admin key required' });
  }
  
  if (adminKey !== expectedKey) {
    return res.status(401).json({ error: 'Invalid admin key' });
  }
  
  next();
};

// Track page view
router.post('/track', async (req, res) => {
  try {
    const { path, sessionId, timeSpent, referrer, userAgent } = req.body;
    
    if (!path || !sessionId) {
      return res.status(400).json({ error: 'Path and sessionId are required' });
    }
    
    const pageView = await db.trackPageView({
      path,
      sessionId,
      timeSpent: timeSpent || 0,
      referrer: referrer || null,
      userAgent: userAgent || null
    });
    
    res.json({ success: true, pageView });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    res.status(500).json({ error: 'Failed to track page view' });
  }
});

// Get analytics summary (admin only)
router.get('/summary', adminAuth, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 7;
    const summary = await db.getAnalyticsSummary(days);
    
    res.json({ summary });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Failed to get analytics summary' });
  }
});

// Get detailed analytics (admin only)
router.get('/detailed', adminAuth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const analytics = await db.getAnalytics(startDate, endDate);
    
    res.json({ analytics, count: analytics.length });
  } catch (error) {
    console.error('Analytics detailed error:', error);
    res.status(500).json({ error: 'Failed to get detailed analytics' });
  }
});

// Get public stats (limited info, no auth required)
router.get('/public', async (req, res) => {
  try {
    const summary = await db.getAnalyticsSummary(7);
    
    // Return only public-safe metrics
    res.json({
      totalViews: summary.totalViews,
      uniqueVisitors: summary.uniqueVisitors,
      topPages: summary.topPages.slice(0, 5).map(p => ({
        path: p.path,
        views: p.views
      }))
    });
  } catch (error) {
    console.error('Public analytics error:', error);
    res.status(500).json({ error: 'Failed to get public analytics' });
  }
});

module.exports = router;
