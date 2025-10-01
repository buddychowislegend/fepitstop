const express = require('express');
const router = express.Router();
const { quizQuestions } = require('../data/quizQuestions');

// Get all quiz questions
router.get('/', (req, res) => {
  res.json({ questions: quizQuestions });
});

// Get random quiz questions
router.get('/random/:count', (req, res) => {
  const count = Math.min(parseInt(req.params.count) || 5, quizQuestions.length);
  const shuffled = [...quizQuestions].sort(() => 0.5 - Math.random());
  res.json({ questions: shuffled.slice(0, count) });
});

module.exports = router;

