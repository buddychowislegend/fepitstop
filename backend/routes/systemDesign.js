const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all system design scenarios
router.get('/', async (req, res) => {
  try {
    const scenarios = await db.getSystemDesignScenarios();
    res.json({ scenarios });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get scenario by ID
router.get('/:id', async (req, res) => {
  try {
    const scenario = await db.findSystemDesignScenarioById(req.params.id);
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' });
    }
    res.json({ scenario });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
