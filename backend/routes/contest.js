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
      linkedinProfile,
      participationReason,
      agreedToTerms,
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !phoneNumber || !currentRole) {
      return res.status(400).json({ error: 'Missing required fields' });
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
      linkedinProfile: linkedinProfile || '',
      participationReason: participationReason || '',
      agreedToTerms: agreedToTerms || false, // Optional field, default to false
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

// GET /api/contest/count - Get total registration count (1352 + database records)
router.get('/count', async (req, res) => {
  try {
    await connectDB();

    const dbCount = await ContestRegistration.countDocuments();
    const totalCount = 1352 + dbCount;

    res.json({ 
      count: totalCount,
      dbCount: dbCount,
      baseCount: 1352
    });
  } catch (error) {
    console.error('Get registration count error:', error);
    res.status(500).json({ error: 'Failed to fetch registration count' });
  }
});

module.exports = router;

