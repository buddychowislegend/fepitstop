const express = require('express');
const router = express.Router();
const { systemDesignScenarios } = require('../data/systemDesignScenarios');

// Get all system design scenarios
router.get('/', (req, res) => {
  res.json({ scenarios: systemDesignScenarios });
});

// Get scenario by ID
router.get('/:id', (req, res) => {
  const scenario = systemDesignScenarios.find((s) => s.id === req.params.id);
  if (!scenario) {
    return res.status(404).json({ error: 'Scenario not found' });
  }
  res.json({ scenario });
});

module.exports = router;

