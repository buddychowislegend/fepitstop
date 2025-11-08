const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../config/db');
const { generateOTP, sendOTPEmail, sendWelcomeEmail, generateResetToken, sendPasswordResetEmail } = require('../services/emailService');

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Send OTP to email (Step 1 of signup)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validation
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    // Check if user already exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    await db.storeOTP(email, otp, { name, email });

    // Send OTP via email
    const emailResult = await sendOTPEmail(email, otp, name);

    res.status(200).json({
      message: 'OTP sent successfully to your email',
      email,
      emailSent: !emailResult.development
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP', details: error.message });
  }
});

// Verify OTP and Complete Signup (Step 2 of signup)
router.post('/verify-otp-and-signup', async (req, res) => {
  try {
    const { email, otp, password, profile } = req.body;

    // Validation
    if (!email || !otp || !password) {
      return res.status(400).json({ error: 'Email, OTP, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify OTP
    const userData = await db.verifyOTP(email, otp);
    if (!userData) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    // Check if user was created in the meantime
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.createUser({
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      profile: ['frontend','product','business','qa','hr','backend'].includes(profile) ? profile : 'frontend',
    });

    // Send welcome email
    await sendWelcomeEmail(email, userData.name);

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name, profile: user.profile, referralCode: user.referralCode },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Resend OTP
router.post('/resend-otp', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists. Please sign in.' });
    }

    // Generate new OTP (reuse name from previous attempt if available)
    const otp = generateOTP();
    await db.storeOTP(email, otp, { email, name: 'User' });

    // Send OTP
    const emailResult = await sendOTPEmail(email, otp);

    res.status(200).json({
      message: 'OTP resent successfully to your email',
      emailSent: !emailResult.development
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
});

// Sign Up (Original - kept for backward compatibility, but recommend using OTP flow)
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name, profile } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await db.createUser({
      email,
      name,
      password: hashedPassword,
      profile: ['frontend','product','business','qa','hr','backend'].includes(profile) ? profile : 'frontend',
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user.id, email: user.email, name: user.name, profile: user.profile, referralCode: user.referralCode },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Sign In
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password (handle both hashed and plain text passwords)
    let isValidPassword = false;
    
    // Check if password exists
    if (!user.password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Password is already hashed, use bcrypt.compare
      isValidPassword = await bcrypt.compare(password, user.password);
    } else {
      // Password is plain text (legacy/seeded data), compare directly
      isValidPassword = password === user.password;
    }
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email, name: user.name, profile: user.profile, referralCode: user.referralCode },
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Server error', details: error.message });
  }
});

// Get Current User
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update User Profile
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, bio } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    const user = await db.updateUser(req.userId, updates);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Change Password
router.put('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const user = await db.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.updateUser(req.userId, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete Account
router.delete('/account', verifyToken, async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'Password is required to delete account' });
    }

    const user = await db.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Delete user
    await db.deleteUser(req.userId);

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get User Activity History
router.get('/activity', verifyToken, async (req, res) => {
  try {
    const user = await db.findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ activities: user.activityHistory || [] });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Calculate and get user rank
router.post('/rank', verifyToken, async (req, res) => {
  try {
    const rankInfo = await db.calculateUserRank(req.userId);
    
    if (!rankInfo) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ rankInfo });
  } catch (error) {
    console.error('Rank calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate rank' });
  }
});

// Forgot password - Send reset link
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user exists
    const user = await db.findUserByEmail(email);
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.status(200).json({
        message: 'If an account exists with this email, you will receive a password reset link',
        emailSent: true
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    await db.storePasswordResetToken(email, resetToken);

    // Send reset email
    const emailResult = await sendPasswordResetEmail(email, resetToken, user.name);

    res.status(200).json({
      message: 'Password reset link sent to your email',
      email,
      emailSent: !emailResult.development
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request', details: error.message });
  }
});

// Verify reset token
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ error: 'Email and token are required' });
    }

    const resetData = await db.verifyPasswordResetToken(email, token);

    if (!resetData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.status(200).json({
      success: true,
      message: 'Token verified successfully'
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ error: 'Failed to verify token' });
  }
});

// Google Signup - Create user from Google OAuth
router.post('/google-signup', async (req, res) => {
  try {
    const { googleId, email, name, picture, profile = 'frontend' } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({ error: 'Google ID, email, and name are required' });
    }

    // Check if user already exists
    const existingUser = await db.findUserByEmail(email);
    if (existingUser) {
      // User exists, return existing user data
      const { password, ...userWithoutPassword } = existingUser;
      return res.json({
        success: true,
        user: userWithoutPassword,
        message: 'User already exists'
      });
    }

    // Create new user
    const userData = {
      id: googleId,
      email,
      name,
      picture,
      profile,
      password: null, // No password for Google users
      createdAt: new Date(),
      completedProblems: [],
      streak: 0,
      rank: 0,
      totalSolved: 0,
      achievements: [],
      activityHistory: []
    };

    const newUser = await db.createUser(userData);
    if (!newUser) {
      return res.status(500).json({ error: 'Failed to create user' });
    }

    const { password, ...userWithoutPassword } = newUser;
    res.status(201).json({
      success: true,
      user: userWithoutPassword,
      message: 'User created successfully'
    });
  } catch (error) {
    console.error('Google signup error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({ error: 'Email, token, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verify token
    const resetData = await db.verifyPasswordResetToken(email, token);
    if (!resetData) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Get user
    const user = await db.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await db.updateUser(user.id, { password: hashedPassword });

    // Delete reset token
    await db.deletePasswordResetToken(email);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: 'Failed to reset password', details: error.message });
  }
});

module.exports = router;
