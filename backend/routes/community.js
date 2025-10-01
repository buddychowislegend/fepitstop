const express = require('express');
const router = express.Router();
const { communitySolutions } = require('../data/communitySolutions');

// Get all community solutions
router.get('/', (req, res) => {
  res.json({ solutions: communitySolutions });
});

// Get solution by ID
router.get('/:id', (req, res) => {
  const solution = communitySolutions.find((s) => s.id === req.params.id);
  if (!solution) {
    return res.status(404).json({ error: 'Solution not found' });
  }
  res.json({ solution });
});

// Upvote a solution (in-memory for now)
router.post('/:id/upvote', (req, res) => {
  const solution = communitySolutions.find((s) => s.id === req.params.id);
  if (!solution) {
    return res.status(404).json({ error: 'Solution not found' });
  }
  solution.upvotes += 1;
  res.json({ solution });
});

module.exports = router;

