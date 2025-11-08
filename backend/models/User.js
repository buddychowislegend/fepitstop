const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  mobile:{
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
    enum: ['frontend', 'product', 'business', 'qa', 'hr', 'backend'],
    default: 'frontend'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  solvedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
  }],
  streak: {
    type: Number,
    default: 0,
  },
  rank: {
    type: Number,
    default: 0,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
  },
});

module.exports = mongoose.model('User', userSchema);

