const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Submit a solution
router.post('/submit', verifyToken, async (req, res) => {
  try {
    const { problemId, solution, language = 'javascript', testResults } = req.body;

    if (!problemId || !solution) {
      return res.status(400).json({ error: 'Problem ID and solution are required' });
    }

    // Get the problem to verify it exists
    const problem = await db.findProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Create submission
    const submission = {
      id: Date.now().toString(),
      userId: req.userId,
      problemId,
      solution,
      language,
      testResults: testResults || [],
      submittedAt: new Date().toISOString(),
      status: 'completed'
    };

    // Add submission to database
    await db.addSubmission(submission);

    // Update user's completed problems
    await db.addUserCompletedProblem(req.userId, problemId);

    // Add activity to user's history
    await db.addUserActivity(req.userId, {
      type: 'problem_completed',
      problemId,
      problemTitle: problem.title,
      timestamp: new Date().toISOString()
    });

    res.json({ 
      success: true, 
      message: 'Solution submitted successfully',
      submission: {
        id: submission.id,
        status: submission.status,
        submittedAt: submission.submittedAt
      }
    });

  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({ error: 'Failed to submit solution' });
  }
});

// Get user's submissions for a problem
router.get('/problem/:problemId', verifyToken, async (req, res) => {
  try {
    const { problemId } = req.params;
    const submissions = await db.getUserSubmissions(req.userId, problemId);
    res.json({ submissions });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ error: 'Failed to get submissions' });
  }
});

// Get all user's submissions
router.get('/user', verifyToken, async (req, res) => {
  try {
    const submissions = await db.getUserSubmissions(req.userId);
    res.json({ submissions });
  } catch (error) {
    console.error('Get user submissions error:', error);
    res.status(500).json({ error: 'Failed to get user submissions' });
  }
});

// Check if user has completed a problem
router.get('/completed/:problemId', verifyToken, async (req, res) => {
  try {
    const { problemId } = req.params;
    
    // Check if user has any submissions for this problem
    const submissions = await db.getUserSubmissions(req.userId, problemId);
    const isCompleted = submissions.length > 0;
    
    res.json({ completed: isCompleted });
  } catch (error) {
    console.error('Check completion error:', error);
    res.status(500).json({ error: 'Failed to check completion status' });
  }
});

module.exports = router;
