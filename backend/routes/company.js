const express = require('express');
const router = express.Router();
const db = require('../config/db');
const emailService = require('../services/emailService');

// In-memory storage for demo purposes
let companyData = {
  candidates: [],
  interviewDrives: [],
  interviewTokens: []
};

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
    
    // Get candidates for this company
    const candidates = companyData.candidates.filter(c => c.companyId === companyId);
    
    // Get interview drives for this company
    const drives = companyData.interviewDrives.filter(d => d.companyId === companyId);
    
    res.json({
      candidates: candidates,
      interviewDrives: drives
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
    
    // Check if candidate already exists
    const existingCandidate = companyData.candidates.find(
      c => c.email === email && c.companyId === companyId
    );
    
    if (existingCandidate) {
      return res.status(400).json({ error: 'Candidate with this email already exists' });
    }
    
    // Add new candidate
    const candidate = {
      id: Date.now().toString(),
      companyId: companyId,
      name: name,
      email: email,
      profile: profile,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    companyData.candidates.push(candidate);
    
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
    
    // Verify candidate belongs to this company
    const candidate = await db.query(
      'SELECT id FROM candidates WHERE id = ? AND company_id = ?',
      [candidateId, companyId]
    );
    
    if (candidate.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Update candidate
    await db.query(
      'UPDATE candidates SET name = ?, email = ?, profile = ?, status = ? WHERE id = ? AND company_id = ?',
      [name, email, profile, status, candidateId, companyId]
    );
    
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
    
    // Verify candidate belongs to this company
    const candidate = await db.query(
      'SELECT id FROM candidates WHERE id = ? AND company_id = ?',
      [candidateId, companyId]
    );
    
    if (candidate.length === 0) {
      return res.status(404).json({ error: 'Candidate not found' });
    }
    
    // Delete candidate
    await db.query(
      'DELETE FROM candidates WHERE id = ? AND company_id = ?',
      [candidateId, companyId]
    );
    
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
    const driveResult = await db.query(
      'INSERT INTO interview_drives (company_id, name, status, created_at) VALUES (?, ?, ?, NOW())',
      [companyId, name, 'draft']
    );
    
    const driveId = driveResult.insertId;
    
    // Add candidates to drive
    for (const candidateId of candidateIds) {
      await db.query(
        'INSERT INTO drive_candidates (drive_id, candidate_id) VALUES (?, ?)',
        [driveId, candidateId]
      );
    }
    
    res.json({
      id: driveId,
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
    
    // Verify drive belongs to this company
    const drive = await db.query(
      'SELECT * FROM interview_drives WHERE id = ? AND company_id = ?',
      [driveId, companyId]
    );
    
    if (drive.length === 0) {
      return res.status(404).json({ error: 'Interview drive not found' });
    }
    
    // Get candidates for this drive
    const candidates = await db.query(`
      SELECT c.* FROM candidates c
      JOIN drive_candidates dc ON c.id = dc.candidate_id
      WHERE dc.drive_id = ?
    `, [driveId]);
    
    // Generate interview tokens and send emails
    const interviewLinks = [];
    const emailResults = [];
    
    for (const candidate of candidates) {
      // Generate unique token for each candidate
      const token = Buffer.from(`${candidate.id}-${driveId}-${Date.now()}`).toString('base64');
      
      // Store token in database
      await db.query(
        'INSERT INTO interview_tokens (candidate_id, drive_id, token, created_at) VALUES (?, ?, ?, NOW())',
        [candidate.id, driveId, token]
      );
      
      const interviewLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/hiring/candidate-interview/${token}`;
      interviewLinks.push({
        candidate: candidate,
        link: interviewLink
      });
      
      // Send email to candidate with interview link
      try {
        const emailResult = await emailService.sendInterviewInvite(
          candidate.email,
          candidate.name,
          interviewLink,
          'HireOG', // This would come from company table
          drive[0].name
        );
        emailResults.push({
          candidate: candidate,
          emailSent: emailResult.success,
          error: emailResult.error
        });
      } catch (error) {
        console.error(`Failed to send email to ${candidate.email}:`, error);
        emailResults.push({
          candidate: candidate,
          emailSent: false,
          error: error.message
        });
      }
    }
    
    // Update drive status to active
    await db.query(
      'UPDATE interview_drives SET status = ?, updated_at = NOW() WHERE id = ?',
      ['active', driveId]
    );
    
    res.json({
      message: 'Interview links sent successfully',
      links: interviewLinks,
      emailResults: emailResults
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
    
    // Get drive details
    const drive = await db.query(
      'SELECT * FROM interview_drives WHERE id = ? AND company_id = ?',
      [driveId, companyId]
    );
    
    if (drive.length === 0) {
      return res.status(404).json({ error: 'Interview drive not found' });
    }
    
    // Get candidates for this drive
    const candidates = await db.query(`
      SELECT c.* FROM candidates c
      JOIN drive_candidates dc ON c.id = dc.candidate_id
      WHERE dc.drive_id = ?
    `, [driveId]);
    
    res.json({
      drive: drive[0],
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
    
    // Get candidate data from token
    const tokenData = await db.query(`
      SELECT c.*, id.name as drive_name, id.company_id
      FROM interview_tokens it
      JOIN candidates c ON it.candidate_id = c.id
      JOIN interview_drives id ON it.drive_id = id.id
      WHERE it.token = ?
    `, [token]);
    
    if (tokenData.length === 0) {
      return res.status(404).json({ error: 'Invalid interview token' });
    }
    
    const candidate = tokenData[0];
    
    res.json({
      candidate: {
        name: candidate.name,
        email: candidate.email,
        profile: candidate.profile,
        companyName: 'HireOG', // This would come from company table
        driveName: candidate.drive_name
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
    const { answers } = req.body;
    
    // Get candidate data from token
    const tokenData = await db.query(`
      SELECT c.id as candidate_id, it.drive_id
      FROM interview_tokens it
      JOIN candidates c ON it.candidate_id = c.id
      WHERE it.token = ?
    `, [token]);
    
    if (tokenData.length === 0) {
      return res.status(404).json({ error: 'Invalid interview token' });
    }
    
    const { candidate_id, drive_id } = tokenData[0];
    
    // Store interview response
    await db.query(
      'INSERT INTO interview_responses (candidate_id, drive_id, answers, submitted_at) VALUES (?, ?, ?, NOW())',
      [candidate_id, drive_id, JSON.stringify(answers)]
    );
    
    res.json({ message: 'Interview response submitted successfully' });
  } catch (error) {
    console.error('Error submitting interview response:', error);
    res.status(500).json({ error: 'Failed to submit interview response' });
  }
});

// Create AI-generated screening
router.post('/screenings', companyAuth, async (req, res) => {
  try {
    const { 
      name, 
      positionTitle, 
      language, 
      mustHaves, 
      goodToHaves, 
      culturalFit, 
      estimatedTime, 
      status 
    } = req.body;
    const companyId = req.companyId;
    
    if (!name || !positionTitle) {
      return res.status(400).json({ error: 'Name and position title are required' });
    }
    
    // Create screening in database
    const screeningData = {
      companyId: companyId,
      name: name,
      positionTitle: positionTitle,
      language: language || 'en-us',
      mustHaves: mustHaves || [],
      goodToHaves: goodToHaves || [],
      culturalFit: culturalFit || [],
      estimatedTime: estimatedTime || { mustHaves: 4, goodToHaves: 2, culturalFit: 2 },
      status: status || 'draft',
      createdAt: new Date().toISOString()
    };
    
    // For now, store in the in-memory data structure
    // In production, this would be stored in a proper database
    const screeningId = Date.now().toString();
    const screening = {
      id: screeningId,
      ...screeningData
    };
    
    // Add to companyData (in production, this would be a database insert)
    if (!companyData.screenings) {
      companyData.screenings = [];
    }
    companyData.screenings.push(screening);
    
    res.json({
      id: screeningId,
      message: 'Screening created successfully',
      screening: screening
    });
  } catch (error) {
    console.error('Error creating screening:', error);
    res.status(500).json({ error: 'Failed to create screening' });
  }
});

// Get company screenings
router.get('/screenings', companyAuth, async (req, res) => {
  try {
    const companyId = req.companyId;
    
    // Get screenings for this company
    const screenings = (companyData.screenings || []).filter(s => s.companyId === companyId);
    
    res.json({
      screenings: screenings,
      message: 'Screenings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching screenings:', error);
    res.status(500).json({ error: 'Failed to fetch screenings' });
  }
});

module.exports = router;
