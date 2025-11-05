const mongoose = require('mongoose');

const contestRegistrationSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  currentRole: {
    type: String,
    required: true,
    trim: true,
  },
  yearsOfExperience: {
    type: String,
    trim: true,
  },
  primarySkills: {
    type: [String],
    required: true,
    default: [],
  },
  highestEducation: {
    type: String,
    trim: true,
  },
  linkedinProfile: {
    type: String,
    trim: true,
  },
  participationReason: {
    type: String,
    required: true,
    trim: true,
  },
  agreedToTerms: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'rejected'],
    default: 'pending',
  },
});

// Create index on email for faster lookups
contestRegistrationSchema.index({ email: 1 });

module.exports = mongoose.model('ContestRegistration', contestRegistrationSchema);

