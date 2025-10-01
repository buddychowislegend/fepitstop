const mongoose = require('mongoose');

const systemDesignScenarioSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  steps: [{
    title: String,
    guidance: String,
    complete: {
      type: Boolean,
      default: false,
    },
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('SystemDesignScenario', systemDesignScenarioSchema);

