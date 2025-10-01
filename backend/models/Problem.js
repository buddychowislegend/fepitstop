const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  tags: [{
    type: String,
  }],
  prompt: {
    type: String,
    required: true,
  },
  starterHtml: {
    type: String,
    default: '',
  },
  starterCss: {
    type: String,
    default: '',
  },
  starterJs: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Problem', problemSchema);

