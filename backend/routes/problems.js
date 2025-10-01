const express = require('express');
const router = express.Router();
const { problems } = require('../data/problems');

// Get all problems
router.get('/', (req, res) => {
  res.json({ problems });
});

// Get problem by ID
router.get('/:id', (req, res) => {
  const problem = problems.find((p) => p.id === req.params.id);
  if (!problem) {
    return res.status(404).json({ error: 'Problem not found' });
  }
  res.json({ problem });
});

module.exports = router;

