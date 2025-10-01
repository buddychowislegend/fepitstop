const express = require('express');
const router = express.Router();
const db = require('../config/db');

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
    const questions = await db.getRandomQuizQuestions(count);
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
