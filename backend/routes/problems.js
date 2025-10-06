const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all problems
router.get('/', async (req, res) => {
  try {
    const problems = await db.getProblems();
    console.log(`Problems API: Returning ${problems.length} problems`);
    res.json({ problems });
  } catch (error) {
    console.error('Problems API error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get problem by ID
router.get('/:id', async (req, res) => {
  try {
    const problem = await db.findProblemById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json({ problem });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
