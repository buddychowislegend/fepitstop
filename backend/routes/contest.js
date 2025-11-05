const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const ContestRegistration = require('../models/ContestRegistration');

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || '', {
      // Mongoose 6+ doesn't need these options
    });
    console.log('✅ Connected to MongoDB for contest registration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    throw error;
  }
};

// POST /api/contest/register - Register for the contest
router.post('/register', async (req, res) => {
  try {
    await connectDB();

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      currentRole,
      yearsOfExperience,
      primarySkills,
      highestEducation,
      linkedinProfile,
      participationReason,
      agreedToTerms,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !currentRole || !primarySkills || !participationReason || !agreedToTerms) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!Array.isArray(primarySkills) || primarySkills.length === 0) {
      return res.status(400).json({ error: 'At least one primary skill must be selected' });
    }

    // Check if email already exists
    const existingRegistration = await ContestRegistration.findOne({ email });
    if (existingRegistration) {
      return res.status(409).json({ error: 'Email already registered for this competition' });
    }

    // Create new registration
    const registration = new ContestRegistration({
      firstName,
      lastName,
      email,
      phoneNumber,
      currentRole,
      yearsOfExperience: yearsOfExperience || '',
      primarySkills,
      highestEducation: highestEducation || '',
      linkedinProfile: linkedinProfile || '',
      participationReason,
      agreedToTerms,
      status: 'pending',
    });

    await registration.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful! You will receive a confirmation email within 24 hours.',
      registrationId: registration._id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    res.status(500).json({ error: 'Failed to process registration. Please try again.' });
  }
});

// GET /api/contest/register - Check if email is already registered
router.get('/register', async (req, res) => {
  try {
    await connectDB();

    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ error: 'Email parameter required' });
    }

    const registration = await ContestRegistration.findOne({ email });
    if (!registration) {
      return res.json({ exists: false });
    }

    res.json({ exists: true, registration });
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
});

module.exports = router;

