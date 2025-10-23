const express = require('express');
const router = express.Router();
const db = require('../config/db');
const jwt = require('jsonwebtoken');

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authentication token' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all quiz questions
router.get('/', async (req, res) => {
  try {
    const questions = await db.getQuizQuestions();
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get random quiz questions
router.get('/random/:count', async (req, res) => {
  try {
    const count = Math.min(parseInt(req.params.count) || 5, 50);
    const profile = req.query.profile;
    const questions = await db.getRandomQuizQuestions(count, profile);
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit quiz completion
router.post('/complete', auth, async (req, res) => {
  try {
    const { score, totalQuestions, rating, timeSpent, answers } = req.body;
    
    if (score === undefined || !totalQuestions) {
      return res.status(400).json({ error: 'Score and totalQuestions are required' });
    }
    
    const quizCompletion = {
      userId: req.userId,
      score,
      totalQuestions,
      rating: rating || 0,
      timeSpent: timeSpent || 0,
      answers: answers || [],
      percentage: Math.round((score / totalQuestions) * 100)
    };
    
    const completion = await db.addQuizCompletion(quizCompletion);
    
    // Calculate updated rank
    const rankInfo = await db.calculateUserRank(req.userId);
    
    res.json({ 
      success: true,
      completion,
      rankInfo,
      message: 'Quiz completed successfully'
    });
  } catch (error) {
    console.error('Quiz completion error:', error);
    res.status(500).json({ error: 'Failed to save quiz completion' });
  }
});

// Get user's quiz history
router.get('/history', auth, async (req, res) => {
  try {
    const completions = await db.getUserQuizCompletions(req.userId);
    const stats = await db.getUserQuizStats(req.userId);
    
    res.json({ 
      completions,
      stats
    });
  } catch (error) {
    console.error('Quiz history error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
});

// Get user's quiz stats
router.get('/stats', auth, async (req, res) => {
  try {
    const stats = await db.getUserQuizStats(req.userId);
    res.json({ stats });
  } catch (error) {
    console.error('Quiz stats error:', error);
    res.status(500).json({ error: 'Failed to fetch quiz stats' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 100);
    const leaderboard = await db.getLeaderboard(limit);
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

module.exports = router;
