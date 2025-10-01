const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all community solutions
router.get('/', async (req, res) => {
  try {
    const solutions = await db.getCommunitySolutions();
    res.json({ solutions });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get solution by ID
router.get('/:id', async (req, res) => {
  try {
    const solution = await db.findCommunitySolutionById(req.params.id);
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }
    res.json({ solution });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Upvote a solution
router.post('/:id/upvote', async (req, res) => {
  try {
    const solution = await db.upvoteCommunitySolution(req.params.id);
    if (!solution) {
      return res.status(404).json({ error: 'Solution not found' });
    }
    res.json({ solution });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
