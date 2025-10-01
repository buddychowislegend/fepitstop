const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all prep plans
router.get('/', async (req, res) => {
  try {
    const plans = await db.getPrepPlans();
    res.json({ plans });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get plan by ID
router.get('/:id', async (req, res) => {
  try {
    const plan = await db.findPrepPlanById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    res.json({ plan });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
