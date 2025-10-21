const express = require('express');
const router = express.Router();
const db = require('../config/db');
const emailService = require('../services/emailService');

// Test endpoint to verify CORS
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Company API is working!', 
    timestamp: new Date().toISOString(),
    origin: req.headers.origin 
  });
});

// Company authentication middleware
const companyAuth = (req, res, next) => {
  const companyId = req.header('X-Company-ID');
  const companyPassword = req.header('X-Company-Password');
  
  // Simple authentication for demo
  if (companyId === 'hireog' && companyPassword === 'manasi22') {
    req.companyId = companyId;
    next();
  } else {
    res.status(401).json({ error: 'Invalid company credentials' });
  }
};

// Get company dashboard data
router.get('/dashboard', companyAuth, async (req, res) => {
  try {
    const companyId = req.companyId;
    
    console.log('Dashboard request from:', req.headers.origin);
    console.log('Company ID:', companyId);
    
    // Get candidates for this company from MongoDB
    const candidates = await db.getCandidatesByCompany(companyId);
    
    // Get interview drives for this company from MongoDB
    const drives = await db.getDrivesByCompany(companyId);
    
    console.log('Returning candidates:', candidates.length, 'drives:', drives.length);
    
    res.json({
      candidates: candidates,
      interviewDrives: drives,
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Add new candidate
router.post('/candidates', companyAuth, async (req, res) => {
  try {
    const { name, email, profile } = req.body;
    const companyId = req.companyId;
    
    if (!name || !email || !profile) {
      return res.status(400).json({ error: 'Name, email, and profile are required' });
    }
    
    // Check if candidate already exists in MongoDB
    const existingCandidates = await db.getCandidatesByCompany(companyId);
    const existingCandidate = existingCandidates.find(
      c => c.email === email
    );
    
    if (existingCandidate) {
      return res.status(400).json({ error: 'Candidate with this email already exists' });
    }
    
    // Add new candidate to MongoDB
    const candidate = {
      id: Date.now().toString(),
      companyId: companyId,
      name: name,
      email: email,
      profile: profile,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    await db.addCandidate(candidate);
    
    res.json({
      id: candidate.id,
      message: 'Candidate added successfully'
    });
  } catch (error) {
    console.error('Error adding candidate:', error);
    res.status(500).json({ error: 'Failed to add candidate' });
  }
});

// Update candidate
router.put('/candidates/:id', companyAuth, async (req, res) => {
  try {
    const candidateId = req.params.id;
    const { name, email, profile, status } = req.body;
    const companyId = req.companyId;
    
    // Update candidate in MongoDB
    const result = await db.updateCandidate(candidateId, {
      name: name,
      email: email,
      profile: profile,
      status: status
    });
    
    if (!result) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json({ message: 'Candidate updated successfully' });
  } catch (error) {
    console.error('Error updating candidate:', error);
    res.status(500).json({ error: 'Failed to update candidate' });
  }
});

// Delete candidate
router.delete('/candidates/:id', companyAuth, async (req, res) => {
  try {
    const candidateId = req.params.id;
    const companyId = req.companyId;
    
    // Delete candidate from MongoDB
    const result = await db.deleteCandidate(candidateId, companyId);
    
    if (!result) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    res.json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    res.status(500).json({ error: 'Failed to delete candidate' });
  }
});

// Create interview drive
router.post('/drives', companyAuth, async (req, res) => {
  try {
    const { name, candidateIds } = req.body;
    const companyId = req.companyId;
    
    if (!name || !candidateIds || candidateIds.length === 0) {
      return res.status(400).json({ error: 'Drive name and candidate selection are required' });
    }
    
    // Create interview drive
    const drive = {
      id: Date.now().toString(),
      companyId: companyId,
      name: name,
      status: 'draft',
      candidateIds: candidateIds,
      createdAt: new Date().toISOString()
    };
    
    // Add drive to MongoDB
    await db.addInterviewDrive(drive);
    
    res.json({
      id: drive.id,
      message: 'Interview drive created successfully'
    });
  } catch (error) {
    console.error('Error creating interview drive:', error);
    res.status(500).json({ error: 'Failed to create interview drive' });
  }
});

// Send interview links to candidates
router.post('/drives/:id/send-links', companyAuth, async (req, res) => {
  try {
    const driveId = req.params.id;
    const companyId = req.companyId;
    
    // Get drive from MongoDB
    const drives = await db.getDrivesByCompany(companyId);
    const drive = drives.find(d => d.id === driveId);
    
    if (!drive) {
      return res.status(404).json({ error: 'Interview drive not found' });
    }
    
    // Get candidates for this drive from MongoDB
    const allCandidates = await db.getCandidatesByCompany(companyId);
    const candidateIds = drive.candidates || drive.candidateIds || [];
    const candidates = allCandidates.filter(c => candidateIds.includes(c.id));
    
    // Generate interview tokens and links
    const interviewLinks = [];
    
    for (const candidate of candidates) {
      // Generate unique token for each candidate
      const token = Buffer.from(`${candidate.id}-${driveId}-${Date.now()}`).toString('base64');
      
      // Store token in MongoDB
      const tokenData = {
        id: Date.now().toString(),
        candidateId: candidate.id,
        driveId: driveId,
        token: token,
        used: false,
        createdAt: new Date().toISOString()
      };
      
      await db.addInterviewToken(tokenData);
      
      // Generate interview link with company parameters
      const interviewParams = new URLSearchParams({
        token: token,
        company: 'HireOG',
        profile: candidate.profile,
        level: 'intermediate', // Default level, can be made configurable
        candidateName: candidate.name,
        candidateEmail: candidate.email
      });
      const interviewLink = `${process.env.FRONTEND_URL || 'https://hireog.com'}/ai-interview?${interviewParams.toString()}`;
      interviewLinks.push({
        candidate: candidate,
        link: interviewLink
      });
      
      // Send email to candidate using the same service that works for OTP
      try {
        const emailResult = await emailService.sendInterviewInvite(
          candidate.email,
          candidate.name,
          interviewLink,
          'HireOG',
          drive.name
        );
        if (emailResult.success) {
          console.log(`Email sent to ${candidate.name} (${candidate.email})`);
        } else {
          console.error(`Failed to send email to ${candidate.email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error(`Failed to send email to ${candidate.email}:`, emailError);
        // Continue even if email fails
      }
    }
    
    // Update drive status to active in MongoDB
    await db.updateInterviewDrive(driveId, { status: 'active' });
    
    res.json({
      message: 'Interview links generated successfully',
      links: interviewLinks
    });
  } catch (error) {
    console.error('Error sending interview links:', error);
    res.status(500).json({ error: 'Failed to send interview links' });
  }
});

// Get interview drive details
router.get('/drives/:id', companyAuth, async (req, res) => {
  try {
    const driveId = req.params.id;
    const companyId = req.companyId;
    
    // Get drive from MongoDB
    const drives = await db.getDrivesByCompany(companyId);
    const drive = drives.find(d => d.id === driveId);
    
    if (!drive) {
      return res.status(404).json({ error: 'Interview drive not found' });
    }
    
    // Get candidates for this drive from MongoDB
    const allCandidates = await db.getCandidatesByCompany(companyId);
    const candidates = allCandidates.filter(c => drive.candidateIds.includes(c.id));
    
    res.json({
      drive: drive,
      candidates: candidates
    });
  } catch (error) {
    console.error('Error fetching drive details:', error);
    res.status(500).json({ error: 'Failed to fetch drive details' });
  }
});

// Get candidate interview data by token
router.get('/interview/:token', async (req, res) => {
  try {
    const token = req.params.token;
    
    // Get token data from MongoDB
    const tokenData = await db.getTokenData(token);
    
    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid interview token' });
    }
    
    // Get candidate and drive data from MongoDB
    const candidate = await db.getCandidateById(tokenData.candidateId);
    const drive = await db.getDriveById(tokenData.driveId);
    
    if (!candidate || !drive) {
      return res.status(404).json({ error: 'Candidate or drive not found' });
    }
    
    res.json({
      candidate: {
        name: candidate.name,
        email: candidate.email,
        profile: candidate.profile,
        companyName: 'HireOG',
        driveName: drive.name
      }
    });
  } catch (error) {
    console.error('Error fetching interview data:', error);
    res.status(500).json({ error: 'Failed to fetch interview data' });
  }
});

// Submit interview response
router.post('/interview/:token/submit', async (req, res) => {
  try {
    const token = req.params.token;
    const { candidateName, candidateEmail, profile, level, company, qaPairs, score, feedback, completedAt } = req.body;
    
    // Get token data from MongoDB
    const tokenData = await db.getTokenData(token);
    
    if (!tokenData) {
      return res.status(404).json({ error: 'Invalid interview token' });
    }
    
    if (tokenData.used) {
      return res.status(400).json({ error: 'Interview token has already been used' });
    }
    
    // Mark token as used in MongoDB
    await db.updateToken(token, { used: true, usedAt: new Date().toISOString() });
    
    // Store interview response in MongoDB
    const responseData = {
      id: Date.now().toString(),
      candidateId: tokenData.candidateId,
      driveId: tokenData.driveId,
      token: token,
      candidateName,
      candidateEmail,
      profile,
      level,
      company,
      qaPairs,
      score: score || 0,
      feedback: feedback || '',
      completedAt: completedAt || new Date().toISOString(),
      submittedAt: new Date().toISOString()
    };
    
    await db.addInterviewResponse(responseData);
    
    console.log('Interview response submitted:', responseData);
    
    res.json({ 
      message: 'Interview response submitted successfully',
      score: responseData.score,
      feedback: responseData.feedback
    });
  } catch (error) {
    console.error('Error submitting interview response:', error);
    res.status(500).json({ error: 'Failed to submit interview response' });
  }
});

module.exports = router;
