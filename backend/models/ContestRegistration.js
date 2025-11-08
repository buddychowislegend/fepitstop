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
  city: {
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
  // Primary skills removed from required fields (now omitted)
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
    required: false,
    trim: true,
  },
  agreedToTerms: {
    type: Boolean,
    required: false,
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
  referredByCode: {
    type: String,
    trim: true,
    uppercase: true,
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    uppercase: true,
  },
});

// Create index on email for faster lookups
contestRegistrationSchema.index({ email: 1 });
contestRegistrationSchema.index({ referredByCode: 1 });
contestRegistrationSchema.index({ referralCode: 1 });

module.exports = mongoose.model('ContestRegistration', contestRegistrationSchema);

