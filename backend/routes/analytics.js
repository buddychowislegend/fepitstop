const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Admin auth middleware
const adminAuth = (req, res, next) => {
  const adminKey = req.header('X-Admin-Key') || req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_KEY || 'admin_key_frontendpitstop_secure_2025';
  
  console.log('Analytics auth check:', {
    keyProvided: !!adminKey,
    keyLength: adminKey?.length || 0,
    expectedLength: expectedKey?.length || 0,
    keyPrefix: adminKey ? adminKey.substring(0, 10) + '...' : 'none',
    expectedPrefix: expectedKey ? expectedKey.substring(0, 10) + '...' : 'none',
    match: adminKey === expectedKey
  });
  
  if (!adminKey) {
    return res.status(401).json({ 
      error: 'Admin key required',
      hint: 'Provide X-Admin-Key header'
    });
  }
  
  if (adminKey !== expectedKey) {
    return res.status(401).json({ 
      error: 'Invalid admin key',
      debug: process.env.NODE_ENV === 'development' ? {
        providedLength: adminKey?.length,
        expectedLength: expectedKey?.length,
        keySource: process.env.ADMIN_KEY ? 'env var' : 'default'
      } : undefined
    });
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

// Get analytics summary (open access - no auth required)
router.get('/summary', async (req, res) => {
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
