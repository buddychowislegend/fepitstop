const mongoose = require('mongoose');

const communitySolutionSchema = new mongoose.Schema({
  problemTitle: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  upvotes: {
    type: Number,
    default: 0,
  },
  snippet: {
    type: String,
    required: true,
  },
  tags: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('CommunitySolution', communitySolutionSchema);

