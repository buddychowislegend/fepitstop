const express = require('express');
const router = express.Router();
const { prepPlans } = require('../data/prepPlans');

// Get all prep plans
router.get('/', (req, res) => {
  res.json({ plans: prepPlans });
});

// Get plan by ID
router.get('/:id', (req, res) => {
  const plan = prepPlans.find((p) => p.id === req.params.id);
  if (!plan) {
    return res.status(404).json({ error: 'Plan not found' });
  }
  res.json({ plan });
});

module.exports = router;

